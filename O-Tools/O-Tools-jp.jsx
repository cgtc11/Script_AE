//===========================================================================
// O_Tools V1.5.8c by Digimonkey
//===========================================================================

var thisObj = this;
var myPanel = (thisObj instanceof Panel)
    ? thisObj
    : new Window("palette", "oTools", undefined, { resizeable: true });

function buildUI(panel) {
    panel.orientation = "column";
    panel.alignChildren = ["fill", "fill"];

    var tabPanel = panel.add("tabbedpanel");
    tabPanel.alignment = ["fill", "fill"];
    tabPanel.alignChildren = ["fill", "fill"];

    tabPanel.preferredSize = [290, 512];   // 初期サイズ（固定じゃない）
   // tabPanel.minimumSize   = [290, 300];   // 最低限

    // --- 各タブを作成 ---
    var tab1 = tabPanel.add("tab", undefined, "Na");
    var tab2 = tabPanel.add("tab", undefined, "TR");
    var tab3 = tabPanel.add("tab", undefined, "T1");
    var tab4 = tabPanel.add("tab", undefined, "T2");
    var tab5 = tabPanel.add("tab", undefined, "Re");
    var tab6 = tabPanel.add("tab", undefined, "Sh");

    // --- 内容を構築 ---
    buildNameEdUI(tab1);
    buildTReMapUI(tab2);
    buildCombined1UI(tab3);
    buildCombined2UI(tab4);
    buildRemoveUI(tab5);
    buildShakeUI(tab6);

    // --- タブ切替イベント（Tab.jsxと同じ構文）---
tabPanel.onChange = function () {
    var sel = tabPanel.selection;
    if (!sel) return; // ← null のとき何もしない

        tab1.text = (sel === tab1) ? "NameEd"   : "Na";
        tab2.text = (sel === tab2) ? "TReMap"   : "TR";
        tab3.text = (sel === tab3) ? "Tools1"   : "T1";
        tab4.text = (sel === tab4) ? "Tools2"   : "T2";
        tab5.text = (sel === tab5) ? "Remove"   : "Re";
        tab6.text = (sel === tab6) ? "Shake"    : "Sh";
    };

    // --- 初期選択設定 ---
    tabPanel.selection = tab1;
    tab1.text = "NameEd";

    panel.onResizing = panel.onResize = function () {
        this.layout.resize();
    };

    panel.layout.layout(true);
    return panel;
}

    // ◆◆NameEdTAB◆◆


function buildNameEdUI(panel) {
    // --- このTAB内のレイアウト方針 ---
    // 上のUIは固定（top）、outputFieldだけ縦横ともに伸縮（fill, fill）
    panel.orientation  = "column";
    panel.alignChildren = ["fill", "top"];

    var mode = "name"; // "name" or "comment"

    function getSelectedItemsData() {
        var project = app.project;
        var selectedItems = project.selection;
        var data = [];

        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i] instanceof CompItem ||
                selectedItems[i] instanceof FootageItem ||
                selectedItems[i] instanceof FolderItem) {

                if (mode === "name") {
                    data.push(selectedItems[i].name);
                } else if (mode === "comment") {
                    data.push(selectedItems[i].comment);
                }
            }
        }
        return data.join("\n");
    }

    function getSelectedLayersData(comp) {
        var selectedLayers = comp.selectedLayers;
        var data = [];

        for (var i = 0; i < selectedLayers.length; i++) {
            if (mode === "name") {
                data.push(selectedLayers[i].name);
            } else if (mode === "comment") {
                data.push(selectedLayers[i].comment);
            }
        }
        return data.join("\n");
    }

    function updateSelectedItemsData(newData) {
        var project = app.project;
        var selectedItems = project.selection;
        var newDataArray = newData.split("\n");
        var j = 0;

        for (var i = 0; i < selectedItems.length; i++) {
            if (j < newDataArray.length) {
                if (selectedItems[i] instanceof CompItem ||
                    selectedItems[i] instanceof FootageItem ||
                    selectedItems[i] instanceof FolderItem) {

                    if (mode === "name") {
                        selectedItems[i].name = newDataArray[j];
                    } else if (mode === "comment") {
                        selectedItems[i].comment = newDataArray[j];
                    }
                }
            }
            j++;
        }
    }

    function updateSelectedLayersData(comp, newData) {
        var selectedLayers = comp.selectedLayers;
        var newDataArray = newData.split("\n");
        var j = 0;

        for (var i = 0; i < selectedLayers.length; i++) {
            if (j < newDataArray.length) {
                if (mode === "name") {
                    selectedLayers[i].name = newDataArray[j];
                } else if (mode === "comment") {
                    selectedLayers[i].comment = newDataArray[j];
                }
            }
            j++;
        }
    }

    // --- ラジオ（名前/コメント） ---
    var radioGroup = panel.add("group", undefined);
    radioGroup.orientation = "row";
    radioGroup.alignment = ["fill", "top"];

    var nameRadio = radioGroup.add("radiobutton", undefined, "名前");
    var commentRadio = radioGroup.add("radiobutton", undefined, "コメント");

    nameRadio.value = true;
    nameRadio.onClick = function () { mode = "name"; };
    commentRadio.onClick = function () { mode = "comment"; };

    // --- 取得/更新ボタン ---
    var buttonGroup = panel.add("group", undefined);
    buttonGroup.orientation = "row";
    buttonGroup.alignment = ["fill", "top"];

    var getButton = buttonGroup.add("button", undefined, "取得");
    getButton.helpTip = "選択されたアイテムの名前またはコメントを取得します";

    var updateButton = buttonGroup.add("button", undefined, "更新");
    updateButton.helpTip = "テキストフィールドのデータで選択されたアイテムを更新します";

    // --- 置換 ---
    var replaceGroup = panel.add("group", undefined);
    replaceGroup.orientation = "row";
    replaceGroup.alignment = ["fill", "top"];

    var oldTextField = replaceGroup.add("edittext", undefined, "");
    var newTextField = replaceGroup.add("edittext", undefined, "");
    var replaceButton = replaceGroup.add("button", undefined, "置換");
    replaceButton.helpTip = "指定されたテキストを新しいテキストに置き換えます";

    // 置換欄は固定幅のまま（ここは伸ばさない）
    oldTextField.preferredSize = [60, 20];
    newTextField.preferredSize = [60, 20];

    // --- ★出力欄：ここだけ伸縮させる ---
    // scrolling:true を付けると、長文時にスクロールが安定します
    var outputField = panel.add("edittext", undefined, "", { multiline: true, scrolling: true });
    outputField.alignment = ["fill", "fill"];        // ★縦横に伸びる
    outputField.minimumSize = [200, 120];           // ★縮みすぎ防止（任意）
    outputField.preferredSize = [200, 300];         // 初期サイズ（元の size に近い）

    // --- 置換処理 ---
    replaceButton.onClick = function () {
        var currentData = outputField.text;
        var replacedData = currentData.replace(new RegExp(oldTextField.text, 'g'), newTextField.text);
        outputField.text = replacedData;
    };

    // --- 取得処理 ---
    getButton.onClick = function () {
        var comp = app.project.activeItem;
        var projectData = getSelectedItemsData();
        var layerData = "";

        if (comp && comp instanceof CompItem) {
            layerData = getSelectedLayersData(comp);
        }

        var combinedData = [];
        if (projectData) combinedData.push(projectData);
        if (layerData) combinedData.push(layerData);

        outputField.text = combinedData.join("\n");
    };

    // --- 更新処理 ---
    updateButton.onClick = function () {
        updateSelectedItemsData(outputField.text);

        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            updateSelectedLayersData(comp, outputField.text);
        }
    };

    // --- このTABがリサイズされたらレイアウト更新 ---
    // （上位のpanel側で一括処理しているなら、これは無くてもOK）
    panel.onResizing = panel.onResize = function () {
        this.layout.resize();
    };
}


    // ◆◆TReMapTAB◆◆

