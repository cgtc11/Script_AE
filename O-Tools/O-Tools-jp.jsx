//===========================================================================
// O_Tools V1.5.7a by Digimonkey
//===========================================================================

var thisObj = this;
var myPanel = (thisObj instanceof Panel)
    ? thisObj
    : new Window("palette", "oTools", undefined, { resizeable: true });

function buildUI(panel) {
    var tabPanel = panel.add("tabbedpanel");
    tabPanel.size = [290, 512];

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

    return panel;
}


    // ◆◆NameEdTAB◆◆


function buildNameEdUI(panel) {
    var mode = "name"; // "name" or "comment"

    function getSelectedItemsData() {
        var project = app.project;
        var selectedItems = project.selection;
        var data = [];

        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i] instanceof CompItem || selectedItems[i] instanceof FootageItem || selectedItems[i] instanceof FolderItem) {
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
                if (selectedItems[i] instanceof CompItem || selectedItems[i] instanceof FootageItem || selectedItems[i] instanceof FolderItem) {
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

    var radioGroup = panel.add("group", undefined);
    radioGroup.orientation = "row";
    var nameRadio = radioGroup.add("radiobutton", undefined, "名前");
    var commentRadio = radioGroup.add("radiobutton", undefined, "コメント");

    nameRadio.value = true;
    nameRadio.onClick = function () { mode = "name"; };
    commentRadio.onClick = function () { mode = "comment"; };

    var buttonGroup = panel.add("group", undefined);
    buttonGroup.orientation = "row";
    var getButton = buttonGroup.add("button", undefined, "取得");
    getButton.helpTip = "選択されたアイテムの名前またはコメントを取得します";
    var updateButton = buttonGroup.add("button", undefined, "更新");
    updateButton.helpTip = "テキストフィールドのデータで選択されたアイテムを更新します";

    var replaceGroup = panel.add("group", undefined);
    replaceGroup.orientation = "row";
    var oldTextField = replaceGroup.add("edittext", undefined, "");
    var newTextField = replaceGroup.add("edittext", undefined, "");
    var replaceButton = replaceGroup.add("button", undefined, "置換");
    replaceButton.helpTip = "指定されたテキストを新しいテキストに置き換えます";

    oldTextField.size = [60, 20];
    newTextField.size = [60, 20];

    replaceButton.onClick = function () {
        var currentData = outputField.text;
        var replacedData = currentData.replace(new RegExp(oldTextField.text, 'g'), newTextField.text);
        outputField.text = replacedData;
    };

    var outputField = panel.add("edittext", undefined, "", { multiline: true });
    outputField.size = [200, 300];

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

    updateButton.onClick = function () {
        updateSelectedItemsData(outputField.text);

        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            updateSelectedLayersData(comp, outputField.text);
        }
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
    // 3. ◆-----◆ (ループ再生)
    //--------------------------------------------------
    // グループのサイズを調整
    var btnLoop_Group = stopKeysGroup.add("group");
    btnLoop_Group.orientation = "row";
    btnLoop_Group.alignment = "center";  // グループ全体を中央に配置

    var btnLoop = btnLoop_Group.add("button", undefined, "◆-----◆");
    btnLoop.helpTip = "全体をLOOP再生（コンポ／連番フッテージ）";
    btnLoop.size = [80, 30];
    btnLoop.onClick = function () {
        app.beginUndoGroup("LoopOut設定");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) { app.endUndoGroup(); return; }

        var layers = comp.selectedLayers;
        if (!layers.length) { app.endUndoGroup(); return; }

        var fr = comp.frameRate;
        var oneFrame = 1 / fr;

        for (var i = 0; i < layers.length; i++) {
            var ly = layers[i];
            var src = ly.source;
            if (!src) { continue; }

            // 連番フッテージ対応: FootageItem かつ isStill=false を許可
            var loopOK = false;
            var srcDur = 0;

        if (src instanceof CompItem) {
            loopOK = src.duration > 0;
            srcDur = src.duration;
        } else if (src instanceof FootageItem) {
            try {
                var ms = src.mainSource;
                var isStill = (ms && typeof ms.isStill === "boolean") ? ms.isStill : false;
                loopOK = (!isStill) && src.hasVideo && src.duration > 0;
            } catch (e) {
                loopOK = src.hasVideo && src.duration > 0;
            }
            if (loopOK) srcDur = src.duration;
        }

        if (!loopOK) { continue; }

        // タイムリマップ初期化
        ly.timeRemapEnabled = true;
        var remap = ly.property("ADBE Time Remapping");
        for (var k = remap.numKeys; k >= 1; k--) { remap.removeKey(k); }

        // 再度ONでクリーンに
        ly.timeRemapEnabled = true;
        remap = ly.property("ADBE Time Remapping");

        // 2キー構成: In と (In + srcDur - 1F)
        var startT = ly.inPoint;
        var endT = startT + Math.max(srcDur - oneFrame, oneFrame); // 最低でも1F幅
        remap.addKey(startT);
        remap.addKey(endT);

        // 余計なキー排除（安全策）
        while (remap.numKeys > 2) { remap.removeKey(3); }

        // ループ式
        remap.expression =
            'loopOut("cycle");\n' +
            'if(time==key(numKeys).time){key(1)}else{loopOut("cycle");};';
        remap.expressionEnabled = true;
        }
        app.endUndoGroup();
    };



    //--------------------------------------------------
    // 4. ◆--L-◆◆ (マーカーを利用してループ設定)
    //--------------------------------------------------
    // グループのサイズを調整
    var btnLoopMarkers_Group = stopKeysGroup.add("group");
    btnLoopMarkers_Group.orientation = "row";
    btnLoopMarkers_Group.alignment = "center";  // グループ全体を中央に配置

    var btnLoopMarkers = btnLoopMarkers_Group.add("button", undefined, "◆--L-◆◆");
    btnLoopMarkers.helpTip = "LOOPマーカー利用";
    btnLoopMarkers.size = [80, 30];
    btnLoopMarkers.onClick = function () {
    app.beginUndoGroup("MarkerBasedLoopByName");
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
        var ly = layers[i];
        if (!(ly.source instanceof CompItem)) continue;

        var markerProp = ly.source.markerProperty;
        var loopMarkerTime = null;

        for (var m = 1; m <= markerProp.numKeys; m++) {
            var comment = markerProp.keyValue(m).comment.toLowerCase();
            if (comment.indexOf("loop") !== -1 || comment === "l") {
                loopMarkerTime = markerProp.keyTime(m);
                break;
            }
        }

        if (loopMarkerTime === null) {
            alert("“LOOP”と名のつくマーカーが見つかりません");
            app.endUndoGroup();
            return;
        }

        // タイムリマップ処理
        ly.timeRemapEnabled = true;
        var remap = ly.property("ADBE Time Remapping");
        for (var k = remap.numKeys; k >= 1; k--) {
            remap.removeKey(k);
        }

        ly.timeRemapEnabled = true;
        remap = ly.property("ADBE Time Remapping");

        remap.addKey(ly.inPoint); // スタート地点
        remap.addKey(ly.inPoint + loopMarkerTime); // LOOP地点
        var lastTime = ly.inPoint + ly.source.duration - 1 / comp.frameRate;
	remap.addKey(lastTime); // 最後から1F手前
	remap.setValueAtKey(4, remap.valueAtTime(ly.inPoint + loopMarkerTime, false));// LOOPre

        remap.expression =
            'loopOut(type = "cycle", numKeyframes = 2)';

        remap.expressionEnabled = true;
    }

    app.endUndoGroup();

};
    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "------------------------------------");
}

