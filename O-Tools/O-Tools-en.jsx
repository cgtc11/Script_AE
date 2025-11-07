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

    // --- Create each tab ---
    var tab1 = tabPanel.add("tab", undefined, "Na");
    var tab2 = tabPanel.add("tab", undefined, "TR");
    var tab3 = tabPanel.add("tab", undefined, "T1");
    var tab4 = tabPanel.add("tab", undefined, "T2");
    var tab5 = tabPanel.add("tab", undefined, "Re");
    var tab6 = tabPanel.add("tab", undefined, "Sh");

    // --- Build contents ---
    buildNameEdUI(tab1);
    buildTReMapUI(tab2);
    buildCombined1UI(tab3);
    buildCombined2UI(tab4);
    buildRemoveUI(tab5);
    buildShakeUI(tab6);

    // --- Tab switch event (same syntax as Tab.jsx) ---
    tabPanel.onChange = function () {
        var sel = tabPanel.selection;
        if (!sel) return; // do nothing if null

        tab1.text = (sel === tab1) ? "NameEd"   : "Na";
        tab2.text = (sel === tab2) ? "TReMap"   : "TR";
        tab3.text = (sel === tab3) ? "Tools1"   : "T1";
        tab4.text = (sel === tab4) ? "Tools2"   : "T2";
        tab5.text = (sel === tab5) ? "Remove"   : "Re";
        tab6.text = (sel === tab6) ? "Shake"    : "Sh";
    };

    // --- Initial selection ---
    tabPanel.selection = tab1;
    tab1.text = "NameEd";

    return panel;
}


// ◆◆NameEd TAB◆◆



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
    var nameRadio = radioGroup.add("radiobutton", undefined, "Name");
    var commentRadio = radioGroup.add("radiobutton", undefined, "Comment");

    nameRadio.value = true;
    nameRadio.onClick = function () { mode = "name"; };
    commentRadio.onClick = function () { mode = "comment"; };

    var buttonGroup = panel.add("group", undefined);
    buttonGroup.orientation = "row";
    var getButton = buttonGroup.add("button", undefined, "Get");
    getButton.helpTip = "Retrieves the name or comment of the selected item";
    var updateButton = buttonGroup.add("button", undefined, "Update");
    updateButton.helpTip = "Update selected items with data in text field";

    var replaceGroup = panel.add("group", undefined);
    replaceGroup.orientation = "row";
    var oldTextField = replaceGroup.add("edittext", undefined, "");
    var newTextField = replaceGroup.add("edittext", undefined, "");
    var replaceButton = replaceGroup.add("button", undefined, "Replace");
    replaceButton.helpTip = "Replaces the specified text with the new text";

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

    // ★★★★★Insert stop keys at specified intervals★★★★★

    var stopKeysGroup = panel.add("group", undefined);
    stopKeysGroup.orientation = "column";
    stopKeysGroup.alignment = ["fill", "top"];

    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "-----------Limited animation-----------");
    stopKeysLabel.helpTip = "Limited Animation Production";

    // Adjust the size of the group
    var T1_Btn_selecr_Keys_Group = stopKeysGroup.add("group");
    T1_Btn_selecr_Keys_Group.orientation = "row";
    T1_Btn_selecr_Keys_Group.alignment = "center";  // Center the entire group

    // Place the button and EditText inside the group
    var T1_Btn_selecr_Keys = T1_Btn_selecr_Keys_Group.add("button", undefined, "Limited Animation");
    var T1_Btn_selecr_Keys_Num = T1_Btn_selecr_Keys_Group.add("edittext", undefined, "2");

    // Properly set the size of the button and EditText
    T1_Btn_selecr_Keys.helpTip = "Number";
    T1_Btn_selecr_Keys.size = [120, 30];
    T1_Btn_selecr_Keys_Num.helpTip = "Number to pull out";
    T1_Btn_selecr_Keys_Num.size = [30, 30];  // Adjust the size of EditText

    // Tooltip on hover
    T1_Btn_selecr_Keys.helpTip = "Select keys equally spaced";

    // Function to execute when button is pressed
    T1_Btn_selecr_Keys.onClick = function () { SELECT_KEYS(); }

    //〇Processing Functions===========================================================================
    //■Initialize (Common processing for time remapping)
    function RESET_TIMEREMAP(Layer) {
        Layer.timeRemapEnabled = false;
        Layer.timeRemapEnabled = true;
        Layer.property("ADBE Time Remapping").expression = "";
    }

    //■Error handling (Common processing for time remapping)
    function CHECK_TIMEREMAP_COM(Layer) {
        //■ Check if "null" is selected
        if (Layer.nullLayer == true) {
            Layer.timeRemapEnabled = false;
            eval("throw \"Null layer is selected.\"; ");
        }
        //■ Check if "Light" is selected
        if (Layer instanceof LightLayer) {
            Layer.timeRemapEnabled = false;
            eval("throw \"A light layer is selected.\";");
        }
        //■ Check if "Camera" is selected
        if (Layer instanceof CameraLayer) {
            Layer.timeRemapEnabled = false;
            eval("throw \"The camera layer is selected.\";");
        }
        //■ Check if "Solid" is selected
        if (Layer.source.mainSource instanceof SolidSource) {
            Layer.timeRemapEnabled = false;
            eval("throw \"A planar layer is selected.\";");
        }
    }

    //■Processing when "Stop all frames" button is pressed (T1_Btn_Stop_All)
    function ALL_KEYFRAME_STOP() {
        try {
            for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
                var myLayer = app.project.activeItem.selectedLayers[i];
                //■Error handling
                CHECK_TIMEREMAP_COM(myLayer);

                //■Apply processing
                app.beginUndoGroup("Stop_All");

                RESET_TIMEREMAP(myLayer);
                var myEffects = myLayer.property("ADBE Time Remapping");
                var sFrameTime = myEffects.keyTime(1);
                var eFrameTime = myEffects.keyTime(2);
                var frameLength = eFrameTime - sFrameTime; // Duration (in seconds)
                var frameLate = 1 / app.project.activeItem.frameRate;
                for (var j = 0; j < frameLength; j += frameLate) {
                    var newKey = myEffects.addKey(j + sFrameTime);
                }
                for (var k = 1; k < myEffects.numKeys; k++) {
                    myEffects.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD); // HOLD: Stop, LINEAR: Linear, BEZIER: Bezier;
                }
                myEffects.removeKey(myEffects.numKeys);

                app.endUndoGroup();
            }
        }
        catch (err_message) {
            alert(err_message, "error");
        }
    }

    //■Processing when "Select keyframes" button is pressed (T1_Btn_IR)
    function SELECT_KEYS() {
        try {
            ALL_KEYFRAME_STOP();
            for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
                var myLayer = app.project.activeItem.selectedLayers[i];

                //■Apply processing
                var myEffects = myLayer.property("ADBE Time Remapping");
                var targetKey = Number(T1_Btn_selecr_Keys_Num.text);
                var keyCount = myEffects.numKeys;
                for (var k = 1, index = 1; k <= keyCount; k++) {
                    if (k % (targetKey + 1) !== 0) {
                        myEffects.removeKey(index + 1);
                    }
                    else { index++; }
                }
            }
        } catch (err_massage) { alert(err_message, "error") }
    }