function buildTReMapUI(panel) {
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];

    // ★★★★★指定された間隔で停止キーを配置★★★★★

    var stopKeysGroup = panel.add("group", undefined);
    stopKeysGroup.orientation = "column";
    stopKeysGroup.alignment = ["fill", "top"];

    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "---------コマ抜きアニメーション---------");
    stopKeysLabel.helpTip = "コマ抜きアニメーション作成";

    // グループのサイズを調整
    var T1_Btn_selecr_Keys_Group = stopKeysGroup.add("group");
    T1_Btn_selecr_Keys_Group.orientation = "row";
    T1_Btn_selecr_Keys_Group.alignment = "center";  // グループ全体を中央に配置 

    // ボタンとEditTextをグループ内に配置
    var T1_Btn_selecr_Keys = T1_Btn_selecr_Keys_Group.add("button", undefined, "コマ抜き");
    var T1_Btn_selecr_Keys_Num = T1_Btn_selecr_Keys_Group.add("edittext", undefined, "2");

    // ボタンとEditTextのサイズを適切に設定
    T1_Btn_selecr_Keys.helpTip = "コマ抜きアニメーション";
    T1_Btn_selecr_Keys.size = [80, 30];
    T1_Btn_selecr_Keys_Num.helpTip = "抜きたい数";
    T1_Btn_selecr_Keys_Num.size = [30, 30];  // EditTextのサイズを適切に調整

    // カーソル合わせで出てくる言葉
            T1_Btn_selecr_Keys.helpTip   = "キーを等間隔で選択します";

        //各種ボタン押下時処理
            T1_Btn_selecr_Keys.onClick   = function(){SELECT_KEYS();}

    //〇各種処理===========================================================================
    //■初期化する(タイムリマップ用共通処理)
        function RESET_TIMEREMAP(Layer)
        {
            Layer.timeRemapEnabled = false;
            Layer.timeRemapEnabled = true;
            Layer.property("ADBE Time Remapping").expression = "";
        }

    //■エラー処理(タイムリマップ用共通処理)
        function CHECK_TIMEREMAP_COM(Layer)
        {
            //■「null」を選択していないかどうか
                if(Layer.nullLayer == true){
                    Layer.timeRemapEnabled = false;
                    eval("throw \"Nullレイヤーが選択されています。\"; ");
                }
            //■「ライト」を選択していないかどうか
                if(Layer instanceof LightLayer){
                    Layer.timeRemapEnabled = false;
                    eval("throw \"ライトレイヤーが選択されています。\";");
                }
            //■「カメラ」を選択していないかどうか
                if(Layer instanceof CameraLayer){
                    Layer.timeRemapEnabled = false;
                    eval("throw \"カメラレイヤーが選択されています。\";");
                }
            //■「平面」を選択していないかどうか
                if(Layer.source.mainSource instanceof SolidSource){
                    Layer.timeRemapEnabled = false;
                    eval("throw \"平面レイヤーが選択されています。\";");
                }
        }

    //■「全フレームに停止キー」ボタン押下時の処理(T1_Btn_Stop_All)
        function ALL_KEYFRAME_STOP()
        {
            try{
                for(var i = 0;i < app.project.activeItem.selectedLayers.length;i++){
                    var myLayer = app.project.activeItem.selectedLayers[i];
                    //■エラー処理
                        CHECK_TIMEREMAP_COM(myLayer);

                    //■適用処理
                        app.beginUndoGroup("Stop_All");

                        RESET_TIMEREMAP(myLayer);
                        var myEffects = myLayer.property("ADBE Time Remapping");
                        var sFrameTime  = myEffects.keyTime(1);
                        var eFrameTime  = myEffects.keyTime(2);
                        var frameLength = eFrameTime-sFrameTime;//デュレーション(秒数)
                        var frameLate   = 1/app.project.activeItem.frameRate;
                        for(var j = 0;j<frameLength;j+=frameLate){
                            var newKey = myEffects.addKey(j+sFrameTime);
                        }
                        for(var k =1;k<myEffects.numKeys;k++){
                            myEffects.setInterpolationTypeAtKey(k,KeyframeInterpolationType.HOLD,KeyframeInterpolationType.HOLD);//HOLD:停止、LINER:リニア、BEZIER:ベジェ;        
                        }
                        myEffects.removeKey(myEffects.numKeys);

                        app.endUndoGroup();
                };
            }
            catch(err_message){
                alert(err_message,"エラー");
            }
        }

    //■「セレクトキーフレーム」ボタン押下時の処理(T1_Btn_IR)
        function SELECT_KEYS()
        {
            try{
                ALL_KEYFRAME_STOP();
                for(var i = 0;i < app.project.activeItem.selectedLayers.length;i++){
                    var myLayer = app.project.activeItem.selectedLayers[i];

                    //■適用処理
                    var myEffects = myLayer.property("ADBE Time Remapping");
                    var targetKey = Number(T1_Btn_selecr_Keys_Num.text);
                    var keyCount = myEffects.numKeys;
                    for(var k =1, index = 1;k<=keyCount;k++){
                        if(k % (targetKey+1) !== 0){
                            myEffects.removeKey(index+1);
                        }
                        else { index++; }
                    }
                }
            } catch(err_message){ alert(err_message,"エラー"); }
        }

// コマ抜きボタンの横にオフセットボタンを追加
// ★ここからオフセット用のグループ（改行して下に配置）

var T1_Btn_offset_Group = stopKeysGroup.add("group");
T1_Btn_offset_Group.orientation = "row";
T1_Btn_offset_Group.alignment = "center";

var T1_Btn_offset = T1_Btn_offset_Group.add("button", undefined, "オフセット");
T1_Btn_offset.size = [80, 30];
var T1_Btn_offset_Num = T1_Btn_offset_Group.add("edittext", undefined, "0");
T1_Btn_offset_Num.size = [30, 30];
T1_Btn_offset.helpTip = "選択キーの値を指定フレーム数だけずらす";

// クリック時の処理
T1_Btn_offset.onClick = function () {
    app.beginUndoGroup("Offset Time Remap Values");

    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("コンポジションを選択してください。");
        app.endUndoGroup(); return;
    }

    var fr = comp.frameRate;
    var frames = parseFloat(T1_Btn_offset_Num.text);
    if (isNaN(frames)) {
        alert("数値を入力してください");
        app.endUndoGroup(); return;
    }
    var delta = frames / fr; // 秒換算

    var layers = comp.selectedLayers;
    for (var i = 0; i < layers.length; i++) {
        var lyr = layers[i];
        if (!lyr.timeRemapEnabled) continue;

        var prop = lyr.property("ADBE Time Remapping");
        for (var k = 1; k <= prop.numKeys; k++) {
            if (prop.keySelected(k)) {
                var v = prop.keyValue(k);
                prop.setValueAtKey(k, v + delta); // 値だけをずらす
            }
        }
    }

    app.endUndoGroup();
};

// ★等間隔配置用のグループ

var T1_Btn_spacing_Group = stopKeysGroup.add("group");
T1_Btn_spacing_Group.orientation = "row";
T1_Btn_spacing_Group.alignment = "center";

var T1_Btn_spacing = T1_Btn_spacing_Group.add("button", undefined, "間隔整列");
T1_Btn_spacing.size = [80, 30];
var T1_Btn_spacing_Num = T1_Btn_spacing_Group.add("edittext", undefined, "1");
T1_Btn_spacing_Num.size = [30, 30];
T1_Btn_spacing.helpTip = "0ならフル、1なら1コマ飛ばし、2なら2コマ飛ばしで配置します";