// ◆◆TOOLTAB◆◆

function buildCombined1UI(panel) {

    // ★★★★★選択されたレイヤーの順序を逆にする★★★★★

    var reverseGroup = panel.add("group", undefined);
    reverseGroup.orientation = "column";
    reverseGroup.alignment = ["fill", "top"];

    var reverseLabel = reverseGroup.add("statictext", undefined, "-------選択レイヤーを逆配置-------");
    reverseLabel.helpTip = "選択されたレイヤーの順序を逆にします";

    var reverseButton = reverseGroup.add("button", undefined, "逆配置");
    reverseButton.helpTip = "上から選択されたレイヤーの順序を反転させます";
    reverseButton.onClick = function () {
        reverseLayers();
        reverseButton.active = false; // ボタンのアクティブ状態を解除
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

        app.beginUndoGroup("Reverse Selected Layers");

        // レイヤーの元のインデックスを記録
        var layerIndices = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            layerIndices.push(selectedLayers[i].index);
        }

        // レイヤーを逆順に移動
        for (var i = 0; i < selectedLayers.length; i++) {
            var targetIndex = layerIndices[selectedLayers.length - 1 - i];
            selectedLayers[i].moveBefore(comp.layer(targetIndex));
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

    // ★★★★★レイヤーの長さに基づいてコンポの時間を調整する★★★★★

    var adjustCompDurationGroup = panel.add("group", undefined);
    adjustCompDurationGroup.orientation = "column";
    adjustCompDurationGroup.alignment = ["fill", "top"];

    var adjustCompDurationLabel = adjustCompDurationGroup.add("statictext", undefined, "--レイヤー長さに基づくコンポ調整--");
    adjustCompDurationLabel.helpTip = "レイヤーの長さに基づいてコンポの時間を調整";

    var adjustCompDurationButton = adjustCompDurationGroup.add("button", undefined, "コンポ時間調整");
    adjustCompDurationButton.helpTip = "レイヤーの長さに基づいてコンポジションの時間を調整します";
    adjustCompDurationButton.size = [120, 30]; // ボタンのサイズを指定

    adjustCompDurationButton.onClick = function () {
        adjustCompDuration();
        adjustCompDurationButton.active = false; // ボタンのアクティブ状態を解除
    };

    function adjustCompDuration() {
        var comp = app.project.activeItem;
        if (comp != null && comp instanceof CompItem) {
            app.beginUndoGroup("Adjust Composition Duration Based on Layers");

            var minInPoint = comp.duration;
            var maxOutPoint = 0;

            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                if (layer.inPoint < minInPoint) {
                    minInPoint = layer.inPoint;
                }
                if (layer.outPoint > maxOutPoint) {
                    maxOutPoint = layer.outPoint;
                }
            }

            var newDuration = maxOutPoint - minInPoint;
            comp.duration = newDuration;

            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                layer.startTime -= minInPoint;
            }

            comp.displayStartTime = 0;

            app.endUndoGroup();
        } else {
            alert("コンポジションを選択してください。");
        }
    }

    // ★★★★★作業エリア内へ移動する★★★★★

    var moveToWorkAreaGroup = panel.add("group", undefined);
    moveToWorkAreaGroup.orientation = "column";
    moveToWorkAreaGroup.alignment = ["fill", "top"];
    moveToWorkAreaGroup.spacing = 10;
    moveToWorkAreaGroup.margins = [0, 10, 0, 0]; // Add top margin

    var moveToWorkAreaLabel = moveToWorkAreaGroup.add("statictext", undefined, "---------作業エリア先頭へ移動---------");
    moveToWorkAreaLabel.helpTip = "Moves the selected layer to the start time of the work area";

    var moveToWorkAreaButton = moveToWorkAreaGroup.add("button", undefined, "移動");
    moveToWorkAreaButton.helpTip = "Moves the selected layer to the start time of the work area";
    moveToWorkAreaButton.size = [120, 30]; // Specify button size

    moveToWorkAreaButton.onClick = function () {
        moveLayersToWorkArea();
    };

    function moveLayersToWorkArea() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            app.beginUndoGroup("レイヤーを作業領域に移動する");
            var workAreaStart = comp.workAreaStart;
            var layers = comp.selectedLayers;

            if (layers.length === 0) {
                alert("移動するレイヤーを選択してください");
                app.endUndoGroup();
                return;
            }

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                layer.startTime = workAreaStart;
            }

            app.endUndoGroup();
            //alert("選択したレイヤーは作業領域開始に移動されました");
        } else {
            alert("選択してください");
        }
    }
    // 改行を挿入
    var separator6 = panel.add("statictext", undefined, "----------------------------------------------");
}
    // ★★★★★ここ迄★★★★★