// Add an offset button next to the skip frame button
// ★Offset group starts here (place below with a line break)
var T1_Btn_offset_Group = stopKeysGroup.add("group");
T1_Btn_offset_Group.orientation = "row";
T1_Btn_offset_Group.alignment = "center";

var T1_Btn_offset = T1_Btn_offset_Group.add("button", undefined, "offset");
T1_Btn_offset.size = [80, 30];
var T1_Btn_offset_Num = T1_Btn_offset_Group.add("edittext", undefined, "0");
T1_Btn_offset_Num.size = [30, 30];
T1_Btn_offset.helpTip = "Shift the value of the selection key by the specified number of frames";

// Click event handling
T1_Btn_offset.onClick = function () {
    app.beginUndoGroup("Offset Time Remap Values");

    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        app.endUndoGroup(); return;
    }

    var fr = comp.frameRate;
    var frames = parseFloat(T1_Btn_offset_Num.text);
    if (isNaN(frames)) {
        alert("Please enter a number.");
        app.endUndoGroup(); return;
    }
    var delta = frames / fr; // converted to seconds

    var layers = comp.selectedLayers;
    for (var i = 0; i < layers.length; i++) {
        var lyr = layers[i];
        if (!lyr.timeRemapEnabled) continue;

        var prop = lyr.property("ADBE Time Remapping");
        for (var k = 1; k <= prop.numKeys; k++) {
            if (prop.keySelected(k)) {
                var v = prop.keyValue(k);
                prop.setValueAtKey(k, v + delta); // Shift only the values
            }
        }
    }

    app.endUndoGroup();
};

    var stopKeysLabel = stopKeysGroup.add("statictext", undefined, "--------- For Time Remapping ---------");
    var w = new Window("palette", "LOOP Settings");

    //--------------------------------------------------
    // 1. ■------- (Freeze the first frame for 1 frame)
    //--------------------------------------------------

    // Adjust group size
    var btnFreezeFirst_Group = stopKeysGroup.add("group");
    btnFreezeFirst_Group.orientation = "row";
    btnFreezeFirst_Group.alignment = "center";  // Center the whole group

    var btnFreezeFirst = btnFreezeFirst_Group.add("button", undefined, "■-------");
    btnFreezeFirst.helpTip = "LOOP playback on the first frame";
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

            // Remove existing keys
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            for (var k = remap.numKeys; k >= 1; k--) {
                remap.removeKey(k);
            }

            // Time remapping ON → Automatically create 2 keys at In/Out
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");

            if (remap.numKeys < 2) continue;

            // Remove the second key
            remap.removeKey(2);

            remap.expression = "";
            remap.expressionEnabled = false;
        }
        app.endUndoGroup();
    };

    //--------------------------------------------------
    // 2. -------■ (Freeze the last frame for 1 frame and remove the 50th frame)
    //--------------------------------------------------
    // Adjust group size
    var btnFreezeLast_Group = stopKeysGroup.add("group");
    btnFreezeLast_Group.orientation = "row";
    btnFreezeLast_Group.alignment = "center";  // Center the whole group

    var btnFreezeLast = btnFreezeLast_Group.add("button", undefined, "-------■");
    btnFreezeLast.helpTip = "LOOP playback on the last frame after playback";
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

            // Remove existing keys
            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            for (var k = remap.numKeys; k >= 1; k--) {
                remap.removeKey(k);
            }

            layer.timeRemapEnabled = true;
            var remap = layer.property("ADBE Time Remapping");
            if (remap.numKeys < 2) continue;

            // End point key (second one)
            var endKeyTime = remap.keyTime(2);  // For example, 50th frame
            var endKeyVal = remap.keyValue(2);

            // Remove the 50th frame key and add a new key at 49th frame
            remap.removeKey(2);

            var newKeyTime = endKeyTime - (1 / comp.frameRate);  // 49th frame
            var kIdx = remap.addKey(newKeyTime);
            // If you want to reference the value at 49th frame, use the following:
            // var val49 = remap.valueAtTime(newKeyTime, false);
            // remap.setValueAtKey(kIdx, val49);
            // But for this case, we use endKeyVal (50th frame value) as is
            remap.setValueAtKey(kIdx, endKeyVal - 1 / 30);

            // Keep the layer's out point at 50th frame.
            // From 49th frame to 50th frame, the 49th frame will be held.
            remap.expression = "";
            remap.expressionEnabled = false;
        }
        app.endUndoGroup();
    };

    //--------------------------------------------------
    // 3. ◆-----◆ (Loop playback)
    //--------------------------------------------------
    // Adjust group size
    var btnLoop_Group = stopKeysGroup.add("group");
    btnLoop_Group.orientation = "row";
    btnLoop_Group.alignment = "center";  // Center the whole group

    var btnLoop = btnLoop_Group.add("button", undefined, "◆-----◆");
    btnLoop.helpTip = "Loop playback for the whole animation";
    btnLoop.size = [80, 30];
    btnLoop.onClick = function () {
        app.beginUndoGroup("LoopOut Settings");
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

            // Remove existing keys
            ly.timeRemapEnabled = true;
            var remap = ly.property("ADBE Time Remapping");
            for (var k = remap.numKeys; k >= 1; k--) {
                remap.removeKey(k);
            }

            ly.timeRemapEnabled = true;
            var remap = ly.property("ADBE Time Remapping");

            // Remove extra keys if there are more than 2
            while (remap.numKeys > 2) {
                remap.removeKey(3);
            }
            remap.expression =
                'loopOut("cycle");\n' +
                'if(time==key(numKeys).time){key(1)}else{loopOut("cycle");};';
            remap.expressionEnabled = true;
        }
        app.endUndoGroup();
    };

    //--------------------------------------------------
    // 4. ◆--L-◆◆ (Loop based on markers)
    //--------------------------------------------------
    // Adjust group size
    var btnLoopMarkers_Group = stopKeysGroup.add("group");
    btnLoopMarkers_Group.orientation = "row";
    btnLoopMarkers_Group.alignment = "center";  // Center the whole grou

    var btnLoopMarkers = btnLoopMarkers_Group.add("button", undefined, "◆--L-◆◆");
    btnLoopMarkers.helpTip = "LOOP marker use";
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
            alert("I can't find any markers with the name “LOOP”.");
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

        remap.addKey(ly.inPoint); // starting point
        remap.addKey(ly.inPoint + loopMarkerTime); // LOOP point
        var lastTime = ly.inPoint + ly.source.duration - 1 / comp.frameRate;
	remap.addKey(lastTime); // 1F before the last point
	remap.setValueAtKey(4, remap.valueAtTime(ly.inPoint + loopMarkerTime, false));// LOOPre point

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

    // ★★★★★Reverse the order of the selected layers★★★★★

    var reverseGroup = panel.add("group", undefined);
    reverseGroup.orientation = "column";
    reverseGroup.alignment = ["fill", "top"];

    var reverseLabel = reverseGroup.add("statictext", undefined, "---------Reverse Selected Layers---------");
    reverseLabel.helpTip = "Reverse the order of selected layers";

    var reverseButton = reverseGroup.add("button", undefined, "Reverse Layers");
    reverseButton.helpTip = "Reverses the order of selected layers";
    reverseButton.onClick = function () {
        reverseLayers();
        reverseButton.active = false; // Deactivate the button
    };

    function reverseLayers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Select the active composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length < 2) {
            alert("Select at least two layers.");
            return;
        }

        app.beginUndoGroup("Reverse Selected Layers");

        // Record the original indices of the layers
        var layerIndices = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            layerIndices.push(selectedLayers[i].index);
        }

        // Move the layers in reverse order
        for (var i = 0; i < selectedLayers.length; i++) {
            var targetIndex = layerIndices[selectedLayers.length - 1 - i];
            selectedLayers[i].moveBefore(comp.layer(targetIndex));
        }

        app.endUndoGroup();
    }

    // ★★★★★Convert comments to text and clear the layer names★★★★★

    var assignCommentGroup = panel.add("group", undefined);
    assignCommentGroup.orientation = "column";
    assignCommentGroup.alignment = ["fill", "top"];

    var assignCommentLabel = assignCommentGroup.add("statictext", undefined, "--------Assign Comments to Text--------");
    assignCommentLabel.helpTip = "Converts layer comments to text";

    var assignCommentButton = assignCommentGroup.add("button", undefined, "Convert Comments to Text");
    assignCommentButton.helpTip = "Convert comments on selected layers to text";
    assignCommentButton.onClick = function () {
        convertCommentsToTextAndClearNames();
        assignCommentButton.active = false; // Deactivate the button
    };

    // ★★★★★Adjust the layer duration based on the length of the text★★★★★

    var adjustTimeGroup = panel.add("group", undefined);
    adjustTimeGroup.orientation = "row";  // Arrange horizontally
    adjustTimeGroup.alignment = "center";  // Center the entire group

    var adjustTimeLabel = assignCommentGroup.add("statictext", undefined, "------------Adjust Duration------------");
    adjustTimeLabel.helpTip = "Layer times based on number of characters";

    var adjustTimeButton = adjustTimeGroup.add("button", undefined, "Adjust Duration");
    adjustTimeButton.helpTip = "Adjusts the time of the layer with one character as the specified n frames.";
    adjustTimeButton.size = [120, 30];  // Set button size

    var frameInput = adjustTimeGroup.add("edittext", undefined, "5");
    frameInput.helpTip = "Enter the number of frames per character";
    frameInput.size = [30, 30];  // Set the size of the text box

    adjustTimeButton.onClick = function () {
        var frameDuration = parseInt(frameInput.text, 10);
        if (!isNaN(frameDuration) && frameDuration > 0) {
            adjustLayerDuration(frameDuration);
        } else {
            alert("Please enter a valid number.");
        }
        adjustTimeButton.active = false; // Deactivate the button
    };

    // ★★★★★Adjust the comp duration based on the length of the layers★★★★★

    var adjustCompDurationGroup = panel.add("group", undefined);
    adjustCompDurationGroup.orientation = "column";
    adjustCompDurationGroup.alignment = ["fill", "top"];

    var adjustCompDurationLabel = adjustCompDurationGroup.add("statictext", undefined, "----Component time adjustment----");
    adjustCompDurationLabel.helpTip = "Adjusts the duration of the composition based on the length of the layer";

    var adjustCompDurationButton = adjustCompDurationGroup.add("button", undefined, "Component time adjustment");
    adjustCompDurationButton.helpTip = "Composition durations based on layer length";
    //adjustCompDurationButton.size = [120, 30]; // Set button size

    adjustCompDurationButton.onClick = function () {
        adjustCompDuration();
        adjustCompDurationButton.active = false; // Deactivate the button
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
            alert("Please select a composition.");
        }
    }

    // ★★★★★Move inside the work area★★★★★

    var moveToWorkAreaGroup = panel.add("group", undefined);
    moveToWorkAreaGroup.orientation = "column";
    moveToWorkAreaGroup.alignment = ["fill", "top"];
    moveToWorkAreaGroup.spacing = 10;
    moveToWorkAreaGroup.margins = [0, 10, 0, 0]; // Add top margin

    var moveToWorkAreaLabel = moveToWorkAreaGroup.add("statictext", undefined, "---------Move to work area---------");
    moveToWorkAreaLabel.helpTip = "Moves the selected layer to the start time of the work area";

    var moveToWorkAreaButton = moveToWorkAreaGroup.add("button", undefined, "Move");
    moveToWorkAreaButton.helpTip = "Moves the selected layer to the start time of the work area";
    moveToWorkAreaButton.size = [120, 30]; // Specify button size

    moveToWorkAreaButton.onClick = function () {
        moveLayersToWorkArea();
    };

    function moveLayersToWorkArea() {
        var comp = app.project.activeItem;

        if (comp && comp instanceof CompItem) {
            app.beginUndoGroup("Move Layers to Work Area");
            var workAreaStart = comp.workAreaStart;
            var layers = comp.selectedLayers;

            if (layers.length === 0) {
                alert("Select the layer to be moved.");
                app.endUndoGroup();
                return;
            }

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                layer.startTime = workAreaStart;
            }

            app.endUndoGroup();
            //alert("The selected layer has been moved to the start time of the work area.");
        } else {
            alert("Select a composition.");
        }
    }

    // ★★★★★ Add/Update size information to the names of selected items ★★★★★

    var sizeUpdateGroup = panel.add("group", undefined);
    sizeUpdateGroup.orientation = "column";
    sizeUpdateGroup.alignment = ["fill", "top"];

    var sizeUpdateLabel = sizeUpdateGroup.add("statictext", undefined, "--Add/Update _Size to the end of the name--");
    sizeUpdateLabel.helpTip = "Add or update size information to the names of selected items";

    var sizeUpdateButton = sizeUpdateGroup.add("button", undefined, "Add/Update Size");
    sizeUpdateButton.helpTip = "Add or update size information to the names of the selected items";

    sizeUpdateButton.onClick = function () {
        addOrUpdateSizeInSelectedItems();
    };

    function addOrUpdateSizeInSelectedItems() {
        app.beginUndoGroup("Rename Selected Items with Size");

        var selectedItems = app.project.selection;
        var activeComp = app.project.activeItem;

        // Show an alert if no items are selected in both the Project panel and the Timeline panel
        if (selectedItems.length === 0 && !(activeComp instanceof CompItem && activeComp.selectedLayers.length > 0)) {
            alert("Please select items in either the Project panel or the Timeline panel.");
            return;
        }

        // Size pattern (e.g., _1366x768, _1366＊768, _1366*768, _1366X768)
        var sizePattern = /(_\d+[xX＊*]\d+)$/;

        // Update size information for selected items in the Project panel
        for (var i = 0; i < selectedItems.length; i++) {
            var item = selectedItems[i];

            // Process only if the item is a Footage or Comp item
            if (item instanceof FootageItem || item instanceof CompItem) {
                var itemWidth = item.width;
                var itemHeight = item.height;
                var sizeString = "_" + itemWidth + "*" + itemHeight;

                // If the name already contains size information, remove it and add the new size information
                var newName = item.name.replace(sizePattern, "");  // Remove existing size information
                newName += sizeString;  // Add new size information
                item.name = newName;
            }
        }

        // Update size information for the source items of the selected layers in the Timeline panel
        if (activeComp instanceof CompItem) {
            var selectedLayers = activeComp.selectedLayers;
            for (var j = 0; j < selectedLayers.length; j++) {
                var layer = selectedLayers[j];
                var source = layer.source;

                if (source instanceof FootageItem || source instanceof CompItem) {
                    var sourceWidth = source.width;
                    var sourceHeight = source.height;
                    var sizeString = "_" + sourceWidth + "*" + sourceHeight;

                    // If the name already contains size information, remove it and add the new size information
                    var newName = source.name.replace(sizePattern, "");  // Remove existing size information
                    newName += sizeString;  // Add new size information
                    source.name = newName;
                }
            }
        }
        app.endUndoGroup();
    }

    // ★★★★★End Here★★★★★

    // Insert a line separator
    var separator6 = panel.add("statictext", undefined, "----------------------------------------------");
}