// クリック時の処理
T1_Btn_spacing.onClick = function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("コンポジションを選択してください。");
        return;
    }

    var fr = comp.frameRate;
    var inputNum = parseFloat(T1_Btn_spacing_Num.text);
    if (isNaN(inputNum)) {
        alert("数値を入力してください");
        return;
    }

    app.beginUndoGroup("Arrange Keys Spacing");

    var stepTime = (inputNum + 1) / fr; 
    var currentTime = comp.time;
    var layers = comp.selectedLayers;

    for (var i = 0; i < layers.length; i++) {
        var lyr = layers[i];
        // 選択されている「プロパティ」をすべて取得
        var selectedProps = lyr.selectedProperties;
        
        for (var p = 0; p < selectedProps.length; p++) {
            var prop = selectedProps[p];
            
            // プロパティであり、かつキーフレームが1つ以上選択されているか確認
            if (prop.propertyType === PropertyType.PROPERTY && prop.selectedKeys.length > 0) {
                
                var selectedKeyData = [];
                var indicesToRemove = [];

                // 1. 選択されているキーの情報を「今のうちに」すべて保存
                // prop.selectedKeys は現在選択されているキーのインデックス配列を返します
                for (var j = 0; j < prop.selectedKeys.length; j++) {
                    var kIdx = prop.selectedKeys[j];
                    selectedKeyData.push({
                        val: prop.keyValue(kIdx),
                        inInterp: prop.keyInInterpolationType(kIdx),
                        outInterp: prop.keyOutInterpolationType(kIdx)
                    });
                    indicesToRemove.push(kIdx);
                }

                // 2. ★重要：選択されていたキーを「後ろから」削除
                // これをやらないと、元の位置にキーが残ってしまいます
                for (var r = indicesToRemove.length - 1; r >= 0; r--) {
                    prop.removeKey(indicesToRemove[r]);
                }

                // 3. インジケータ位置から新しく打ち直す
                for (var m = 0; m < selectedKeyData.length; m++) {
                    var newTime = currentTime + (m * stepTime);
                    var newIdx = prop.addKey(newTime);
                    
                    prop.setValueAtKey(newIdx, selectedKeyData[m].val);
                    prop.setInterpolationTypeAtKey(newIdx, selectedKeyData[m].inInterp, selectedKeyData[m].outInterp);
                }
            }
        }
    }

    app.endUndoGroup();
};

    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "---------タイムリマップ用---------");
    var w = new Window("palette", "LOOP設定");

    //--------------------------------------------------
    // 1. ■------- (先頭フレームを1フレ静止表示)
    //--------------------------------------------------

    // グループのサイズを調整
    var btnFreezeFirst_Group = stopKeysGroup.add("group");
    btnFreezeFirst_Group.orientation = "row";
    btnFreezeFirst_Group.alignment = "center";  // グループ全体を中央に配置

    var btnFreezeFirst = btnFreezeFirst_Group.add("button", undefined, "■-------");
    btnFreezeFirst.helpTip = "最初の1枚目でLOOP再生";
    btnFreezeFirst.size = [80, 30];

    btnFreezeFirst.onClick = function () {
        app.beginUndoGroup("FreezeFirstFrame_1F");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            app.endUndoGroup();
            return;
        }
        var layers = comp.selectedLayers;
        if (!layers.length) {
            app.endUndoGroup();
            return;
        }

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (!layer.canSetTimeRemapEnabled) continue;

            // 既存キー削除
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            for (var k = remap.numKeys; k >= 1; k--) {
                remap.removeKey(k);
            }

            // タイムリマップON → 自動でIn/Outにキー2つできる
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");

            if (remap.numKeys < 2) continue;

            // 2つ目のキーを消す
            remap.removeKey(2);

            remap.expression = "";
            remap.expressionEnabled = false;
        }
        app.endUndoGroup();
    };
 
    //--------------------------------------------------
    // 2. -------■ (最後のフレームを1フレ静止表示し、50Fは消す)
    //--------------------------------------------------
    // グループのサイズを調整
    var btnFreezeLast_Group = stopKeysGroup.add("group");
    btnFreezeLast_Group.orientation = "row";
    btnFreezeLast_Group.alignment = "center";  // グループ全体を中央に配置

    var btnFreezeLast = btnFreezeLast_Group.add("button", undefined, "-------■");
    btnFreezeLast.helpTip = "再生後最後の1枚目でLOOP再生";
    btnFreezeLast.size = [80, 30];
    btnFreezeLast.onClick = function () {
        app.beginUndoGroup("FreezeLastFrame");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            app.endUndoGroup();
            return;
        }
        var layers = comp.selectedLayers;
        if (!layers.length) {
            app.endUndoGroup();
            return;
        }

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (!layer.canSetTimeRemapEnabled) continue;

            // 既存キー削除
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            for (var k = remap.numKeys; k >= 1; k--) {
                remap.removeKey(k);
            }

            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            if (remap.numKeys < 2) continue;

            // アウト点キー(2番目)
            var endKeyTime = remap.keyTime(2);  // 例: 50F目
            var endKeyVal = remap.keyValue(2);

            // 50Fキーを消して → 49Fに新規キーを打つ
            remap.removeKey(2);

            var newKeyTime = endKeyTime - (1 / comp.frameRate);  // 49F目
            var kIdx = remap.addKey(newKeyTime);
            // 「49Fの値」を参照したければ下記のように:
            // var val49 = remap.valueAtTime(newKeyTime, false);
            // remap.setValueAtKey(kIdx, val49);
            // ただし今回は endKeyVal = 50Fの絵 をそのまま流用
            remap.setValueAtKey(kIdx, endKeyVal - 1 / 30);

            // レイヤーのアウトポイント自体はそのまま(50F)にする。
            // 49F→50Fの間は49Fの絵が静止表示される
            remap.expression = "";
            remap.expressionEnabled = false;
        }
        app.endUndoGroup();
    };

    //--------------------------------------------------
    // 3. ◆-----◆◆ (ループ再生)
    //--------------------------------------------------
    var btnLoop_Group = stopKeysGroup.add("group");
    btnLoop_Group.orientation = "row";
    btnLoop_Group.alignment = "center";

    var btnLoop = btnLoop_Group.add("button", undefined, "◆-----◆◆");
    btnLoop.helpTip = "全体をLOOP再生（コンポ／連番フッテージ）";
    btnLoop.size = [80, 30];
    btnLoop.onClick = function () {
        app.beginUndoGroup("LoopOut設定");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) { app.endUndoGroup(); return; }

        var layers = comp.selectedLayers;
        if (!layers.length) { app.endUndoGroup(); return; }

        function oneFrameSec(src, compFR){
            try{ if (src instanceof CompItem && src.frameDuration>0) return src.frameDuration; }catch(e){}
            try{ if (src instanceof FootageItem && src.mainSource && src.mainSource.frameDuration>0) return src.mainSource.frameDuration; }catch(e){}
            return 1/(compFR||30);
        }

        for (var i=0;i<layers.length;i++){
            var ly = layers[i];
            var src = ly.source;
            if (!src) continue;

            var ok=false, dur=0;
            if (src instanceof CompItem){ ok = src.duration>0; dur = src.duration; }
            else if (src instanceof FootageItem){
                try{
                    var ms = src.mainSource;
                    var still = (ms && typeof ms.isStill==="boolean") ? ms.isStill : false;
                    ok = !still && src.hasVideo && src.duration>0;
                }catch(e){ ok = src.hasVideo && src.duration>0; }
                if (ok) dur = src.duration;
            }
            if (!ok) continue;

            var of = oneFrameSec(src, comp.frameRate);
            var endVal = Math.max(dur - of, of); // 終端-1F（最低1F幅）
            var span   = endVal;                  // 進行区間

            // クリア
            ly.timeRemapEnabled = true;
            var remap = ly.property("ADBE Time Remapping");
            for (var k=remap.numKeys;k>=1;k--) remap.removeKey(k);
            ly.timeRemapEnabled = true;
            remap = ly.property("ADBE Time Remapping");

            // 0 → 終端-1F → 0(即戻し)
            var t1 = ly.startTime;
            var t2 = t1 + span;
            var t3 = t2 + of; // 1Fだけ進めて瞬間ジャンプ

            remap.addKey(t1); remap.setValueAtKey(1, 0);
            remap.addKey(t2); remap.setValueAtKey(2, endVal);
            remap.addKey(t3); remap.setValueAtKey(3, 0);

            // 補間: 1→2 はリニア、2 はホールド、2→3 は即戻し
            remap.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
            remap.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
            remap.setInterpolationTypeAtKey(3, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

            remap.expression = 'loopOut(type = "cycle", numKeyframes = 0);';
            remap.expressionEnabled = true;
        }
        app.endUndoGroup();
    };

    //--------------------------------------------------
    // 4. ◆--L-◆◆ (マーカーを利用してループ設定)
    //--------------------------------------------------
    var btnLoopMarkers_Group = stopKeysGroup.add("group");
    btnLoopMarkers_Group.orientation = "row";
    btnLoopMarkers_Group.alignment = "center";

    var btnLoopMarkers = btnLoopMarkers_Group.add("button", undefined, "◆--L-◆◆");
    btnLoopMarkers.helpTip = "LOOPマーカー利用";
    btnLoopMarkers.size = [80, 30];
    btnLoopMarkers.onClick = function () {
        app.beginUndoGroup("MarkerBasedLoopByName");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) { app.endUndoGroup(); return; }

        var layers = comp.selectedLayers;
        if (!layers.length) { app.endUndoGroup(); return; }

        function oneFrameSec(src, compFR){
            try{ if (src instanceof CompItem && src.frameDuration>0) return src.frameDuration; }catch(e){}
            return 1/(compFR||30);
        }

        for (var i=0;i<layers.length;i++){
            var ly = layers[i];
            var src = ly.source;
            if (!(src instanceof CompItem)) continue;

            var markerProp = src.markerProperty;
            if (!markerProp || markerProp.numKeys===0){ alert("マーカーなし: "+ly.name); continue; }

            var L = null;
            for (var m=1;m<=markerProp.numKeys;m++){
                var v = markerProp.keyValue(m);
                var c = (v && v.comment) ? String(v.comment).toLowerCase() : "";
                if (c.indexOf("loop")!==-1 || c==="l"){ L = markerProp.keyTime(m); break; }
            }
            if (L===null){ alert("“LOOP”系マーカー未検出: "+ly.name); continue; }

            var of = oneFrameSec(src, comp.frameRate);
            var endVal = Math.max(src.duration - of, of); // 終端-1F
            var Lval   = Math.max(L, 0);                  // ループ基準

            // 区間長（時刻側も値側と一致させて等速）
            var span1 = Math.max(Lval, of);                 // 0 → L
            var span2 = Math.max(endVal - Lval, of);        // L → 終端-1F

            // クリア
            ly.timeRemapEnabled = true;
            var remap = ly.property("ADBE Time Remapping");
            for (var k=remap.numKeys;k>=1;k--) remap.removeKey(k);
            ly.timeRemapEnabled = true;
            remap = ly.property("ADBE Time Remapping");

            // 0 → L → 終端-1F → L(即戻し)
            var t1 = ly.startTime;
            var t2 = t1 + span1;
            var t3 = t2 + span2;
            var t4 = t3 + of; // 1Fだけ進めて瞬間ジャンプ

            remap.addKey(t1); remap.setValueAtKey(1, 0);
            remap.addKey(t2); remap.setValueAtKey(2, Lval);
            remap.addKey(t3); remap.setValueAtKey(3, endVal);
            remap.addKey(t4); remap.setValueAtKey(4, Lval);

            // 補間設定
            remap.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR); // 0→L
            remap.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR); // L→end-1F
            remap.setInterpolationTypeAtKey(3, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR); // end-1F→L は即戻し
            remap.setInterpolationTypeAtKey(4, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

            remap.expression = 'loopOut(type = "cycle", numKeyframes = 2);';
            remap.expressionEnabled = true;
        }
        app.endUndoGroup();
    };

    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "------------------------------------");
}