function reverseLayers() {
    var comp = app.project.activeItem;
    if (comp != null && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length > 1) {
            app.beginUndoGroup("Reverse Layers");

            // 選択されたレイヤーを順序の逆に配置
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layer.moveToBeginning();
            }

            app.endUndoGroup();
        } else {
            alert("複数のレイヤーを選択してください。");
        }
    } else {
        alert("コンポジションが選択されていません。");
    }
}

function convertCommentsToTextAndClearNames() {
    var comp = app.project.activeItem;
    if (comp != null && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length > 0) {
            app.beginUndoGroup("Convert Comments to Text and Clear Layer Names");

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                if (layer instanceof TextLayer) {
                    var commentText = layer.comment;

                    if (commentText != "") {
                        layer.property("Source Text").setValue(commentText);
                    }
                    // レイヤー名をクリア
                    layer.name = "";
                }
            }

            app.endUndoGroup();
        } else {
            alert("テキストレイヤーを選択してください。");
        }
    } else {
        alert("コンポジションが選択されていません。");
    }
}

function adjustLayerDuration(frameDuration) {
    var comp = app.project.activeItem;
    if (comp != null && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length > 0 && frameDuration) {
            app.beginUndoGroup("Adjust Layer Duration Based on Text Length");

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                if (layer instanceof TextLayer) {
                    var text = layer.property("Source Text").value.text;

                    var totalFrames = text.length * frameDuration;
                    var durationInSeconds = totalFrames / comp.frameRate;

                    // レイヤーの終了時間を調整
                    layer.outPoint = layer.inPoint + durationInSeconds;
                }
            }

            app.endUndoGroup();
        } else {
            alert("テキストレイヤーを選択してください。");
        }
    } else {
        alert("コンポジションが選択されていません。");
    }
}


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
}


    // ◆◆RemoveTAB◆◆