function reverseLayers() {
    var comp = app.project.activeItem;
    if (comp != null && comp instanceof CompItem) {
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length > 1) {
            app.beginUndoGroup("Reverse Layers");

            // Arrange the selected layers in reverse order
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layer.moveToBeginning();
            }

            app.endUndoGroup();
        } else {
            alert("Select multiple layers.");
        }
    } else {
        alert("Composition is not selected.");
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
                    // Clear the layer name
                    layer.name = "";
                }
            }

            app.endUndoGroup();
        } else {
            alert("Select the text layer.");
        }
    } else {
        alert("Composition is not selected.");
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

                    // Adjust the layer's end time
                    layer.outPoint = layer.inPoint + durationInSeconds;
                }
            }

            app.endUndoGroup();
        } else {
            alert("Select the text layer.");
        }
    } else {
        alert("Composition is not selected.");
    }
}

function SELECT_KEYS() {
    try {
        ALL_KEYFRAME_STOP();
        for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
            var myLayer = app.project.activeItem.selectedLayers[i];
            var myEffects = myLayer.property("ADBE Time Remapping");
            var targetKey = Number(T1_Btn_selecr_Keys_Num.text);
            var keyCount = myEffects.numKeys;

            for (var k = keyCount; k > 1; k--) {
                if (k % (targetKey + 1) !== 0) {
                    myEffects.removeKey(k);
                }
            }
        }
    } catch (err_message) {
        alert(err_message, "error");
    }
}