// ◆◆TOOLTAB◆◆

function buildCombined1UI(panel) {

// ★★★★★選択されたレイヤーの順序を逆にする（選択範囲内）★★★★★

    var reverseGroup = panel.add("group", undefined);
    reverseGroup.orientation = "column";
    reverseGroup.alignment = ["fill", "top"];

    var reverseLabel = reverseGroup.add("statictext", undefined, "-------選択レイヤーを逆配置-------");
    reverseLabel.helpTip = "選択されたレイヤーの順序を逆にします";

    var reverseButton = reverseGroup.add("button", undefined, "逆配置");
    reverseButton.helpTip = "選択範囲内でレイヤーの順序を反転させます";
    reverseButton.size = [120, 30];

    reverseButton.onClick = function () {
        reverseLayers();
        reverseButton.active = false;
    };

    function reverseLayers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("アクティブなコンポジションを選択してください。");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length < 2) {
            alert("少なくとも2つのレイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("選択範囲内で順序を反転");

        // 選択されたレイヤーの元のインデックスを収集して昇順ソート
        var indices = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            indices.push(selectedLayers[i].index);
        }
        indices.sort(function(a, b) { return a - b; });

        // 選択レイヤー（上から順）を、取得したインデックスの「逆順（下から順）」に配置
        // これにより、飛び飛びの選択でもその場所を維持したまま反転します
        for (var j = 0; j < selectedLayers.length; j++) {
            var targetIndex = indices[selectedLayers.length - 1 - j];
            selectedLayers[j].moveAfter(comp.layer(targetIndex));
        }

        app.endUndoGroup();
    }


    // ★★★★★コメントをテキストに変換し、レイヤー名をクリアする★★★★★

    var assignCommentGroup = panel.add("group", undefined);
    assignCommentGroup.orientation = "column";
    assignCommentGroup.alignment = ["fill", "top"];

    var assignCommentLabel = assignCommentGroup.add("statictext", undefined, "-------コメントをテキストに変換------");
    assignCommentLabel.helpTip = "レイヤーのコメントをテキストに変換します";

    var assignCommentButton = assignCommentGroup.add("button", undefined, "文字変換");
    assignCommentButton.helpTip = "選択されたレイヤーのコメントをテキストに変換";
    assignCommentButton.onClick = function () {
        convertCommentsToTextAndClearNames();
        assignCommentButton.active = false; // ボタンのアクティブ状態を解除
    };

    // ★★★★★テキストの長さに基づいてレイヤーの時間を調整する★★★★★

    var adjustTimeGroup = panel.add("group", undefined);
    adjustTimeGroup.orientation = "row";  // 横並びに配置
    adjustTimeGroup.alignment = "center";  // グループ全体を中央に配置

    var adjustTimeLabel = assignCommentGroup.add("statictext", undefined, "-------文字に応じて時間調整-------");
    adjustTimeLabel.helpTip = "文字数に応じてレイヤーの時間を調整";

    var adjustTimeButton = adjustTimeGroup.add("button", undefined, "時間調整");
    adjustTimeButton.helpTip = "1文字を指定nのフレームとしてレイヤーの時間を調整します";
    adjustTimeButton.size = [80, 30];  // ボタンのサイズを指定

    var frameInput = adjustTimeGroup.add("edittext", undefined, "5");
    frameInput.helpTip = "1文字あたりのフレーム数を入力します";
    frameInput.size = [30, 30];  // テキストボックスのサイズを指定

    adjustTimeButton.onClick = function () {
        var frameDuration = parseInt(frameInput.text, 10);
        if (!isNaN(frameDuration) && frameDuration > 0) {
            adjustLayerDuration(frameDuration);
        } else {
            alert("有効な数値を入力してください。");
        }
        adjustTimeButton.active = false; // ボタンのアクティブ状態を解除
    };