function buildRemoveUI(panel) {
    var group = panel.add("group", undefined);
    group.orientation = "column";
    group.alignment = ["fill", "top"];

    var separatorText = panel.add("statictext", undefined, "重複したものを削除します");
    separatorText.alignment = "center"; // 中央揃えにする場合

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

    var checkButton = panel.add("button", undefined, "調べる");
    checkButton.helpTip = "指定した条件に基づいて重複アイテムを検索します";

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

        app.endUndoGroup();
    };

        // ★★★★★Delete★★★★★

        // 削除機能のセクション
        var deletePanel = panel.add("panel", undefined, "削除項目");
        deletePanel.alignChildren = "left";
        var transformCheckbox = deletePanel.add("checkbox", undefined, "トランスフォーム削除");
        var expressionCheckbox = deletePanel.add("checkbox", undefined, "エクスプレッション削除");
        var effectsCheckbox = deletePanel.add("checkbox", undefined, "エフェクト削除");
        var maskCheckbox = deletePanel.add("checkbox", undefined, "マスク削除");
        var timeRemapCheckbox = deletePanel.add("checkbox", undefined, "タイムリマップ削除"); // タイムリマップ削除のチェックボックス追加

        // helpTipを追加
        transformCheckbox.helpTip = "選択されたレイヤーの位置や回転などのトランスフォームプロパティを削除します。";
        expressionCheckbox.helpTip = "選択されたレイヤーのエクスプレッションを削除します。";
        effectsCheckbox.helpTip = "選択されたレイヤーに適用されているエフェクトを削除します。";
        maskCheckbox.helpTip = "選択されたレイヤーに設定されたマスクを削除します。";
        timeRemapCheckbox.helpTip = "選択されたレイヤーのタイムリマップを削除します。";

        // チェックボックスのデフォルト設定
        transformCheckbox.value = true;    // トランスフォーム削除をデフォルトでチェック
        expressionCheckbox.value = true;   // エクスプレッション削除をデフォルトでチェック
        effectsCheckbox.value = true;      // エフェクト削除をデフォルトでチェック
        maskCheckbox.value = true;         // マスク削除をデフォルトでチェック
        timeRemapCheckbox.value = true;  // タイムリマップ削除をデフォルトでチェック

        // 削除ボタン
        var deleteButton = panel.add("button", undefined, "削除");
　　　　deleteButton.helpTip = "選択されたレイヤーに対して、チェックボックスで指定した項目を削除します。";

        // 削除ボタンが押された時の処理
        deleteButton.onClick = function() {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("コンポジションを選択してください。");
                return;
            }

            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("削除するレイヤーを選択してください。");
                return;
            }

            app.beginUndoGroup("削除処理");

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // トランスフォーム削除
                if (transformCheckbox.value) {
                    var properties = ['position', 'rotation', 'scale', 'opacity', 'anchorPoint'];
                    for (var j = 0; j < properties.length; j++) {
                        var prop = layer.transform[properties[j]];
                        
                        // キーフレーム削除
                        if (prop && prop.numKeys > 0) {
                            for (var k = prop.numKeys; k > 0; k--) {
                                prop.removeKey(k);
                            }
                        }
                    }
                }

                // エクスプレッション削除
                if (expressionCheckbox.value) {
                    var propsWithExpressions = ['position', 'rotation', 'scale', 'opacity', 'anchorPoint'];
                    for (var j = 0; j < propsWithExpressions.length; j++) {
                        var prop = layer.transform[propsWithExpressions[j]];
                        if (prop && prop.expression !== "") {
                            prop.expression = "";  // エクスプレッション削除
                        }
                    }
                }

                // エフェクト削除
                if (effectsCheckbox.value) {
                    var effectsGroup = layer.property("ADBE Effect Parade");
                    if (effectsGroup && effectsGroup.numProperties > 0) {
                        while (effectsGroup.numProperties > 0) {
                            effectsGroup.property(1).remove();
                        }
                    }
                }

                // マスク削除
                if (maskCheckbox.value) {
                    var maskGroup = layer.property("ADBE Mask Parade");
                    if (maskGroup && maskGroup.numProperties > 0) {
                        while (maskGroup.numProperties > 0) {
                            maskGroup.property(1).remove();
                        }
                    }
                }

                // タイムリマップ削除
                if (timeRemapCheckbox.value) {
                    var timeRemapProp = layer.property("ADBE Time Remapping");
                    if (timeRemapProp && timeRemapProp.numKeys > 0) {
                        for (var k = timeRemapProp.numKeys; k > 0; k--) {
                            timeRemapProp.removeKey(k);
                        }
                        layer.timeRemapEnabled = false; // タイムリマップを無効にする
                    }
                }

            }
            app.endUndoGroup();
    };

        // ★★★★★end★★★★★
}

 buildUI(myPanel);

 if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
   } else {
    myPanel.layout.layout(true);
   }
