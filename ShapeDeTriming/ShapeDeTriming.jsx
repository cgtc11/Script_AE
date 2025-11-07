    // ================================
    // Shapeトリミング＋編集ツール
    //  - 起点固定（W/H）
    //  - 長方形パス再帰探索
    //  - 小数点切り捨て（手動ボタンのみ）
    //  - 配置（選択レイヤーの位置へ適用）
    //  - Xi/Yi 表記でスリムUI
    // ================================
(function () {
    var win = new Window("palette", "Shapeトリミング+編集ツール", undefined);
    win.orientation = "column"; win.alignChildren = ["fill","top"]; win.margins = 6; win.spacing = 4;

    // 注意
    var warn = win.add("statictext", undefined, "※ スケールは X,Y=100,100 にしてください");
    warn.graphics.foregroundColor = warn.graphics.newPen(warn.graphics.PenType.SOLID_COLOR, [1,0.4,0], 1);
    win.add("statictext", undefined, "シェイプレイヤーを選択して「情報取得」\nその後、編集・トリミング。");

    // ボタン行
    var btnRow = win.add("group"); btnRow.spacing = 4;
    var btnInfo  = btnRow.add("button", undefined, "情報取得");
    var btnFloor = btnRow.add("button", undefined, "小数点以下切り捨て");
    var btnTrim  = win.add("button", undefined, "コンポをトリミング（時間も調整）");

    // 情報欄（少し細め）
    var infoText = win.add("edittext", undefined, "", { multiline:true, scrolling:true });
    infoText.preferredSize = [200, 120];

    // --- 配置（Xi/Yi） ---
    var restoreRow = win.add("group"); restoreRow.spacing = 6; restoreRow.alignment = ["fill","top"];
    var btnRestore = restoreRow.add("button", undefined, "配置");
    restoreRow.add("statictext", undefined, "Xi:");
    var xidouInput = restoreRow.add("edittext", undefined, "0"); xidouInput.characters = 6;
    restoreRow.add("statictext", undefined, "Yi:");
    var yidouInput = restoreRow.add("edittext", undefined, "0"); yidouInput.characters = 6;

    // ステップ
    var stepRow = win.add("group"); stepRow.spacing = 4;
    stepRow.add("statictext", undefined, "移動ステップ(px):");
    var stepInput = stepRow.add("edittext", undefined, "10"); stepInput.characters = 4;

    // 矢印
    var moveGroup = win.add("group"); moveGroup.orientation="column"; moveGroup.alignment=["center","top"]; moveGroup.spacing=2;
    var rowUp = moveGroup.add("group"); var upBtn = rowUp.add("button", undefined, "↑");
    var rowMid = moveGroup.add("group"); rowMid.spacing=4;
    var leftBtn = rowMid.add("button", undefined, "←");
    var rightBtn = rowMid.add("button", undefined, "→");
    var rowDown = moveGroup.add("group"); var downBtn = rowDown.add("button", undefined, "↓");

    // X/Y・W/H
    var editGrid = win.add("group"); editGrid.orientation="column"; editGrid.alignment=["fill","top"]; editGrid.spacing=3;
    var posRow = editGrid.add("group"); posRow.spacing=3;
    posRow.add("statictext", undefined, "X/Y:");
    var posX = posRow.add("edittext", undefined, "0"); posX.characters=6;
    var posY = posRow.add("edittext", undefined, "0"); posY.characters=6;
    var btnSetPos = posRow.add("button", undefined, "適用");

    var sizeRow = editGrid.add("group"); sizeRow.spacing=3;
    sizeRow.add("statictext", undefined, "W/H:");
    var sizeW = sizeRow.add("edittext", undefined, "100"); sizeW.characters=6;
    var sizeH = sizeRow.add("edittext", undefined, "100"); sizeH.characters=6;
    var btnSetSize = sizeRow.add("button", undefined, "適用");

    // --- W/H起点（9個・単一選択） ---
    var anchorPanel = win.add("panel", undefined, "W/H起点");
    anchorPanel.orientation="column"; anchorPanel.alignment=["center","top"]; anchorPanel.margins=6; anchorPanel.spacing=2;
    var anchorButtons = [];
    for (var r=0; r<3; r++){
        var g = anchorPanel.add("group"); g.orientation="row"; g.alignment=["center","top"]; g.spacing=8;
        for (var c=0; c<3; c++){
            var idx = r*3+c;
            var rb = g.add("radiobutton", undefined, "");
            rb.preferredSize = [16,16];
            rb.value = (idx===4);
            rb.onClick = function(){ for (var i=0;i<anchorButtons.length;i++) anchorButtons[i].value = false; this.value = true; };
            anchorButtons.push(rb);
        }
    }
    function getAnchorIndex(){ for (var i=0;i<anchorButtons.length;i++) if (anchorButtons[i].value) return i; return 4; }
    function oppositeAnchor(i){ var map=[8,7,6,5,4,3,2,1,0]; return (i>=0&&i<9)?map[i]:4; }

    win.center(); win.show();

    // ===== 内部処理 =====
    var lastData=null, rectPosProp=null, rectSizeProp=null, rectGroup=null;
    var lastMove = {x:0, y:0}, lastSize = {w:0, h:0};

    function num(v,d){ v=parseFloat(v); return isFinite(v)?v:d; }
    function clampSize(x){ return Math.max(1,x); }

    // 再帰探索
    function findRectPathAndGroup(container){
        for (var i=1;i<=container.numProperties;i++){
            var p = container.property(i);
            if (p.matchName === "ADBE Vector Shape - Rect") {
                var maybeGroup = p.parentProperty && p.parentProperty.parentProperty;
                var groupOK = (maybeGroup && maybeGroup.matchName === "ADBE Vector Group") ? maybeGroup : null;
                return { rectPath: p, rectGroup: groupOK };
            }
            if (p && p.numProperties && p.matchName !== "ADBE Vector Shape") {
                var hit = findRectPathAndGroup(p);
                if (hit) return hit;
            }
        }
        return null;
    }
    function getRectTransformPos(){
        if(!rectGroup) return [0,0];
        var g = rectGroup.property("ADBE Vector Transform Group"); if(!g) return [0,0];
        var p = g.property("ADBE Vector Position") || g.property("ADBE Vector Transform Position");
        return p ? p.value : [0,0];
    }

    // 切り捨て
    function floorIfNumeric(prop){
        if (!prop || prop.isTimeVarying) return;
        try{
            var v = prop.value;
            if (typeof v === "number") prop.setValue(Math.floor(v));
            else if (v instanceof Array){
                var nv=[], ch=false;
                for(var i=0;i<v.length;i++){
                    var n=v[i];
                    if(typeof n==="number"){ var f=Math.floor(n); nv.push(f); ch=ch||(f!==n); }
                    else nv.push(n);
                }
                if (ch) prop.setValue(nv);
            }
        }catch(e){}
    }
    function floorRectAndVectorTransforms(container){
        for (var i=1;i<=container.numProperties;i++){
            var p = container.property(i);
            if (p.matchName === "ADBE Vector Shape - Rect"){
                floorIfNumeric(p.property("ADBE Vector Rect Size"));
                floorIfNumeric(p.property("ADBE Vector Rect Position"));
                floorIfNumeric(p.property("ADBE Vector Rect Roundness"));
            }
            if (p.matchName === "ADBE Vector Group" || p.matchName === "ADBE Root Vectors Group" || p.matchName === "ADBE Vectors Group"){
                var tr = p.property("ADBE Vector Transform Group");
                if (tr){
                    floorIfNumeric(tr.property("ADBE Vector Position"));
                    floorIfNumeric(tr.property("ADBE Vector Anchor"));
                    floorIfNumeric(tr.property("ADBE Vector Scale"));
                    floorIfNumeric(tr.property("ADBE Vector Rotation"));
                    floorIfNumeric(tr.property("ADBE Vector Opacity"));
                }
            }
            if (p && p.numProperties) floorRectAndVectorTransforms(p);
        }
    }
    function floorLayerTransform(layer){
        var t = layer.property("ADBE Transform Group"); if(!t) return;
        floorIfNumeric(t.property("ADBE Anchor Point"));
        var pos = t.property("ADBE Position");
        try { floorIfNumeric(pos); }
        catch(e){
            try{
                floorIfNumeric(t.property("ADBE Position_0"));
                floorIfNumeric(t.property("ADBE Position_1"));
                var pz=t.property("ADBE Position_2"); if(pz) floorIfNumeric(pz);
            }catch(_){}
        }
        floorIfNumeric(t.property("ADBE Scale"));
        floorIfNumeric(t.property("ADBE Rotation"));
        floorIfNumeric(t.property("ADBE Opacity"));
        var ori=t.property("ADBE Orientation"); if(ori) floorIfNumeric(ori);
        var rx=t.property("ADBE Rotate X"); if(rx) floorIfNumeric(rx);
        var ry=t.property("ADBE Rotate Y"); if(ry) floorIfNumeric(ry);
        var rz=t.property("ADBE Rotate Z"); if(rz) floorIfNumeric(rz);
    }

    function refreshInfo(){
        if(!lastData||!rectPosProp||!rectSizeProp) return;
        try{
            var comp=lastData.comp, layer=lastData.layer;
            var shapeSize=rectSizeProp.value, shapePos=rectPosProp.value;
            var rectTr=getRectTransformPos();
            var t=layer.property("ADBE Transform Group");
            var layerPos=t.property("ADBE Position").value;
            var layerScale=t.property("ADBE Scale").value;

            var scaledSize=[shapeSize[0]*(layerScale[0]/100), shapeSize[1]*(layerScale[1]/100)];
            var compC=[comp.width/2, comp.height/2];
            var cx=compC[0]+layerPos[0]+rectTr[0]+shapePos[0];
            var cy=compC[1]+layerPos[1]+rectTr[1]+shapePos[1];
            var lx=cx - scaledSize[0]/2, ly=cy - scaledSize[1]/2;

            var In=layer.inPoint, Out=layer.outPoint, Dur=Out-In;
            posX.text=shapePos[0].toFixed(2); posY.text=shapePos[1].toFixed(2);
            sizeW.text=shapeSize[0].toFixed(2); sizeH.text=shapeSize[1].toFixed(2);

            infoText.text =
                "◆ コンポ情報 ◆\nサイズ: "+comp.width+" x "+comp.height+" px\n全体時間: "+comp.duration.toFixed(3)+" 秒\n\n"+
                "◆ シェイプレイヤー情報 ◆\n元サイズ: "+shapeSize[0].toFixed(2)+" x "+shapeSize[1].toFixed(2)+" px\n"+
                "スケール: X="+layerScale[0].toFixed(2)+"%, Y="+layerScale[1].toFixed(2)+"%\n"+
                "実サイズ: "+scaledSize[0].toFixed(2)+" x "+scaledSize[1].toFixed(2)+" px\n"+
                "パス位置: X="+shapePos[0].toFixed(2)+", Y="+shapePos[1].toFixed(2)+"\n"+
                "トランスフォーム位置: X="+rectTr[0].toFixed(2)+", Y="+rectTr[1].toFixed(2)+"\n"+
                "レイヤー位置: X="+layerPos[0].toFixed(2)+", Y="+layerPos[1].toFixed(2)+"\n"+
                "左上座標: X="+lx.toFixed(2)+", Y="+ly.toFixed(2)+"\n\n"+
                "◆ レイヤー時間 ◆\nIn: "+In.toFixed(3)+"  Out: "+Out.toFixed(3)+"  Dur: "+Dur.toFixed(3)+" 秒";
        }catch(e){ infoText.text="エラー: "+e; }
    }

    // 情報取得
    btnInfo.onClick=function(){
        app.beginUndoGroup("Shape情報取得");
        try{
            infoText.text="";
            lastData=null; rectPosProp=null; rectSizeProp=null; rectGroup=null;

            var comp=app.project.activeItem; if(!(comp instanceof CompItem)) throw "コンポがアクティブではありません。";
            var layer=comp.selectedLayers[0]; if(!layer) throw "シェイプレイヤーを選択してください。";

            var root=layer.property("ADBE Root Vectors Group");
            var hit = findRectPathAndGroup(root);
            if(!hit) throw "長方形パスが見つかりません。";

            var rectPath = hit.rectPath; rectGroup = hit.rectGroup;
            rectPosProp  = rectPath.property("ADBE Vector Rect Position");
            rectSizeProp = rectPath.property("ADBE Vector Rect Size");
            if(!rectPosProp || !rectSizeProp) throw "長方形の位置/サイズが取得できません。";

            lastData={comp:comp, layer:layer};
            refreshInfo();
        }catch(e){ infoText.text="エラー: "+e; }
        finally{ app.endUndoGroup(); }
    };

    // 切り捨てボタン
    btnFloor.onClick = function(){
        app.beginUndoGroup("小数点以下切り捨て");
        try{
            var comp=app.project.activeItem; if(!(comp instanceof CompItem)) throw "コンポがアクティブではありません。";
            var layers=comp.selectedLayers; if(!layers || layers.length===0) throw "レイヤーを選択してください。";
            for (var i=0;i<layers.length;i++){
                var layer=layers[i];
                var root=layer.property("ADBE Root Vectors Group");
                if (root) floorRectAndVectorTransforms(root);
                floorLayerTransform(layer);
            }
            refreshInfo();
        }catch(e){ alert("エラー: "+e); }
        finally{ app.endUndoGroup(); }
    };

    function step(){ return num(stepInput.text,1); }
    function move(dx,dy){
        if(!rectPosProp) return;
        app.beginUndoGroup("Shape移動");
        var p=rectPosProp.value; rectPosProp.setValue([p[0]+dx, p[1]+dy]);
        app.endUndoGroup(); refreshInfo();
    }
    upBtn.onClick=function(){ move(0,-step()); };
    downBtn.onClick=function(){ move(0, step()); };
    leftBtn.onClick=function(){ move(-step(),0); };
    rightBtn.onClick=function(){ move(step(),0); };
    btnSetPos.onClick=function(){ if(rectPosProp) rectPosProp.setValue([num(posX.text,0), num(posY.text,0)]); refreshInfo(); };

    // W/H変更：起点固定
    btnSetSize.onClick=function(){
        if(!rectSizeProp) return;
        var old=rectSizeProp.value.slice();
        var newW=clampSize(num(sizeW.text,100));
        var newH=clampSize(num(sizeH.text,100));
        rectSizeProp.setValue([newW,newH]);

        var anchor = oppositeAnchor(getAnchorIndex());
        var dx=(newW-old[0])/2, dy=(newH-old[1])/2, off=[0,0];
        switch(anchor){
            case 0: off=[-dx,-dy]; break; case 1: off=[0,-dy]; break; case 2: off=[dx,-dy]; break;
            case 3: off=[-dx,0];   break; case 4: off=[0,0];   break; case 5: off=[dx,0];   break;
            case 6: off=[-dx,dy];  break; case 7: off=[0,dy];  break; case 8: off=[dx,dy];  break;
        }
        var p=rectPosProp.value; rectPosProp.setValue([p[0]+off[0], p[1]+off[1]]);
        refreshInfo();
    };

    // トリミング
    btnTrim.onClick=function(){
        if(!lastData){ alert("先に「情報取得」を実行してください。"); return; }
        app.beginUndoGroup("コンポトリミング");
        try{
            var comp=lastData.comp, layer=lastData.layer, currentTime=comp.time;

            var shapeSize=rectSizeProp.value;
            var rectTr=getRectTransformPos();
            rectTr[0]+=num(posX.text,0); rectTr[1]+=num(posY.text,0);

            var lt=layer.property("ADBE Transform Group");
            var layerPos=lt.property("ADBE Position").value;
            var layerScale=lt.property("ADBE Scale").value;

            var scaledW=shapeSize[0]*(layerScale[0]/100);
            var scaledH=shapeSize[1]*(layerScale[1]/100);
            var newW=Math.floor(scaledW), newH=Math.floor(scaledH);

            var n=comp.layers.addNull(); n.name="Parent_Null"; n.property("Position").setValue([0,0]); n.moveToBeginning();
            for (var i=1;i<=comp.numLayers;i++){
                var lyr=comp.layer(i);
                if(lyr!==n && lyr.parent===null){ try{lyr.parent=n;}catch(e){} }
            }

            var moveX=(comp.width/2)-(scaledW/2)+rectTr[0]+layerPos[0]-comp.width/2;
            var moveY=(comp.height/2)-(scaledH/2)+rectTr[1]+layerPos[1]-comp.height/2;
            n.property("Position").setValue([-moveX,-moveY]);

            comp.width=newW; comp.height=newH; n.remove();

            for (var j=1;j<=comp.numLayers;j++) comp.layer(j).startTime -= layer.inPoint;
            comp.displayStartTime=0;
            var dur=layer.outPoint-layer.inPoint; comp.duration=dur; comp.workAreaStart=0; comp.workAreaDuration=dur;
            comp.time=currentTime;

            var shownX = -moveX, shownY = -moveY;
            var xi = -shownX + newW/2;   // Xi
            var yi = -shownY + newH/2;   // Yi
            xidouInput.text = xi.toFixed(2);
            yidouInput.text = yi.toFixed(2);

            infoText.text += "\n◆ レイヤー時間 ◆\nIn: "+layer.inPoint.toFixed(3)+"  Out: "+layer.outPoint.toFixed(3)+"  Dur: "+(layer.outPoint-layer.inPoint).toFixed(3)+" 秒" +
                             "\n親ヌル移動: X="+shownX.toFixed(2)+", Y="+shownY.toFixed(2) +
                             "\nトリム完了\n新しいコンポサイズ: "+newW+" x "+newH+" px" +
                             "\nXi="+xi.toFixed(2)+", Yi="+yi.toFixed(2);
        }catch(e){ alert("エラー: "+e); }
        finally{ app.endUndoGroup(); }
    };

    // 配置：選択レイヤーの位置へ適用（複数/分離次元対応）
    btnRestore.onClick = function(){
        app.beginUndoGroup("配置");
        try{
            var comp = app.project.activeItem; if(!(comp instanceof CompItem)) throw "コンポがアクティブではありません。";
            var layers = comp.selectedLayers; if(!layers || layers.length===0) throw "移動させるレイヤーを選択してください。";
            var x = num(xidouInput.text, 0), y = num(yidouInput.text, 0);

            for (var i=0;i<layers.length;i++){
                var t = layers[i].property("ADBE Transform Group"); if(!t) continue;
                var pos = t.property("ADBE Position");
                try{
                    var v = pos.value;
                    if (v instanceof Array && v.length>=3) pos.setValue([x, y, v[2]]);
                    else pos.setValue([x, y]);
                }catch(e){
                    try{
                        t.property("ADBE Position_0").setValue(x);
                        t.property("ADBE Position_1").setValue(y);
                    }catch(_){}
                }
            }
        }catch(e){ alert("エラー: "+e); }
        finally{ app.endUndoGroup(); }
    };

})();