// ★★★★★レイヤーの長さに合わせてコンポ時間を調整（選択優先）★★★★★

    var adjustCompDurationGroup = panel.add("group", undefined);
    adjustCompDurationGroup.orientation = "column";
    adjustCompDurationGroup.alignment = ["fill", "top"];

    var adjustCompDurationLabel = adjustCompDurationGroup.add("statictext", undefined, "--レイヤー長さに基づくコンポ調整--");
    adjustCompDurationLabel.helpTip = "選択レイヤー（未選択なら全レイヤー）に合わせてコンポ時間を調整";

    var adjustCompDurationButton = adjustCompDurationGroup.add("button", undefined, "コンポ時間調整");
    adjustCompDurationButton.helpTip = "レイヤーの範囲に基づいてコンポジションの時間を調整します";
    adjustCompDurationButton.size = [120, 30];

    adjustCompDurationButton.onClick = function () {
        adjustCompDuration();
        adjustCompDurationButton.active = false;
    };

    function adjustCompDuration() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("コンポジションを選択してください。");
            return;
        }

        // 1. 対象となるレイヤーを決定（選択があればそれを、なければ全レイヤーを）
        var targetLayers = comp.selectedLayers.length > 0 ? comp.selectedLayers : comp.layers;
        
        // レイヤーが1つもない場合は終了
        if (targetLayers.length === 0 || comp.numLayers === 0) {
            alert("レイヤーが存在しません。");
            return;
        }

        app.beginUndoGroup("レイヤーに基づいてコンポ時間を調整");

        var minInPoint = comp.duration;
        var maxOutPoint = 0;

        // 2. 対象レイヤーの範囲を計算
        // targetLayers が Collection（全レイヤー）か Array（選択レイヤー）かで
        // インデックスの開始(0 or 1)が異なるため、安全なループ処理を行います
        for (var i = 1; i <= (comp.selectedLayers.length > 0 ? targetLayers.length : comp.numLayers); i++) {
            var layer = (comp.selectedLayers.length > 0) ? targetLayers[i-1] : comp.layer(i);
            if (layer.inPoint < minInPoint) minInPoint = layer.inPoint;
            if (layer.outPoint > maxOutPoint) maxOutPoint = layer.outPoint;
        }

        var newDuration = maxOutPoint - minInPoint;

        if (newDuration > 0) {
            // 3. 全レイヤーを移動させて 0秒開始にする
            for (var j = 1; j <= comp.numLayers; j++) {
                comp.layer(j).startTime -= minInPoint;
            }

            // 4. コンポの長さを設定
            comp.duration = newDuration;
            comp.displayStartTime = 0;
        }

        app.endUndoGroup();
    }

    // ★★★★★作業エリア内へ移動する★★★★★

    var moveToWorkAreaGroup = panel.add("group", undefined);
    moveToWorkAreaGroup.orientation = "column";
    moveToWorkAreaGroup.alignment = ["fill", "top"];
    moveToWorkAreaGroup.spacing = 10;
    moveToWorkAreaGroup.margins = [0, 10, 0, 0]; // Add top margin

    var moveToWorkAreaLabel = moveToWorkAreaGroup.add("statictext", undefined, "---------作業エリア先頭へ移動---------");
    moveToWorkAreaLabel.helpTip = "選択したレイヤーを作業領域に移動します";

    var moveToWorkAreaButton = moveToWorkAreaGroup.add("button", undefined, "移動");
    moveToWorkAreaButton.helpTip = "選択したレイヤーを作業領域に移動します";
    moveToWorkAreaButton.size = [120, 30]; // Specify button size

    moveToWorkAreaButton.onClick = function () {
        moveLayersToWorkArea();
    };

function moveLayersToWorkArea() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            app.beginUndoGroup("レイヤーをフルサイズで移動");
            var workAreaStart = comp.workAreaStart;
            var layers = comp.selectedLayers;

            if (layers.length === 0) {
                alert("移動するレイヤーを選択してください");
                app.endUndoGroup();
                return;
            }

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // --- トリミングを「素材の全尺」に強制リセット ---
                
                // 1. まずイン点を素材の「本当のゼロ地点」に戻す
                layer.inPoint = layer.startTime; 

                // 2. アウト点を設定（ここで長さを決める）
                if (layer.source !== null && !layer.source.isStill && layer.source.duration > 0) {
                    // 動画フッテージの場合：その動画の長さ（duration）に合わせる
                    layer.outPoint = layer.startTime + layer.source.duration;
                } else {
                    // 画像・テキスト・ヌル・シェイプなどの場合：
                    // 一旦、コンポジションと同じ長さ（duration）を確保する
                    layer.outPoint = layer.startTime + comp.duration;
                }

                // 3. 最後に、中身を維持したまま「作業エリアの先頭」へスライド
                // これで、中身が詰まった状態で移動します
                layer.startTime = workAreaStart;
            }

            app.endUndoGroup();
        } else {
            alert("コンポジションを選択してください");
        }
    }

    // 改行を挿入
    var separator6 = panel.add("statictext", undefined, "----------------------------------------------");
}

    // ★★★★★ここ迄★★★★★
// ◆◆TOOLTAB2◆◆