function ALL_KEYFRAME_STOP() {
    try {
        for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
            var myLayer = app.project.activeItem.selectedLayers[i];
            CHECK_TIMEREMAP_COM(myLayer);
            app.beginUndoGroup("Stop_All");
            RESET_TIMEREMAP(myLayer);
            var myEffects = myLayer.property("ADBE Time Remapping");
            var sFrameTime = myEffects.keyTime(1);
            var eFrameTime = myEffects.keyTime(2);
            var frameLength = eFrameTime - sFrameTime;
            var frameLate = 1 / app.project.activeItem.frameRate;
            for (var j = 0; j < frameLength; j += frameLate) {
                var newKey = myEffects.addKey(j + sFrameTime);
            }
            for (var k = myEffects.numKeys; k > 1; k--) {
                myEffects.setInterpolationTypeAtKey(k, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
            }
            myEffects.removeKey(myEffects.numKeys);
            app.endUndoGroup();
        }
    } catch (err_message) {
        alert(err_message, "error");
    }
}


// ◆◆TOOLTAB2◆◆

function buildCombined2UI(panel) {

    // ★★★★★Clear the names of the selected layers★★★★★

    var clearNamesGroup = panel.add("group", undefined);
    clearNamesGroup.orientation = "column";
    clearNamesGroup.alignment = ["fill", "top"];

    // explanatory label
    var clearNamesLabel = clearNamesGroup.add("statictext", undefined, "-----------Clear Layer Names-----------");
    clearNamesLabel.helpTip = "Clears the name of the selected layer";

    // Add checkbox
    var convertToEnglishCheckBox = clearNamesGroup.add("checkbox", undefined, "Camera, Light, Shape, Null, is English");
    convertToEnglishCheckBox.value = false; // Uncheck by default

    // initialize button
    var clearButton = clearNamesGroup.add("button", undefined, "Clear Layer Names");
    clearButton.helpTip = "Clear name. Camera, lights, shapes convert to English.";
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
                    // Converted to English if check box is on
                    if (layer instanceof CameraLayer) {
                        camCount++;
                        layer.name = "Cam" + (camCount < 10 ? "0" : "") + camCount;
                    } else if (layer instanceof LightLayer) {
                        litCount++;
                        layer.name = "Lit" + (litCount < 10 ? "0" : "") + litCount;
                    } else if (layer.matchName === "ADBE Vector Layer") { // shape player
                        shapeCount++;
                        layer.name = "Shape" + (shapeCount < 10 ? "0" : "") + shapeCount;
                    } else if (layer.nullLayer) { // For Null Layer
                        nullCount++;
                        layer.name = "Null" + (nullCount < 10 ? "0" : "") + nullCount;
                    } else {
                        layer.name = ""; // Other layers should have empty names
                    }
                } else {
                    // If the checkbox is unchecked, only null and normal layers are initialized
                    if (layer.nullLayer || !(layer instanceof CameraLayer || layer instanceof LightLayer || layer.matchName === "ADBE Vector Layer")) {
                        layer.name = ""; // Initialize name to empty
                    }
                }
            }

            app.endUndoGroup();
        } else {
            alert("Please select a composition");
        }
        clearButton.active = false; // Deactivates the active state of the button
    };

