/*==============================================================================
  FxCopyPasteTool.jsx
  AE: 指定レイヤー/エフェクトから値・キー・式をコピーし、
  スコープ内の同種へ一括貼付。異種は確認→一括置換（削除→追加→適用）。
  ・コピー未実行で貼付実行時: 選択エフェクト種を削除
  Tested: After Effects 2022+ (ExtendScript / ScriptUI)
==============================================================================*/
(function () {
    // ---------------- ユーティリティ ----------------
    function isComp(x){return x && x instanceof CompItem;}
    function getActiveComp(){var c=app.project.activeItem;return isComp(c)?c:null;}
    function stripSuffixNum(n){return String(n).replace(/\s+\d+$/,"");}
    function eachComp(fn){var p=app.project;if(!p)return;for(var i=1;i<=p.numItems;i++)if(isComp(p.item(i)))fn(p.item(i));}
    function getLayers(c){var a=[];for(var i=1;i<=c.numLayers;i++)a.push(c.layer(i));return a;}

    // Effect Parade 直下の“エフェクト本体”だけ列挙（グループは潜らない）
    function getEffects(ly){
        var a=[]; try{
            var parade=ly.property("ADBE Effect Parade"); if(!parade) return a;
            for(var i=1;i<=parade.numProperties;i++){
                var e=parade.property(i);
                // エフェクト本体は group だが matchName を持つ
                if(e && e.matchName) a.push(e);
            }
        }catch(e){}
        return a;
    }

    // ---------------- クリップボード ----------------
    function isWin(){return $.os.toLowerCase().indexOf("windows")>=0;}
    function tmp(){return Folder.temp.fsName;}
    function writeFile(path,txt){var f=new File(path);f.encoding="UTF-8";if(!f.open("w"))return false;f.write(txt);f.close();return true;}
    function writeClipboard(txt){
        try{
            if(isWin()){
                var p=tmp()+"/fxclip.txt";writeFile(p,txt);
                system.callSystem('cmd.exe /c type "'+p+'" | clip');
            }else{
                var p2=tmp()+"/fxclip.txt";writeFile(p2,txt);
                system.callSystem('/bin/cat "'+p2+'" | /usr/bin/pbcopy');
            }
            return true;
        }catch(e){return false;}
    }
    function readClipboard(){
        try{
            if(isWin()){
                var cmd='powershell -NoProfile -Command "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;Get-Clipboard -Raw"';
                return system.callSystem(cmd)||"";
            }else{
                return system.callSystem("/usr/bin/pbpaste")||"";
            }
        }catch(e){return "";}
    }

    // ---------------- 値・キー収集（path方式） ----------------
    function safeGetExpressionInfo(p){
        var info=null;
        try{
            var canExpr=false;
            try{ canExpr = (typeof p.canSetExpression!=="undefined") ? p.canSetExpression : true; }catch(e){}
            if(!canExpr) return null;
            var en=false, ex="";
            try{ en = !!p.expressionEnabled; }catch(e){}
            try{ ex = String(p.expression); }catch(e){}
            info={enabled:en,value:ex};
        }catch(e){}
        return info;
    }
    function readKeys(p){
        var out=[];
        try{
            var n=p.numKeys||0;
            for(var k=1;k<=n;k++){
                var it={};
                try{it.t=p.keyTime(k);}catch(e){}
                try{it.v=p.keyValue(k);}catch(e){}
                try{it.inInterp=p.keyInInterpolationType(k);it.outInterp=p.keyOutInterpolationType(k);}catch(e){}
                try{it.easeIn=p.keyInTemporalEase(k);it.easeOut=p.keyOutTemporalEase(k);}catch(e){}
                try{it.autoBezier=p.keyTemporalAutoBezier(k);}catch(e){}
                try{it.continuous=p.keyTemporalContinuous(k);}catch(e){}
                try{it.roving=p.keyRoving(k);}catch(e){}
                try{it.sIn=p.keyInSpatialTangent(k);it.sOut=p.keyOutSpatialTangent(k);}catch(e){}
                out.push(it);
            }
        }catch(e){}
        return out;
    }
    function collectValuesAndKeys(eff){
        var snap={
            effectMatchName:eff.matchName,
            effectDisplayName:stripSuffixNum(eff.name),
            items:[] // [{path:[indices...], matchName, value, keys[], expr}]
        };
        function walk(group, path){
            var n=group.numProperties||0;
            for(var i=1;i<=n;i++){
                var p=group.property(i); if(!p) continue;
                var curPath=path.concat([i]);
                if(p.propertyType===PropertyType.PROPERTY){
                    var entry={path:curPath, matchName:p.matchName, value:undefined, keys:[], expr:null};
                    try{ entry.value = p.value; }catch(e){}
                    entry.keys = readKeys(p);
                    entry.expr = safeGetExpressionInfo(p);
                    snap.items.push(entry);
                }else if(p.propertyType===PropertyType.NAMED_GROUP || p.propertyType===PropertyType.INDEXED_GROUP){
                    walk(p, curPath);
                }
            }
        }
        walk(eff, []);
        return snap;
    }

    // ---------------- プロパティ適用（path方式） ----------------
    function navByPath(root, path){
        var cur=root;
        for(var i=0;i<path.length;i++){
            var idx=path[i];
            if(!cur || typeof cur.numProperties==="undefined") return null;
            try{ cur=cur.property(idx); }catch(e){ return null; }
        }
        return cur;
    }
    function clearAllKeys(p){ try{ for(var i=p.numKeys;i>=1;i--) p.removeKey(i); }catch(e){} }
    function setValueSafe(p, v){
        try{
            if(v===undefined) return;
            if(p.value instanceof Array){
                if(v instanceof Array && p.value.length===v.length) p.setValue(v);
            }else{
                p.setValue(v);
            }
        }catch(e){}
    }
    function applyEntry(p, entry){
        if(!p) return;
        try{ p.expressionEnabled=false; }catch(e){}
        if(entry.keys && entry.keys.length>0){
            clearAllKeys(p);
            for(var i=0;i<entry.keys.length;i++){
                var it=entry.keys[i];
                if(typeof it.t!=="number") continue;
                var k=p.addKey(it.t);
                try{ p.setValueAtKey(k, it.v); }catch(e){}
                try{ p.setTemporalEaseAtKey(k, it.easeIn, it.easeOut); }catch(e){}
                try{ p.setInterpolationTypeAtKey(k, it.inInterp, it.outInterp); }catch(e){}
                try{ if(typeof it.roving!=="undefined") p.setRovingAtKey(k, !!it.roving); }catch(e){}
                try{ if(typeof it.sIn!=="undefined") p.setSpatialTangentsAtKey(k, it.sIn, it.sOut);}catch(e){}
                try{ if(typeof it.autoBezier!=="undefined") p.setTemporalAutoBezierAtKey(k, !!it.autoBezier);}catch(e){}
                try{ if(typeof it.continuous!=="undefined") p.setTemporalContinuousAtKey(k, !!it.continuous);}catch(e){}
            }
        }else{
            setValueSafe(p, entry.value);
        }
        if(entry.expr && typeof entry.expr.value!=="undefined"){
            try{ p.expression = entry.expr.value; p.expressionEnabled = !!entry.expr.enabled; }catch(e){}
        }
    }
    function applySnapshotToEffect(eff, snap){
        var count=0;
        for(var i=0;i<snap.items.length;i++){
            var ent=snap.items[i];
            var p=navByPath(eff, ent.path);
            if(!p) continue;
            applyEntry(p, ent);
            count++;
        }
        return count;
    }

    // ---------------- スコープ別レイヤ一覧 ----------------
    function buildLayerListByScope(scope){
        var layers=[];
        if(scope==="project"){ eachComp(function(c){ layers=layers.concat(getLayers(c)); }); }
        else if(scope==="compsel"){
            var sel=app.project.selection;
            for(var s=0;s<sel.length;s++) if(isComp(sel[s])) layers=layers.concat(getLayers(sel[s]));
        }else if(scope==="layersel"){
            var cc=getActiveComp(); if(cc) layers=cc.selectedLayers;
        }
        return layers;
    }

    // ---------------- 同種貼付 / 異種置換 / 削除 ----------------
    function applySameKind(snapshot,scope,node){
        if(!snapshot||!node)return{targets:0,props:0,locked:0};
        var targetKey=node.matchName;
        var layers=buildLayerListByScope(scope);
        var tN=0,pN=0,lck=0;
        for(var i=0;i<layers.length;i++){
            var ly=layers[i], wasLocked=false;
            try{ wasLocked=!!ly.locked; if(wasLocked) ly.locked=false; }catch(e){}
            try{
                var fx=getEffects(ly);
                for(var j=0;j<fx.length;j++){
                    var eff=fx[j];
                    if(eff.matchName!==targetKey) continue;
                    tN++; pN += applySnapshotToEffect(eff, snapshot);
                }
            }catch(e){} finally{
                try{ if(wasLocked) ly.locked=true; }catch(e){}
                if(wasLocked) lck++;
            }
        }
        return{targets:tN,props:pN,locked:lck};
    }

    // parade内の targetKey のpropertyIndexを毎回“現在の状態”から全収集
    function collectIndices(parade, targetKey){
        var idxs=[];
        try{
            for(var i=1;i<=parade.numProperties;i++){
                var e=parade.property(i);
                if(e && e.matchName===targetKey) idxs.push(i);
            }
        }catch(e){}
        return idxs;
    }

    function replaceAndApply(snapshot,scope,node){
        if(!snapshot||!node)return{replaced:0,props:0,addFail:0,locked:0};
        var targetKey=node.matchName;
        var layers=buildLayerListByScope(scope);
        var repN=0,pN=0,addFail=0,lck=0;

        for(var i=0;i<layers.length;i++){
            var ly=layers[i], wasLocked=false;
            try{ wasLocked=!!ly.locked; if(wasLocked) ly.locked=false; }catch(e){}
            try{
                var parade=ly.property("ADBE Effect Parade"); if(!parade) continue;

                // ★ 重要: 現在の状態から都度全収集→降順確定
                var idxList=collectIndices(parade, targetKey);
                for(var k=idxList.length-1;k>=0;k--){
                    var idx=idxList[k];
                    var oldEff=parade.property(idx); if(!oldEff) continue;
                    repN++;
                    try{ oldEff.remove(); }catch(e){}

                    var newEff=null;
                    try{ newEff=parade.addProperty(snapshot.effectMatchName); }catch(e){ newEff=null; }
                    if(!newEff){ addFail++; continue; }
                    try{ newEff.moveTo(idx); }catch(e){}
                    pN += applySnapshotToEffect(newEff, snapshot);
                }
            }catch(e){} finally{
                try{ if(wasLocked) ly.locked=true; }catch(e){}
                if(wasLocked) lck++;
            }
        }
        return{replaced:repN,props:pN,addFail:addFail,locked:lck};
    }

    function removeEffectsByNode(scope, node){
        if(!node) return {removed:0,locked:0};
        var targetKey=node.matchName;
        var layers=buildLayerListByScope(scope);
        var removed=0,lck=0;

        for(var i=0;i<layers.length;i++){
            var ly=layers[i], wasLocked=false;
            try{ wasLocked=!!ly.locked; if(wasLocked) ly.locked=false; }catch(e){}
            try{
                var parade=ly.property("ADBE Effect Parade"); if(!parade) continue;
                var idxList=collectIndices(parade, targetKey);
                for(var k=idxList.length-1;k>=0;k--){
                    var idx=idxList[k];
                    var eff=parade.property(idx);
                    if(!eff) continue;
                    try{ eff.remove(); removed++; }catch(e){}
                }
            }catch(e){} finally{
                try{ if(wasLocked) ly.locked=true; }catch(e){}
                if(wasLocked) lck++;
            }
        }
        return {removed:removed,locked:lck};
    }

    // ---------------- UI ----------------
    var w=(this instanceof Panel)?this:new Window("palette","FxCopyPasteTool",undefined,{resizeable:true});
    w.orientation="column";w.alignChildren=["fill","top"];w.margins=8;

    var grpC=w.add("panel",undefined,"コピー用");
    grpC.orientation="column";grpC.alignChildren=["fill","top"];grpC.margins=8;
    var btnGet=grpC.add("button",undefined,"取得（レイヤー再読み込み）");
    var cbLayer=grpC.add("dropdownlist",undefined,[]);
    var cbEffect=grpC.add("dropdownlist",undefined,[]);
    var btnCopy=grpC.add("button",undefined,"このエフェクトをコピー");

    var grpP=w.add("panel",undefined,"ペースト用");
    grpP.orientation="column";grpP.alignChildren=["fill","top"];grpP.margins=8;
    var grpScope=grpP.add("group");
    var rbProj=grpScope.add("radiobutton",undefined,"プロジェクト全体");
    var rbComp=grpScope.add("radiobutton",undefined,"選択コンポ");
    var rbLay=grpScope.add("radiobutton",undefined,"現在のレイヤ");
    rbProj.value=true;

    var btnScan=grpP.add("button",undefined,"エフェクト集計");
    var lst=grpP.add("listbox",undefined,[],{
        numberOfColumns:3,showHeaders:true,
        columnTitles:["エフェクト名","使用数","状態"],
        columnWidths:[240,80,110]
    });
    lst.preferredSize=[520,230]; lst.multiselect=true;

    // 追加: 注意テキスト（貼り付け / 置換 の上）
    var lblNote=grpP.add("statictext", undefined, "置換の時、1レイヤに複数ある場合は１個づつになります。");
    lblNote.alignment=["fill","top"];

    var btnPaste=grpP.add("button",undefined,"貼り付け / 置換");
    var status=w.add("statictext",undefined,"準備完了"); status.characters=90;

    var snapshot=null;

    // ---------------- コピー側操作 ----------------
    function refreshLayerList(){
        cbLayer.removeAll(); cbEffect.removeAll();
        var c=getActiveComp(); if(!c){status.text="アクティブコンポなし";return;}
        var ls=getLayers(c);
        for(var i=0;i<ls.length;i++) cbLayer.add("item",(i+1)+": "+ls[i].name);
        if(ls.length>0) cbLayer.selection=0;
        refreshEffectList();
        status.text="レイヤー更新: "+ls.length+"件";
    }
    function refreshEffectList(){
        cbEffect.removeAll();
        var c=getActiveComp(); if(!c) return;
        var sel=cbLayer.selection; if(!sel) return;
        var idx=parseInt(sel.text.split(":")[0],10);
        var ly=c.layer(idx);
        var fx=getEffects(ly);
        for(var i=0;i<fx.length;i++) cbEffect.add("item",fx[i].name);
        if(fx.length>0) cbEffect.selection=0;
    }
    cbLayer.onChange=refreshEffectList;
    btnGet.onClick=refreshLayerList;

    function setBusy(b){
        btnCopy.enabled=!b; btnPaste.enabled=!b; btnScan.enabled=!b; btnGet.enabled=!b;
        cbLayer.enabled=!b; cbEffect.enabled=!b;
    }

    btnCopy.onClick=function(){
        var c=getActiveComp(); if(!c){status.text="コンポなし";return;}
        var lsel=cbLayer.selection, esel=cbEffect.selection;
        if(!lsel||!esel){status.text="未選択";return;}
        var idx=parseInt(lsel.text.split(":")[0],10);
        var ly=c.layer(idx);
        var fx=getEffects(ly);
        if(fx.length<=esel.index){status.text="エフェクト取得失敗";return;}
        var eff=fx[esel.index];

        setBusy(true);
        status.text="コピー中…"; w.update();
        try{
            snapshot=collectValuesAndKeys(eff);
            var ok=writeClipboard(JSON.stringify(snapshot));
            status.text=(ok?"コピー完了: ":"コピー完了(クリップボード書込失敗): ")
                      + snapshot.effectDisplayName + " / propPath " + (snapshot.items.length||0) + " 件";
        }catch(err){
            status.text="コピー失敗: "+err;
        }finally{
            setBusy(false);
        }
    };

    // ---------------- 集計 ----------------
    function getScope(){ if(rbProj.value)return"project"; if(rbComp.value)return"compsel"; return"layersel"; }
    function performScan(){
        lst.removeAll();
        var sc=getScope(); var layers=[];
        if(sc==="project") eachComp(function(c){layers=layers.concat(getLayers(c));});
        else if(sc==="compsel"){
            var s=app.project.selection;
            for(var i=0;i<s.length;i++) if(isComp(s[i])) layers=layers.concat(getLayers(s[i]));
        }else if(sc==="layersel"){
            var cc=getActiveComp(); if(cc) layers=cc.selectedLayers;
        }

        var map={};
        for(var i=0;i<layers.length;i++){
            var parade=layers[i].property("ADBE Effect Parade"); if(!parade) continue;
            for(var j=1;j<=parade.numProperties;j++){
                var e=parade.property(j);
                if(!e||!e.matchName) continue;
                var k=e.matchName;
                if(!map[k]) map[k]={matchName:k, displayName:stripSuffixNum(e.name), count:0};
                map[k].count++;
            }
        }
        for(var k in map){
            var li=lst.add("item", map[k].displayName);
            li.subItems[0].text = map[k].count;
            li.subItems[1].text = "";
            li._data = map[k];
        }
        status.text="集計完了: "+Object.keys(map).length+"件";
    }
    btnScan.onClick=performScan;

    // ---------------- 貼付 / 置換 / 未コピー時は削除 ----------------
    function removeEffectsByNode(scope, node){
        var targetKey=node.matchName, layers=buildLayerListByScope(scope);
        var removed=0,lck=0;
        for(var i=0;i<layers.length;i++){
            var ly=layers[i], wasLocked=false;
            try{ wasLocked=!!ly.locked; if(wasLocked) ly.locked=false; }catch(e){}
            try{
                var parade=ly.property("ADBE Effect Parade"); if(!parade) continue;
                var idxList=collectIndices(parade, targetKey);
                for(var k=idxList.length-1;k>=0;k--){
                    var idx=idxList[k], eff=parade.property(idx); if(!eff) continue;
                    try{ eff.remove(); removed++; }catch(e){}
                }
            }catch(e){} finally{
                try{ if(wasLocked) ly.locked=true; }catch(e){}
                if(wasLocked) lck++;
            }
        }
        return {removed:removed,locked:lck};
    }

    function applyOrReplace(sels){
        if(!snapshot){
            try{ snapshot=JSON.parse(readClipboard()); }catch(e){}
        }
        if(!snapshot){
            app.beginUndoGroup("FxRemove (no snapshot)");
            var removed=0,lck=0;
            for(var i=0;i<sels.length;i++){
                var nd=sels[i]._data; var r=removeEffectsByNode(getScope(), nd);
                removed+=r.removed; lck+=r.locked;
            }
            app.endUndoGroup();
            status.text="削除: "+removed+" 件（ロック解除 "+lck+"L）";
            return;
        }

        var sameNodes=[], diffNodes=[];
        for(var i=0;i<sels.length;i++){
            var nd=sels[i]._data;
            (nd.matchName===snapshot.effectMatchName? sameNodes:diffNodes).push(nd);
        }

        app.beginUndoGroup("FxPaste/Replace");
        var total={appliedTargets:0, appliedProps:0, rep:0, repProps:0, fail:0, lck:0};

        for(var a=0;a<sameNodes.length;a++){
            var r=applySameKind(snapshot,getScope(),sameNodes[a]);
            total.appliedTargets+=r.targets; total.appliedProps+=r.props; total.lck+=r.locked;
        }
        if(diffNodes.length>0){
            var ok=confirm("異種 "+diffNodes.length+" 種を置換しますか？",true);
            if(ok){
                for(var b=0;b<diffNodes.length;b++){
                    var rr=replaceAndApply(snapshot,getScope(),diffNodes[b]);
                    total.rep+=rr.replaced; total.repProps+=rr.props; total.fail+=rr.addFail; total.lck+=rr.locked;
                }
            }
        }
        app.endUndoGroup();

        status.text="適用:"+total.appliedTargets+"/"+total.appliedProps+" 置換:"+total.rep+"/"+total.repProps+" 失敗:"+total.fail+" ロック:"+total.lck;
    }

    btnPaste.onClick=function(){
        var sels=[];
        if(!lst.selection){ status.text="貼付先未選択"; return; }
        if(lst.selection instanceof Array){ for(var i=0;i<lst.selection.length;i++) sels.push(lst.selection[i]); }
        else { sels.push(lst.selection); }
        applyOrReplace(sels);
        performScan();
    };

    // 起動
    if(!(this instanceof Panel)){ w.center(); w.show(); }
    refreshLayerList();
})();