function buildCombined2UI(panel) {

    // ★★★★★選択されたレイヤーの名前をクリア★★★★★

    var clearNamesGroup = panel.add("group", undefined);
    clearNamesGroup.orientation = "column";
    clearNamesGroup.alignment = ["fill", "top"];

    // 説明ラベル
    var clearNamesLabel = clearNamesGroup.add("statictext", undefined, "-------------名前を初期化-------------");
    clearNamesLabel.helpTip = "選択されたレイヤーの名前をクリアします";

    // チェックボックスを追加
    var convertToEnglishCheckBox = clearNamesGroup.add("checkbox", undefined, "カメラ、ライト、シェイプ、ヌル、は英語");
    convertToEnglishCheckBox.value = false; // デフォルトでチェックを外す

    // 初期化ボタン
    var clearButton = clearNamesGroup.add("button", undefined, "初期化");
    clearButton.helpTip = "名前をクリア。カメラ、ライト、シェイプは英語に変換します";
    clearButton.onClick = function () {
        var comp = app.project.activeItem;
        if (comp != null && comp instanceof CompItem) {
            app.beginUndoGroup("Clear Layer Names");

            var selectedLayers = comp.selectedLayers;
            var camCount = 0;
            var litCount = 0;
            var shapeCount = 0;
            var nullCount = 0;

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];

                if (convertToEnglishCheckBox.value) {
                    // チェックボックスがオンの場合は英語に変換
                    if (layer instanceof CameraLayer) {
                        camCount++;
                        layer.name = "Cam" + (camCount < 10 ? "0" : "") + camCount;
                    } else if (layer instanceof LightLayer) {
                        litCount++;
                        layer.name = "Lit" + (litCount < 10 ? "0" : "") + litCount;
                    } else if (layer.matchName === "ADBE Vector Layer") { // シェイプレイヤー
                        shapeCount++;
                        layer.name = "Shape" + (shapeCount < 10 ? "0" : "") + shapeCount;
                    } else if (layer.nullLayer) { // Nullレイヤーの場合
                        nullCount++;
                        layer.name = "Null" + (nullCount < 10 ? "0" : "") + nullCount;
                    } else {
                        layer.name = ""; // その他のレイヤーは空の名前にする
                    }
                } else {
                    // チェックボックスがオフの場合はヌルと通常レイヤーのみ初期化
                    if (layer.nullLayer || !(layer instanceof CameraLayer || layer instanceof LightLayer || layer.matchName === "ADBE Vector Layer")) {
                        layer.name = ""; // 名前を空に初期化
                    }
                }
            }

            app.endUndoGroup();
        } else {
            alert("コンポジションを選択してください");
        }
        clearButton.active = false; // ボタンのアクティブ状態を解除
    };

    // ★★★★★選択したアイテムの名前にサイズ情報を追加・更新★★★★★
    var sizeUpdateGroup = panel.add("group", undefined);
    sizeUpdateGroup.orientation = "column";
    sizeUpdateGroup.alignment = ["fill", "top"];

    var sizeUpdateLabel = sizeUpdateGroup.add("statictext", undefined, "--名前末尾に_サイズ 追加/更新--");
    sizeUpdateLabel.helpTip = "選択アイテムの名前にサイズ情報を追加または更新します";

    var sizeUpdateButton = sizeUpdateGroup.add("button", undefined, "サイズ追加/更新");
    sizeUpdateButton.helpTip = "選択したアイテムの名前にサイズ情報を追加・更新します";

    sizeUpdateButton.onClick = function () {
        addOrUpdateSizeInSelectedItems();
    };

    function addOrUpdateSizeInSelectedItems() {
        app.beginUndoGroup("Rename Selected Items with Size");

        var selectedItems = app.project.selection;
        var activeComp = app.project.activeItem;

        if (selectedItems.length === 0 && !(activeComp instanceof CompItem && activeComp.selectedLayers.length > 0)) {
            alert("プロジェクトパネルまたはタイムラインパネルでアイテムを選択してください。");
            return;
        }

        var sizePattern = /(_\d+[xX＊*]\d+)$/;

        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];
            if (item instanceof FootageItem || item instanceof CompItem) {
                var itemWidth = item.width;
                var itemHeight = item.height;
                var sizeString = "_" + itemWidth + "*" + itemHeight;

                var newName = item.name.replace(sizePattern, "");
                newName += sizeString;
                item.name = newName;
            }
        }

        if (activeComp instanceof CompItem) {
            var selectedLayers = activeComp.selectedLayers;
            for (var j = 0; j < selectedLayers.length; j++) {
                var layer = selectedLayers[j];
                var source = layer.source;

                if (source instanceof FootageItem || source instanceof CompItem) {
                    var sourceWidth = source.width;
                    var sourceHeight = source.height;
                    var sizeString = "_" + sourceWidth + "*" + sourceHeight;

                    var newName = source.name.replace(sizePattern, "");
                    newName += sizeString;
                    source.name = newName;
                }
            }
        }

        app.endUndoGroup();
    }

    // ★★★★★作業画面を中央表示★★★★★
    var centerGroup = panel.add("group", undefined);
    centerGroup.orientation = "column";
    centerGroup.alignment = ["fill", "top"];

    var centerLabel = centerGroup.add("statictext", undefined, "--作業画面を中央表示--");
    centerLabel.helpTip = "作業画面を中央に表示します";

    var centerButton = centerGroup.add("button", undefined, "中央表示");
    centerButton.helpTip = "アクティブなコンポジションを中央に再描画します";

    centerButton.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("コンポをアクティブにしてください。");
            return;
        }

        app.beginUndoGroup("中央表示");
        try {
            // AEに「コンポ中央表示」APIはないため、
            // サイズを1ピクセルだけ変更 → 戻す ことで再描画を強制
            var w = comp.width, h = comp.height;
            comp.width = w + 1;
            comp.height = h + 1;
            comp.width = w;
            comp.height = h;
        } catch (e) {
            alert("中央表示に失敗しました:\n" + e.toString());
        }
        app.endUndoGroup();
    };

    // 改行を挿入
    panel.add("statictext", undefined, "----------------------------------------------");


    // ★★★★★平面をコンポに合わせる★★★★★

    // 見出し
    panel.add("statictext", undefined, "平面をコンポに合わせる");

    // UIブロック
    var fitGrp = panel.add("panel", undefined, "方法選択");
    fitGrp.orientation = "column";
    fitGrp.alignChildren = ["left", "top"];

    var fitRb1 = fitGrp.add("radiobutton", undefined, "方法1：スケールで合わせ");
    var fitRb2 = fitGrp.add("radiobutton", undefined, "方法2：ソースを合わせる");

    // 方法2のオプション（インデント）
    var fitOptGrp = fitGrp.add("group");
    fitOptGrp.margins = [20, 0, 0, 0];
    var fitChkNew = fitOptGrp.add("checkbox", undefined, "新規置換え");
    fitChkNew.helpTip =
        "チェックを入れると、元の平面ソースを変更せず、新しい平面を作成して置き換えます。\n" +
        "チェックなしだと、元の平面のサイズを変更します（同じ平面を使っている全レイヤーに影響します）。";

    // 初期状態
    fitRb1.value = true;
    fitChkNew.value = false;
    fitChkNew.enabled = false;

    // UI制御
    fitRb1.onClick = function () { fitChkNew.enabled = false; };
    fitRb2.onClick = function () { fitChkNew.enabled = true; };

    // 実行ボタン
    var fitBtn = panel.add("button", undefined, "実行");

    // ---- ここから処理関数群 ----
    function __T(layer) { return layer.property("ADBE Transform Group"); }
    function __P(layer) { return __T(layer).property("ADBE Position"); }
    function __S(layer) { return __T(layer).property("ADBE Scale"); }
    function __A(layer) { return __T(layer).property("ADBE Anchor Point"); }

    function __isResizableSource(layer) {
        try {
            return layer.source && layer.source.mainSource && (layer.source.mainSource instanceof SolidSource);
        } catch (e) { return false; }
    }

    function __centerLayer(layer, compW, compH, time) {
        var rect = layer.sourceRectAtTime(time, false);
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;

        if (layer.threeDLayer) {
            var currP = __P(layer).value;
            __A(layer).setValue([centerX, centerY, 0]);
            __P(layer).setValue([compW / 2, compH / 2, currP[2]]);
        } else {
            __A(layer).setValue([centerX, centerY]);
            __P(layer).setValue([compW / 2, compH / 2]);
        }
    }

    // シェイプ内の長方形・楕円サイズを再帰的に探して変更
    function __findAndSetShapeSize(propParent, w, h) {
        var foundAndSet = false;

        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);

            if (prop.matchName === "ADBE Vector Rect Size" || prop.matchName === "ADBE Vector Ellipse Size") {
                prop.setValue([w, h]);
                foundAndSet = true;
            } else if (prop.numProperties > 0) {
                if (__findAndSetShapeSize(prop, w, h)) foundAndSet = true;
            }
        }
        return foundAndSet;
    }

    // ---- 実行処理 ----
    fitBtn.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("コンポジションをアクティブにしてください。");
            return;
        }

        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("レイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("Fit to Comp Smart");

        var compW = comp.width;
        var compH = comp.height;
        var now = comp.time;

        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // AVLayer(平面含む) または ShapeLayer 以外はスキップ
                if (!(layer instanceof AVLayer) && !(layer instanceof ShapeLayer)) continue;

                // 共通：スケール合わせ（フォールバック）
                var fitScale = function () {
                    var rect = layer.sourceRectAtTime(now, false);
                    if (rect.width === 0 || rect.height === 0) return;

                    var sx = (compW / rect.width) * 100;
                    var sy = (compH / rect.height) * 100;

                    if (layer.threeDLayer) __S(layer).setValue([sx, sy, 100]);
                    else __S(layer).setValue([sx, sy]);

                    __centerLayer(layer, compW, compH, now);
                };

                // 方法1：すべてスケールで合わせる
                if (fitRb1.value) {
                    fitScale();
                    continue;
                }

                // 方法2：中身サイズを変更する
                if (fitRb2.value) {
                    // A. 平面・調整レイヤー
                    if (__isResizableSource(layer)) {

                        // ★ 新規作成して置き換え（共有回避）
                        if (fitChkNew.value) {
                            var oldSrc = layer.source;
                            var newColor = [0.5, 0.5, 0.5];
                            var oldName = layer.name;

                            if (oldSrc.mainSource && oldSrc.mainSource.color) {
                                newColor = oldSrc.mainSource.color;
                            }

                            // 一時的に新規平面を作ってソース取得
                            var tempLayer = comp.layers.addSolid(newColor, oldName, compW, compH, comp.pixelAspect, comp.duration);
                            var newSrc = tempLayer.source;
                            tempLayer.remove();

                            // ソース差し替え
                            layer.replaceSource(newSrc, false);
                        }
                        // ★ 既存ソースをリサイズ（共有あり）
                        else {
                            var src = layer.source;
                            src.width = compW;
                            src.height = compH;
                            src.pixelAspect = comp.pixelAspect;
                        }

                        // スケールを100%に戻して中央へ
                        if (layer.threeDLayer) __S(layer).setValue([100, 100, 100]);
                        else __S(layer).setValue([100, 100]);

                        __centerLayer(layer, compW, compH, now);
                    }
                    // B. シェイプレイヤー（長方形/楕円）
                    else if (layer instanceof ShapeLayer) {
                        var contents = layer.property("ADBE Root Vectors Group");
                        var isResized = __findAndSetShapeSize(contents, compW, compH);

                        if (isResized) {
                            if (layer.threeDLayer) __S(layer).setValue([100, 100, 100]);
                            else __S(layer).setValue([100, 100]);

                            __centerLayer(layer, compW, compH, now);
                        } else {
                            fitScale();
                        }
                    }
                    // C. その他（画像など）
                    else {
                        fitScale();
                    }
                }
            }
        } catch (e) {
            alert("Fit to Comp Smart でエラー:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    };



    // 改行を挿入
    panel.add("statictext", undefined, "----------------------------------------------");

}


    // ◆◆RemoveTAB◆◆

function buildRemoveUI(panel) {
    var group = panel.add("group", undefined);
    group.orientation = "column";
    group.alignment = ["fill", "top"];

    var separatorText = panel.add("statictext", undefined, "重複したものを削除します");
    separatorText.alignment = "center"; // 中央揃えにする場合

    var checkButton = panel.add("button", undefined, "調べる");
    checkButton.helpTip = "指定した条件に基づいて重複アイテムを検索します";

    var folderGroup = panel.add("group");
    folderGroup.add("statictext", undefined, "選択フォルダ:");
    var folderPath = folderGroup.add("edittext", undefined, "");
    folderPath.characters = 20;
    folderPath.helpTip = "重複アイテムを検索するフォルダを指定します";

    var resultText = panel.add("statictext", undefined, "重複数: 0");
    resultText.helpTip = "検索で検出された重複アイテムの数が表示されます";

    var checkBoxGroup = panel.add("panel", undefined, "重複条件");
    checkBoxGroup.orientation = "column";
    checkBoxGroup.alignChildren = ["left", "top"];

    var includeSubfoldersCheckBox = checkBoxGroup.add("checkbox", undefined, "サブフォルダを含める");
    includeSubfoldersCheckBox.helpTip = "選択されたフォルダ内のサブフォルダも検索対象に含めます";
    includeSubfoldersCheckBox.value = true;

    var nameCheckBox = checkBoxGroup.add("checkbox", undefined, "名前でチェック");
    nameCheckBox.helpTip = "アイテムの名前に基づいて重複を確認します";
    nameCheckBox.value = false;

    var ignoreNumbersCheckBox = checkBoxGroup.add("checkbox", undefined, "名前でチェック(数字_-xX*＊は無視)");
    ignoreNumbersCheckBox.helpTip = "名前のうち数字や特定の記号を無視して重複を確認します";
    ignoreNumbersCheckBox.value = true;

    var sizeCheckBox = checkBoxGroup.add("checkbox", undefined, "大きさでチェック");
    sizeCheckBox.helpTip = "アイテムのサイズ（幅と高さ）で重複を確認します";
    sizeCheckBox.value = true;

    var includeCompsCheckBox = checkBoxGroup.add("checkbox", undefined, "コンポを含める");
    includeCompsCheckBox.helpTip = "検索条件にコンポジションアイテムを含めます";
    includeCompsCheckBox.value = false;

    var executeButton = panel.add("button", undefined, "実行");
    executeButton.helpTip = "検索で検出された重複アイテムを統合または削除します";

    var selectedFolder;
    var duplicatesCount = 0;
    var duplicates = {};

    function checkDuplicates(folder) {
        duplicatesCount = 0;
        duplicates = {};

        function processFolder(folder) {
            for (var i = 1; i <= folder.numItems; i++) {
                var item = folder.item(i);

                if (item instanceof FolderItem && includeSubfoldersCheckBox.value) {
                    processFolder(item);
                } else if (!(item instanceof FolderItem)) {
                    if (item instanceof CompItem && !includeCompsCheckBox.value) {
                        continue;
                    }

                    var nameKey = "";
                    if (nameCheckBox.value || ignoreNumbersCheckBox.value) {
                        nameKey = ignoreNumbersCheckBox.value ? item.name.replace(/[\d_xX\*\＊\-]/g, "") : item.name;
                    }

                    var sizeKey = sizeCheckBox.value && item.hasOwnProperty("width") && item.hasOwnProperty("height")
                        ? item.width + "x" + item.height : "";

                    var combinedKey = nameKey + (nameKey && sizeKey ? "_" : "") + sizeKey;

                    if (combinedKey && duplicates[combinedKey]) {
                        duplicates[combinedKey].push(item);
                        duplicatesCount++;
                    } else if (combinedKey) {
                        duplicates[combinedKey] = [item];
                    }
                }
            }
        }

        processFolder(folder);
        resultText.text = "重複数: " + duplicatesCount;
        folderPath.text = folder.name;
    }

    function executeConsolidation() {
        app.beginUndoGroup("Consolidate Duplicates");

        for (var key in duplicates) {
            var items = duplicates[key];
            if (items.length > 1) {
                var originalItem = items[0];
                for (var i = 1; i < items.length; i++) {
                    var duplicateItem = items[i];

                    for (var j = 1; j <= app.project.numItems; j++) {
                        var comp = app.project.item(j);
                        if (comp instanceof CompItem) {
                            for (var k = 1; k <= comp.numLayers; k++) {
                                var layer = comp.layer(k);
                                if (layer.source === duplicateItem) {
                                    layer.replaceSource(originalItem, false);
                                }
                            }
                        }
                    }

                    if (!duplicateItem.usedIn.length) {
                        duplicateItem.remove();
                    }
                }
            }
        }

        app.endUndoGroup();
        alert("重複アイテムの整理が完了しました。");
        resultText.text = "重複数: 0";
    }

    checkButton.onClick = function () {
        if (app.project.selection.length > 0 && app.project.selection[0] instanceof FolderItem) {
            selectedFolder = app.project.selection[0];
            folderPath.text = selectedFolder.name;
            checkDuplicates(selectedFolder);
        } else {
            alert("プロジェクトパネルでフォルダを選択してください。");
        }
    };

    executeButton.onClick = function () {
        if (selectedFolder) {
            executeConsolidation();
        } else {
            alert("最初に「調べる」ボタンで重複を確認してください。");
        }
    };
}


// ◆◆ShakeTAB◆◆
// ★★★★★Shake★★★★★

function buildShakeUI(panel) {
    // shake の UI を構築
    panel.alignChildren = "fill";

    var directionPanel = panel.add("panel", undefined, "画ブレ");
    directionPanel.alignChildren = "left";
    var xCheckbox = directionPanel.add("checkbox", undefined, "X方向に揺れる");
    var yCheckbox = directionPanel.add("checkbox", undefined, "Y方向に揺れる");

        // helpTipを追加
        xCheckbox.helpTip = "XとYどちらかにチェックが入ってる場合、その軸だけ揺らします。";
        yCheckbox.helpTip = "XとY両方にチェックが入ってる場合は上下左右ランダムに揺れます。";

    // 初期設定でチェックボックスをオンにする
    xCheckbox.value = true;
    yCheckbox.value = true;

    // 横に配置するためにグループを作成
    var magnitudeGroup = panel.add("group");
    magnitudeGroup.add("statictext", undefined, "移動幅:");
    var magnitudeInput = magnitudeGroup.add("edittext", undefined, "30"); // 移動幅のデフォルト値を30に設定
    magnitudeInput.characters = 5;
    magnitudeInput.helpTip = "揺れの最大幅をピクセル単位で設定します。";

    // 横に配置するためにグループを作成
    var durationGroup = panel.add("group");
    durationGroup.add("statictext", undefined, "揺れる時間（フレーム）:");
    var durationInput = durationGroup.add("edittext", undefined, "20"); // デフォルトは20フレームに設定
    durationInput.characters = 5;
    durationInput.helpTip = "揺れの持続時間をフレーム単位で設定します。";

    var execButton = panel.add("button", undefined, "揺れを適用");
    execButton.helpTip = "指定した設定に基づいて揺れをレイヤーに適用します。";

    // 実行ボタンが押された時の処理
    execButton.onClick = function () {
        var magnitude = parseFloat(magnitudeInput.text);
        var duration = parseInt(durationInput.text);
        var isXChecked = xCheckbox.value;
        var isYChecked = yCheckbox.value;

        if (!isXChecked && !isYChecked) {
            alert("X方向かY方向のどちらかを選択してください。");
            return;
        }

        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("コンポジションを選択してください。");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("揺れを適用するレイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("揺れを適用");

        // 選択した各レイヤーに対して揺れを適用
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var initialPos = layer.transform.position.value;  // 最初の位置（0フレーム目の位置）

            // 0フレーム目は位置をそのままにする
            layer.transform.position.setValueAtTime(comp.time, initialPos);

            // 1フレーム目から動かし始める
            for (var f = 1; f <= duration; f++) {
                // 時間が進むにつれて減衰するAの値を計算
                var progress = f / duration;
                var decay = Math.exp(-progress * 5);  // 徐々に収まる揺れ
                var A = magnitude * decay;  // Aの値が時間とともに減る

                var xOffset = 0;
                var yOffset = 0;

                // X方向とY方向が両方チェックされている場合、Aをランダムに分配
                if (isXChecked && isYChecked) {
                    var angle = Math.random() * Math.PI * 2;  // 0〜2πのランダムな角度
                    xOffset = A * Math.cos(angle);  // ランダムな方向のX成分
                    yOffset = A * Math.sin(angle);  // ランダムな方向のY成分
                } else {
                    // 一方の方向にのみ揺れる場合
                    if (isXChecked) {
                        xOffset = (f % 2 === 0 ? 1 : -1) * A;  // X方向の揺れ
                    }
                    if (isYChecked) {
                        yOffset = (f % 2 === 0 ? 1 : -1) * A;  // Y方向の揺れ
                    }
                }

                var newPos = [
                    initialPos[0] + xOffset,
                    initialPos[1] + yOffset
                ];

                // キーフレームを設定
                layer.transform.position.setValueAtTime(comp.time + f / comp.frameRate, newPos);
            }

            // 最終フレームで元の位置に戻す
            layer.transform.position.setValueAtTime(comp.time + duration / comp.frameRate, initialPos);
        }

}

      // ★★★★★小数点切り捨て★★★★★
// ★★★★★ Floor All Values (Integer) ★★★★★

    var floorPanel = panel.add("panel", undefined, "数値の整理");
    floorPanel.alignment = ["fill", "top"];
    
    var floorButton = floorPanel.add("button", undefined, "小数点を切り捨て");
    floorButton.helpTip = "選択レイヤー内の全プロパティ（トランスフォーム、エフェクト等）の数値を整数にします。";
    floorButton.size = [200, 40];

    floorButton.onClick = function() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("コンポジションを選択してください。");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("レイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("小数点の切り捨て処理");

        for (var i = 0; i < layers.length; i++) {
            processProperties(layers[i]);
        }

        app.endUndoGroup();
        // alert("処理が完了しました。");
    };

    /**
     * 全てのプロパティを再帰的に巡回し、数値を切り捨てる関数
     */
    function processProperties(propParent) {
        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);

            if (prop.propertyType === PropertyType.PROPERTY) {
                // 書き込み可能な数値型プロパティかチェック
                if (prop.hasMinMax || prop.propertyValueType !== PropertyValueType.NO_VALUE) {
                    try {
                        floorPropertyValue(prop);
                    } catch (e) {
                        // 読み取り専用などのエラー回避
                    }
                }
            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                processProperties(prop);
            }
        }
    }

    /**
     * プロパティの値を切り捨てる処理
     */
    function floorPropertyValue(prop) {
        // キーフレームがある場合は全てのキーを処理
        if (prop.numKeys > 0) {
            for (var k = 1; k <= prop.numKeys; k++) {
                var val = prop.keyValue(k);
                prop.setValueAtKey(k, getFlooredValue(val));
            }
        } else {
            // キーがない場合は現在の値を処理
            var val = prop.value;
            prop.setValue(getFlooredValue(val));
        }
    }

    /**
     * 数値または配列を切り捨てる補助関数
     */
    function getFlooredValue(val) {
        if (typeof val === "number") {
            return Math.floor(val);
        } else if (val instanceof Array) {
            var newArray = [];
            for (var i = 0; i < val.length; i++) {
                // 配列の中身が数値なら切り捨て、そうでなければそのまま
                newArray.push(typeof val[i] === "number" ? Math.floor(val[i]) : val[i]);
            }
            return newArray;
        }
        return val;
    }

        // ★★★★★Delete★★★★★

	// 削除機能のセクション（シンプルにボタンのみ）
    var deletePanel = panel.add("panel", undefined, "一括初期化");
    deletePanel.alignment = ["fill", "top"];
    
    var deleteAllButton = deletePanel.add("button", undefined, "全てのキー・情報を削除");
    deleteAllButton.helpTip = "選択レイヤーの全キーフレーム、エクスプレッション、エフェクト、マスクを完全に削除・リセットします。";
    deleteAllButton.size = [200, 40];

    deleteAllButton.onClick = function() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("コンポジションを選択してください。");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("レイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("レイヤーの完全初期化");

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            // 1. エフェクトをすべて削除
            // var effectsGroup = layer.property("ADBE Effect Parade");
            // while (effectsGroup && effectsGroup.numProperties > 0) {
            //    effectsGroup.property(1).remove();
            // }

            // 2. マスクをすべて削除
            //var maskGroup = layer.property("ADBE Mask Parade");
            //while (maskGroup && maskGroup.numProperties > 0) {
            //    maskGroup.property(1).remove();
            //}

            // 3. タイムリマップを無効化
            if (layer.canEnableTimeRemap && layer.timeRemapEnabled) {
                layer.timeRemapEnabled = false;
            }

            // 4. 全プロパティのキーフレームとエクスプレッションを削除（再帰処理）
            // これにより、トランスフォームだけでなくシェイプの中身やテキストの中身も対象になります
            removeAllKeysAndExpressions(layer);
        }
    }

    /**
     * プロパティグループを深掘りして全てのキーとエクスプレッションを消す関数
     */
    function removeAllKeysAndExpressions(propParent) {
        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);
            
            if (prop.propertyType === PropertyType.PROPERTY) {
                // キーフレームがある場合は削除
                if (prop.numKeys > 0) {
                    for (var k = prop.numKeys; k > 0; k--) {
                        prop.removeKey(k);
                    }
                }
                // エクスプレッションがある場合は削除
                if (prop.canSetExpression && prop.expression !== "") {
                    prop.expression = "";
                }
            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                // グループ（シェイプの中身など）の場合はさらに深く潜る
                removeAllKeysAndExpressions(prop);
            }
        }
    }
}
        // ★★★★★end★★★★★


 buildUI(myPanel);

 if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
   } else {
    myPanel.layout.layout(true);
   }