// ★★★★★ Add or Update Size Info to Selected Item Names ★★★★★
var sizeUpdateGroup = panel.add("group", undefined);
sizeUpdateGroup.orientation = "column";
sizeUpdateGroup.alignment = ["fill", "top"];

var sizeUpdateLabel = sizeUpdateGroup.add("statictext", undefined, "--Add/Update _Size at the End of Name--");
sizeUpdateLabel.helpTip = "Add or update size information to the names of selected items.";

var sizeUpdateButton = sizeUpdateGroup.add("button", undefined, "Add/Update Size");
sizeUpdateButton.helpTip = "Add or update size information to the names of selected items.";

sizeUpdateButton.onClick = function () {
    addOrUpdateSizeInSelectedItems();
};

function addOrUpdateSizeInSelectedItems() {
    app.beginUndoGroup("Rename Selected Items with Size");

    var selectedItems = app.project.selection;
    var activeComp = app.project.activeItem;

    if (selectedItems.length === 0 && !(activeComp instanceof CompItem && activeComp.selectedLayers.length > 0)) {
        alert("Please select items in the Project panel or Timeline panel.");
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

// ★★★★★ Center the Composition View ★★★★★
var centerGroup = panel.add("group", undefined);
centerGroup.orientation = "column";
centerGroup.alignment = ["fill", "top"];

var centerLabel = centerGroup.add("statictext", undefined, "--Center the Composition View--");
centerLabel.helpTip = "Center the composition view in the workspace.";

var centerButton = centerGroup.add("button", undefined, "Center View");
centerButton.helpTip = "Redraw the active composition centered in the viewer.";

centerButton.onClick = function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please activate a composition.");
        return;
    }

    app.beginUndoGroup("Center View");
    try {
        // AE has no direct API for centering the comp view.
        // Force a redraw by changing the comp size by 1 pixel and reverting it.
        var w = comp.width, h = comp.height;
        comp.width = w + 1;
        comp.height = h + 1;
        comp.width = w;
        comp.height = h;
    } catch (e) {
        alert("Failed to center the view:\n" + e.toString());
    }
    app.endUndoGroup();
};

