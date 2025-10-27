// CoPiPe.jsx v1.0c by DigiMonkey
// Mode: Comp / Layer を選択
// Copy : 依存縮小 → Desktop/CoPiPe.aepx 保存 → Undoで復帰
// Past : CoPiPe.aepx 読込 → 直下フォルダ名を「CoPiPe」に変更
//        （Layerは __CoPiPe__ から順序維持で貼付）→ チェックONならAEPX削除
// 無ダイアログ／LayerのCopy/Past後にビューを確実に元へ復帰

(function(){
    var DESKTOP   = Folder.desktop.fsName.replace(/\\/g,"/");
    var AEPX_PATH = DESKTOP + "/CoPiPe.aepx";
    var TMP_COMP  = "__CoPiPe__";
    var _deleteAfterPast = true; // UIチェックと連動

    // -------- 共通 --------
    function ensureActiveComp(){
        var c = app.project.activeItem;
        if (!(c instanceof CompItem)) throw "コンポをアクティブにしてください";
        return c;
    }
    function selectedComps(){
        var s = app.project.selection || [], out=[];
        for (var i=0;i<s.length;i++) if (s[i] instanceof CompItem) out.push(s[i]);
        return out;
    }
    function importProjectAsFolder(file){
        var io = new ImportOptions(file);
        if (!io.canImportAs(ImportAsType.PROJECT)) return null;
        io.importAs = ImportAsType.PROJECT;
        return app.project.importFile(io); // FolderItem
    }
    function findCompDeep(it, name){
        if (!it) return null;
        if (it instanceof CompItem && it.name === name) return it;
        if (it instanceof FolderItem){
            for (var i=1;i<=it.numItems;i++){ var r = findCompDeep(it.item(i), name); if (r) return r; }
        }
        return null;
    }
    function pasteOrderedFromComp(srcComp, dstComp){
        for (var idx=1; idx<=srcComp.numLayers; idx++){
            var s = srcComp.layer(idx);
            try{
                s.copyToComp(dstComp);
                var newly = dstComp.layer(1);
                if (newly) newly.moveToEnd(); // 元の順序を維持
            }catch(e){}
        }
    }
    function saveAEPX(){
        var f = new File(AEPX_PATH);
        try{ if (f.exists) f.remove(); }catch(e){}
        app.project.save(f); // .aepx
    }
    function undoOnce(){
        try{ var id = app.findMenuCommandId("Undo"); if (id){ app.executeCommand(id); return; } }catch(e){}
        try{ app.executeCommand(16); }catch(e){}
    }

    // ---- ビュー保持（強制復帰版）----
    function withViewPreserved(doWork){
        var prevItem = app.project.activeItem;
        var prevTime = null, prevSelIdx = [];
        var hadViewer = app.activeViewer;

        if (prevItem instanceof CompItem){
            try{ prevTime = prevItem.time; }catch(e){}
            try{
                var sel = prevItem.selectedLayers || [];
                for (var i=0;i<sel.length;i++) prevSelIdx.push(sel[i].index);
            }catch(e){}
        }

        try{
            doWork();
        } finally {
            if (prevItem instanceof CompItem){
                try{ app.project.activeItem = prevItem; }catch(e){}
                try{
                    var vw = prevItem.openInViewer();
                    if (vw && vw.setActive) vw.setActive();
                }catch(e){}
                if (prevTime!==null){ try{ prevItem.time = prevTime; }catch(e){} }
                try{
                    for (var j=1;j<=prevItem.numLayers;j++) prevItem.layer(j).selected = false;
                    for (var k=0;k<prevSelIdx.length;k++){
                        var L = prevItem.layer(prevSelIdx[k]); if (L) L.selected = true;
                    }
                }catch(e){}
            } else if (hadViewer && hadViewer.setActive){
                try{ hadViewer.setActive(); }catch(e){}
            }
        }
    }

    // -------- 依存解析による厳密縮小 --------
    function collectDepsFromComp(rootComp, keep){
        var q=[rootComp];
        while(q.length){
            var c=q.pop();
            if (!(c instanceof CompItem)) continue;
            if (keep[c.id]) continue;
            keep[c.id]=true;
            for (var li=1; li<=c.numLayers; li++){
                var ly=c.layer(li);
                if (!(ly instanceof AVLayer)) continue;
                if (ly.source instanceof CompItem){
                    if (!keep[ly.source.id]) q.push(ly.source);
                }else if (ly.source instanceof FootageItem){
                    keep[ly.source.id]=true;
                }else if (ly.source && ly.source.mainSource instanceof SolidSource){
                    keep[ly.source.id]=true;
                }
            }
        }
    }
    function buildKeepSetFromComps(comps){
        var keep={};
        for (var i=0;i<comps.length;i++) collectDepsFromComp(comps[i], keep);
        return keep;
    }
    function strictReduceKeepSet(keep){
        for (var i=app.project.numItems; i>=1; i--){
            var it=app.project.item(i);
            if (it instanceof FolderItem) continue;
            if (!keep[it.id]){ try{ it.remove(); }catch(e){} }
        }
        var changed=true;
        while(changed){
            changed=false;
            for (var j=app.project.numItems; j>=1; j--){
                var f=app.project.item(j);
                if (f instanceof FolderItem && f.numItems===0){ try{ f.remove(); changed=true; }catch(e){} }
            }
        }
    }

    // -------- Comp: Copy / Past --------
    function copyComp(){
        var comps = selectedComps();
        if (comps.length===0) return;
        app.beginUndoGroup("CoPiPe Comp Copy");
        try{
            var keep = buildKeepSetFromComps(comps);
            strictReduceKeepSet(keep);
        } finally { app.endUndoGroup(); }
        saveAEPX();
        undoOnce();
    }
    function pastComp(){
        var f = new File(AEPX_PATH);
        if (!f.exists) return;
        var folder = importProjectAsFolder(f);
        if (folder && folder instanceof FolderItem){
            try{ folder.name = "CoPiPe"; }catch(e){}
        }
        if (_deleteAfterPast){ try{ f.remove(); }catch(e){} }
    }

    // -------- Layer: Copy / Past（AEPX方式）--------
    function copyLayer(){
        withViewPreserved(function(){
            var comp = ensureActiveComp();
            var sel = comp.selectedLayers || [];
            if (!sel || sel.length===0) return;

            // 既存TMPを掃除
            for (var i=1;i<=app.project.numItems;i++){
                var it=app.project.item(i);
                if (it instanceof CompItem && it.name===TMP_COMP){ try{ it.remove(); }catch(e){} }
            }

            app.beginUndoGroup("CoPiPe Layer→TempComp");
            try{
                // 一時コンポを作成し順序維持で複製
                var tmp = app.project.items.addComp(TMP_COMP, comp.width, comp.height, comp.pixelAspect, comp.duration, comp.frameRate);
                sel.sort(function(a,b){ return a.index - b.index; });
                for (var j=0;j<sel.length;j++){
                    try{ sel[j].copyToComp(tmp); }catch(e){}
                }
                // 一時コンポ依存だけに厳密縮小
                var keep = buildKeepSetFromComps([tmp]);
                strictReduceKeepSet(keep);
            } finally { app.endUndoGroup(); }

            // アクティブ復帰の明示
            try{ app.project.activeItem = comp; }catch(e){}
            saveAEPX();
            undoOnce();
        });
    }
    function pastLayer(){
        withViewPreserved(function(){
            var dst = ensureActiveComp();
            var f = new File(AEPX_PATH);
            if (!f.exists) return;

            var folder = importProjectAsFolder(f);
            if (!folder) return;

            try{ folder.name = "CoPiPe"; }catch(e){}

            var src = findCompDeep(folder, TMP_COMP);
            if (src) pasteOrderedFromComp(src, dst);

            // アクティブ復帰の明示
            try{ app.project.activeItem = dst; }catch(e){}
            if (_deleteAfterPast){ try{ f.remove(); }catch(e){} }
        });
    }

    // -------- UI --------
    function buildUI(thisObj){
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette","CoPiPe AEPX (Comp/Layer)",undefined,{resizeable:true});
        panel.alignChildren=["fill","top"];

        var mode = panel.add("group"); mode.orientation="row";
        mode.add("statictext", undefined, "Mode:");
        var rbComp  = mode.add("radiobutton", undefined, "Comp");
        var rbLayer = mode.add("radiobutton", undefined, "Layer");
        rbComp.value = true;

        // 削除チェック（要求どおりの表記）
        var delGrp = panel.add("group"); delGrp.orientation = "row";
        var chkDel = delGrp.add("checkbox", undefined, "Dell CoPiPe.aepx");
        chkDel.value = true; // 初期ON
        chkDel.onClick = function(){ _deleteAfterPast = !!chkDel.value; };

        var row = panel.add("group"); row.orientation="row";
        var btnCopy = row.add("button", undefined, "Copy");
        var btnPast = row.add("button", undefined, "Past");

        btnCopy.onClick = function(){ try{ if (rbComp.value) copyComp(); else copyLayer(); }catch(e){} };
        btnPast.onClick = function(){ try{ if (rbComp.value) pastComp(); else pastLayer(); }catch(e){} };

        panel.layout.layout(true);
        if (!(thisObj instanceof Panel)){ panel.center(); panel.show(); }
        return panel;
    }

    try{ buildUI(this); }catch(e){}
})();