// Insert line break
panel.add("statictext", undefined, "----------------------------------------------");
}


    // ◆◆RemoveDTAB◆◆

function buildRemoveUI(panel) {
    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];

    var separatorText = panel.add("statictext", undefined, "Duplicates will be removed");
    separatorText.alignment = "center"; // Center alignment

 var folderGroup = panel.add("group");
 folderGroup.add("statictext", undefined, "select folder:");
 var folderPath = folderGroup.add("edittext", undefined, "");
 folderPath.characters = 20;
 folderPath.helpTip = "Specify a folder to search for duplicate items";

 var resultText = panel.add("statictext", undefined, "Duplication: 0");
 resultText.helpTip = "Displays the number of duplicate items found in the search";

 var checkBoxGroup = panel.add("panel", undefined, "double condition");
 checkBoxGroup.orientation = "column";
 checkBoxGroup.alignChildren = ["left", "top"];

 var includeSubfoldersCheckBox = checkBoxGroup.add("checkbox", undefined, "Include subfolders");
 includeSubfoldersCheckBox.helpTip = "Subfolders within the selected folder are also included in the search";
 includeSubfoldersCheckBox.value = true;

 var nameCheckBox = checkBoxGroup.add("checkbox", undefined, "Check by name");
 nameCheckBox.helpTip = "Checks for duplicates based on item name";
 nameCheckBox.value = false;

 var ignoreNumbersCheckBox = checkBoxGroup.add("checkbox", undefined, "Check by name (ignore numbers)");
 ignoreNumbersCheckBox.helpTip = "Ignore the numbers among the names to check for duplicates";
 ignoreNumbersCheckBox.value = true;

 var sizeCheckBox = checkBoxGroup.add("checkbox", undefined, "Check by size");
 sizeCheckBox.helpTip = "Check for duplicates by item size (width and height)";
 sizeCheckBox.value = true;

 var includeCompsCheckBox = checkBoxGroup.add("checkbox", undefined, "include compo");
 includeCompsCheckBox.helpTip = "Include composition items in the search criteria";
 includeCompsCheckBox.value = false;

 var checkButton = panel.add("button", undefined, "Start searching in the folder");
 checkButton.helpTip = "Searches for duplicate items based on specified criteria";

 var executeButton = panel.add("button", undefined, "Deleted after summarizing the same");
 executeButton.helpTip = "Consolidate or delete duplicate items found in the search";

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
                        nameKey = ignoreNumbersCheckBox.value ? item.name.replace(/\d+/g, "") : item.name;
                    }

                    var sizeKey = sizeCheckBox.value && item.hasOwnProperty("width") && item.hasOwnProperty("height")
                        ? item.width + "x" + item.height : "";

                    var combinedKey = nameKey + (nameKey && sizeKey ? "_" : "") + sizeKey + (typeKey ? "_" + typeKey : "");

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
        resultText.text = "Duplication: " + duplicatesCount;
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
        alert("Duplicate items have been sorted out.");
        resultText.text = "Duplication: 0";
    }

    checkButton.onClick = function () {
        if (app.project.selection.length > 0 && app.project.selection[0] instanceof FolderItem) {
            selectedFolder = app.project.selection[0];
            folderPath.text = selectedFolder.name;
            checkDuplicates(selectedFolder);
        } else {
            alert("Select a folder in the project panel.");
        }
    };

    executeButton.onClick = function () {
        if (selectedFolder) {
            executeConsolidation();
        } else {
            alert("First check for duplicates by clicking on the “Check” button.");
        }
    };

    // Insert a line separator
    // var separator6 = panel.add("statictext", undefined, "----------------------------------------------------------------");

}

    // ◆◆ShakeTAB◆◆
    // ★★★★★Shake★★★★★
function buildShakeUI(panel) {
        // Build the UI for shake
        panel.alignChildren = "fill";

        var directionPanel = panel.add("panel", undefined, "Shake Direction");
        directionPanel.alignChildren = "left";
        var xCheckbox = directionPanel.add("checkbox", undefined, "Shake in X direction");
        var yCheckbox = directionPanel.add("checkbox", undefined, "Shake in Y direction");

        // Add helpTip
        xCheckbox.helpTip = "If either X or Y is checked, the shake will be applied along that axis.";
        yCheckbox.helpTip = "If both X and Y are checked, the shake will be applied randomly in all directions.";

        // Set checkboxes to be on by default
        xCheckbox.value = true;
        yCheckbox.value = true;

        // Create a group for the magnitude input field, laid out horizontally
        var magnitudeGroup = panel.add("group");
        magnitudeGroup.add("statictext", undefined, "Magnitude:");
        var magnitudeInput = magnitudeGroup.add("edittext", undefined, "30"); // Set default magnitude to 30
        magnitudeInput.characters = 5;
        magnitudeInput.helpTip = "Set the maximum shake amplitude in pixels.";

        // Create a group for the duration input field, laid out horizontally
        var durationGroup = panel.add("group");
        durationGroup.add("statictext", undefined, "Duration (frames):");
        var durationInput = durationGroup.add("edittext", undefined, "20"); // Default is 20 frames
        durationInput.characters = 5;
        durationInput.helpTip = "Set the duration of the shake in frames.";

        var execButton = panel.add("button", undefined, "Apply Shake");
        execButton.helpTip = "Apply the shake effect to the selected layers based on the specified settings.";

        // Function to be executed when the apply button is pressed
        execButton.onClick = function () {
            var magnitude = parseFloat(magnitudeInput.text);
            var duration = parseInt(durationInput.text);
            var isXChecked = xCheckbox.value;
            var isYChecked = yCheckbox.value;

            if (!isXChecked && !isYChecked) {
                alert("Please select either X or Y direction.");
                return;
            }

            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select a layer to apply the shake.");
                return;
            }

            app.beginUndoGroup("Apply Shake");

            // Apply shake to each selected layer
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var initialPos = layer.transform.position.value;  // The initial position (at frame 0)

                // Set the initial position at frame 0
                layer.transform.position.setValueAtTime(comp.time, initialPos);

                // Start the shake at frame 1
                for (var f = 1; f <= duration; f++) {
                    // Calculate A, which decays over time
                    var progress = f / duration;
                    var decay = Math.exp(-progress * 5);  // The shake gradually subsides
                    var A = magnitude * decay;  // A decreases over time

                    var xOffset = 0;
                    var yOffset = 0;

                    // If both X and Y are checked, distribute A randomly
                    if (isXChecked && isYChecked) {
                        var angle = Math.random() * Math.PI * 2;  // Random angle between 0 and 2π
                        xOffset = A * Math.cos(angle);  // X component in a random direction
                        yOffset = A * Math.sin(angle);  // Y component in a random direction
                    } else {
                        // Shake in only one direction
                        if (isXChecked) {
                            xOffset = (f % 2 === 0 ? 1 : -1) * A;  // Shake in X direction
                        }
                        if (isYChecked) {
                            yOffset = (f % 2 === 0 ? 1 : -1) * A;  // Shake in Y direction
                        }
                    }

                    var newPos = [
                        initialPos[0] + xOffset,
                        initialPos[1] + yOffset
                    ];

                    // Set keyframe
                    layer.transform.position.setValueAtTime(comp.time + f / comp.frameRate, newPos);
                }

                // Return to the original position at the last frame
                layer.transform.position.setValueAtTime(comp.time + duration / comp.frameRate, initialPos);
            }

            app.endUndoGroup();
        };

        // ★★★★★Delete★★★★★

        // Section for delete functionality
        var deletePanel = panel.add("panel", undefined, "Delete Items");
        deletePanel.alignChildren = "left";
        var transformCheckbox = deletePanel.add("checkbox", undefined, "Delete Transform");
        var expressionCheckbox = deletePanel.add("checkbox", undefined, "Delete Expressions");
        var effectsCheckbox = deletePanel.add("checkbox", undefined, "Delete Effects");
        var maskCheckbox = deletePanel.add("checkbox", undefined, "Delete Masks");
        var timeRemapCheckbox = deletePanel.add("checkbox", undefined, "Delete Time Remap"); // Add a checkbox for time remap deletion

        // Add helpTip
        transformCheckbox.helpTip = "Delete the transform properties (position, rotation, etc.) of the selected layers.";
        expressionCheckbox.helpTip = "Delete the expressions on the selected layers.";
        effectsCheckbox.helpTip = "Delete the effects applied to the selected layers.";
        maskCheckbox.helpTip = "Delete the masks applied to the selected layers.";
        timeRemapCheckbox.helpTip = "Delete the time remap applied to the selected layers.";

        // Set default values for the checkboxes
        transformCheckbox.value = true;    // Check "Delete Transform" by default
        expressionCheckbox.value = true;   // Check "Delete Expressions" by default
        effectsCheckbox.value = true;      // Check "Delete Effects" by default
        maskCheckbox.value = true;         // Check "Delete Masks" by default
        timeRemapCheckbox.value = true;    // Check "Delete Time Remap" by default

        // Add a delete button
        var deleteButton = panel.add("button", undefined, "Delete");
        deleteButton.helpTip = "Delete the selected items based on the checked options.";

        // Function to be executed when the delete button is pressed
        deleteButton.onClick = function () {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select a layer to delete.");
                return;
            }

            app.beginUndoGroup("Delete");

            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // Delete Transform
                if (transformCheckbox.value) {
                    var properties = ['position', 'rotation', 'scale', 'opacity', 'anchorPoint'];
                    for (var j = 0; j < properties.length; j++) {
                        var prop = layer.transform[properties[j]];

                        // Delete keyframes
                        if (prop && prop.numKeys > 0) {
                            for (var k = prop.numKeys; k > 0; k--) {
                                prop.removeKey(k);
                            }
                        }
                    }
                }

                // Delete Expressions
                if (expressionCheckbox.value) {
                    var propsWithExpressions = ['position', 'rotation', 'scale', 'opacity', 'anchorPoint'];
                    for (var j = 0; j < propsWithExpressions.length; j++) {
                        var prop = layer.transform[propsWithExpressions[j]];
                        if (prop && prop.expression !== "") {
                            prop.expression = "";  // Delete the expression
                        }
                    }
                }

                // Delete Effects
                if (effectsCheckbox.value) {
                    var effectsGroup = layer.property("ADBE Effect Parade");
                    if (effectsGroup && effectsGroup.numProperties > 0) {
                        while (effectsGroup.numProperties > 0) {
                            effectsGroup.property(1).remove();
                        }
                    }
                }

                // Delete Masks
                if (maskCheckbox.value) {
                    var maskGroup = layer.property("ADBE Mask Parade");
                    if (maskGroup && maskGroup.numProperties > 0) {
                        while (maskGroup.numProperties > 0) {
                            maskGroup.property(1).remove();
                        }
                    }
                }

                // Delete Time Remap
                if (timeRemapCheckbox.value) {
                    var timeRemapProp = layer.property("ADBE Time Remapping");
                    if (timeRemapProp && timeRemapProp.numKeys > 0) {
                        for (var k = timeRemapProp.numKeys; k > 0; k--) {
                            timeRemapProp.removeKey(k);
                        }
                        layer.timeRemapEnabled = false; // Disable time remap
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
