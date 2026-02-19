//===========================================================================
// O_Tools V1.5.8d by Digimonkey
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

    tabPanel.preferredSize = [290, 512];   // Initial size (not fixed)
   // tabPanel.minimumSize   = [290, 300];   // at the very least

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

    panel.onResizing = panel.onResize = function () {
        this.layout.resize();
    };

    panel.layout.layout(true);
    return panel;
}

    // ◆◆NameEdTAB◆◆


function buildNameEdUI(panel) {
    // --- Layout Guidelines for This TAB ---
    // The top UI is fixed (top), while only the outputField is stretchable both vertically and horizontally (fill, fill).
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

    // --- Radio (Name/Comment) ---
    var radioGroup = panel.add("group", undefined);
    radioGroup.orientation = "row";
    radioGroup.alignment = ["fill", "top"];

    var nameRadio = radioGroup.add("radiobutton", undefined, "Name");
    var commentRadio = radioGroup.add("radiobutton", undefined, "Comments");

    nameRadio.value = true;
    nameRadio.onClick = function () { mode = "name"; };
    commentRadio.onClick = function () { mode = "comment"; };

    // --- Get/Update button ---
    var buttonGroup = panel.add("group", undefined);
    buttonGroup.orientation = "row";
    buttonGroup.alignment = ["fill", "top"];

    var getButton = buttonGroup.add("button", undefined, "Get");
    getButton.helpTip = "Retrieve the name or comment of the selected item.";

    var updateButton = buttonGroup.add("button", undefined, "Update");
    updateButton.helpTip = "Updates the selected item in the text field data.";

    // --- Replace ---
    var replaceGroup = panel.add("group", undefined);
    replaceGroup.orientation = "row";
    replaceGroup.alignment = ["fill", "top"];

    var oldTextField = replaceGroup.add("edittext", undefined, "");
    var newTextField = replaceGroup.add("edittext", undefined, "");
    var replaceButton = replaceGroup.add("button", undefined, "Replace");
    replaceButton.helpTip = "Replace the specified text with new text.";

    // The replacement field remains fixed width (do not expand here)
    oldTextField.preferredSize = [60, 20];
    newTextField.preferredSize = [60, 20];

    // ★Output Field: Only this section can be resized
    // Setting scrolling:true stabilizes scrolling for long texts.
    var outputField = panel.add("edittext", undefined, "", { multiline: true, scrolling: true });
    outputField.alignment = ["fill", "fill"];        // ★Expanding in all directions
    outputField.minimumSize = [200, 120];           // ★Prevent excessive shrinkage (optional)
    outputField.preferredSize = [200, 300];         // Initial size (close to the original size)

    // --- Replacement Processing ---
    replaceButton.onClick = function () {
        var currentData = outputField.text;
        var replacedData = currentData.replace(new RegExp(oldTextField.text, 'g'), newTextField.text);
        outputField.text = replacedData;
    };

    // --- Acquisition Processing ---
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

    // --- Update Processing ---
    updateButton.onClick = function () {
        updateSelectedItemsData(outputField.text);

        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            updateSelectedLayersData(comp, outputField.text);
        }
    };

    // --- Update layout when this TAB is resized ---
    // (If handled collectively by the parent panel, this can be omitted)
    panel.onResizing = panel.onResize = function () {
        this.layout.resize();
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


// ★Group for evenly spaced placement

var T1_Btn_spacing_Group = stopKeysGroup.add("group");
T1_Btn_spacing_Group.orientation = "row";
T1_Btn_spacing_Group.alignment = "center";

var T1_Btn_spacing = T1_Btn_spacing_Group.add("button", undefined, "Interval");
T1_Btn_spacing.size = [80, 30];
var T1_Btn_spacing_Num = T1_Btn_spacing_Group.add("edittext", undefined, "1");
T1_Btn_spacing_Num.size = [30, 30];
T1_Btn_spacing.helpTip = "0 means full placement, 1 means skip every other frame, 2 means skip every two frames.";

// クリック時の処理
T1_Btn_spacing.onClick = function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var fr = comp.frameRate;
    var inputNum = parseFloat(T1_Btn_spacing_Num.text);
    if (isNaN(inputNum)) {
        alert("Please enter a number.");
        return;
    }

    app.beginUndoGroup("Arrange Keys Spacing");

    var stepTime = (inputNum + 1) / fr; 
    var currentTime = comp.time;
    var layers = comp.selectedLayers;

    for (var i = 0; i < layers.length; i++) {
        var lyr = layers[i];
        // Get all selected “Properties”
        var selectedProps = lyr.selectedProperties;
        
        for (var p = 0; p < selectedProps.length; p++) {
            var prop = selectedProps[p];
            
            // Verify that it is a property and that at least one keyframe is selected.
            if (prop.propertyType === PropertyType.PROPERTY && prop.selectedKeys.length > 0) {
                
                var selectedKeyData = [];
                var indicesToRemove = [];

                // 1. Save all information about the selected keys “while you still can”
                // prop.selectedKeys returns an array of indices for the currently selected keys
                for (var j = 0; j < prop.selectedKeys.length; j++) {
                    var kIdx = prop.selectedKeys[j];
                    selectedKeyData.push({
                        val: prop.keyValue(kIdx),
                        inInterp: prop.keyInInterpolationType(kIdx),
                        outInterp: prop.keyOutInterpolationType(kIdx)
                    });
                    indicesToRemove.push(kIdx);
                }

                // 2. ★Important: Delete the selected key “from the end”
                // If you don't do this, the key will remain in its original position.
                for (var r = indicesToRemove.length - 1; r >= 0; r--) {
                    prop.removeKey(indicesToRemove[r]);
                }

                // 3. Reset from the indicator position
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
// 3. ◆-----◆◆ (Loop Playback)
//--------------------------------------------------
var btnLoop_Group = stopKeysGroup.add("group");
btnLoop_Group.orientation = "row";
btnLoop_Group.alignment = "center";

var btnLoop = btnLoop_Group.add("button", undefined, "◆-----◆◆");
btnLoop.helpTip = "Loop playback (Comp / Image Sequence)";
btnLoop.size = [80, 30];
btnLoop.onClick = function () {
    app.beginUndoGroup("LoopOut Setting");
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
        var endVal = Math.max(dur - of, of); // End -1F (min 1F)
        var span   = endVal;                  // Play range

        // Clear
        ly.timeRemapEnabled = true;
        var remap = ly.property("ADBE Time Remapping");
        for (var k=remap.numKeys;k>=1;k--) remap.removeKey(k);
        ly.timeRemapEnabled = true;
        remap = ly.property("ADBE Time Remapping");

        // 0 → End-1F → 0 (instant return)
        var t1 = ly.startTime;
        var t2 = t1 + span;
        var t3 = t2 + of; // +1F for instant jump

        remap.addKey(t1); remap.setValueAtKey(1, 0);
        remap.addKey(t2); remap.setValueAtKey(2, endVal);
        remap.addKey(t3); remap.setValueAtKey(3, 0);

        // Interpolation: linear for all
        remap.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        remap.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        remap.setInterpolationTypeAtKey(3, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);

        remap.expression = 'loopOut(type = "cycle", numKeyframes = 0);';
        remap.expressionEnabled = true;
    }
    app.endUndoGroup();
};

//--------------------------------------------------
// 4. ◆--L-◆◆ (Loop Playback Using Marker)
//--------------------------------------------------
var btnLoopMarkers_Group = stopKeysGroup.add("group");
btnLoopMarkers_Group.orientation = "row";
btnLoopMarkers_Group.alignment = "center";

var btnLoopMarkers = btnLoopMarkers_Group.add("button", undefined, "◆--L-◆◆");
btnLoopMarkers.helpTip = "Loop using marker";
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
        if (!markerProp || markerProp.numKeys===0){ alert("No marker: "+ly.name); continue; }

        var L = null;
        for (var m=1;m<=markerProp.numKeys;m++){
            var v = markerProp.keyValue(m);
            var c = (v && v.comment) ? String(v.comment).toLowerCase() : "";
            if (c.indexOf("loop")!==-1 || c==="l"){ L = markerProp.keyTime(m); break; }
        }
        if (L===null){ alert("No 'LOOP' marker found: "+ly.name); continue; }

        var of = oneFrameSec(src, comp.frameRate);
        var endVal = Math.max(src.duration - of, of); // End -1F
        var Lval   = Math.max(L, 0);                  // Loop base

        // Section length (match time/value for equal speed)
        var span1 = Math.max(Lval, of);                 // 0 → L
        var span2 = Math.max(endVal - Lval, of);        // L → End-1F

        // Clear
        ly.timeRemapEnabled = true;
        var remap = ly.property("ADBE Time Remapping");
        for (var k=remap.numKeys;k>=1;k--) remap.removeKey(k);
        ly.timeRemapEnabled = true;
        remap = ly.property("ADBE Time Remapping");

        // 0 → L → End-1F → L (instant return)
        var t1 = ly.startTime;
        var t2 = t1 + span1;
        var t3 = t2 + span2;
        var t4 = t3 + of; // +1F for instant jump

        remap.addKey(t1); remap.setValueAtKey(1, 0);
        remap.addKey(t2); remap.setValueAtKey(2, Lval);
        remap.addKey(t3); remap.setValueAtKey(3, endVal);
        remap.addKey(t4); remap.setValueAtKey(4, Lval);

        // Interpolation settings
        remap.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        remap.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        remap.setInterpolationTypeAtKey(3, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
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

// ★★★★★ Reverse the Order of Selected Layers (Within Selection) ★★★★★

    var reverseGroup = panel.add("group", undefined);
    reverseGroup.orientation = "column";
    reverseGroup.alignment = ["fill", "top"];

    var reverseLabel = reverseGroup.add("statictext", undefined, "------- Reverse Layer Order -------");
    reverseLabel.helpTip = "Reverses the order of the selected layers";

    var reverseButton = reverseGroup.add("button", undefined, "Reverse Layers");
    reverseButton.helpTip = "Reverses the order of layers within the selected range";
    reverseButton.size = [150, 30]; // Adjusted for English text

    reverseButton.onClick = function () {
        reverseLayers();
        reverseButton.active = false;
    };

    function reverseLayers() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select an active composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length < 2) {
            alert("Please select at least two layers.");
            return;
        }

        app.beginUndoGroup("Reverse Selected Layers Order");

        // 1. Collect original indices of selected layers and sort them ascending
        var indices = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            indices.push(selectedLayers[i].index);
        }
        indices.sort(function(a, b) { return a - b; });

        // 2. Move selected layers (from top to bottom) to the target indices in reverse order
        // This maintains their relative position even if the selection is non-consecutive
        for (var j = 0; j < selectedLayers.length; j++) {
            var targetIndex = indices[selectedLayers.length - 1 - j];
            selectedLayers[j].moveAfter(comp.layer(targetIndex));
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

// ★★★★★ Adjust Comp Duration Based on Layer Length (Selection Priority) ★★★★★

    var adjustCompDurationGroup = panel.add("group", undefined);
    adjustCompDurationGroup.orientation = "column";
    adjustCompDurationGroup.alignment = ["fill", "top"];

    var adjustCompDurationLabel = adjustCompDurationGroup.add("statictext", undefined, "-- Adjust Comp to Layer Length --");
    adjustCompDurationLabel.helpTip = "Adjust comp duration based on selected layers (or all layers if none selected)";

    var adjustCompDurationButton = adjustCompDurationGroup.add("button", undefined, "Adjust Comp Duration");
    adjustCompDurationButton.helpTip = "Adjusts the composition duration based on the range of the layers";
    adjustCompDurationButton.size = [150, 30]; // Slightly wider for English text

    adjustCompDurationButton.onClick = function () {
        adjustCompDuration();
        adjustCompDurationButton.active = false;
    };

    function adjustCompDuration() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        // 1. Determine target layers (selected layers if any, otherwise all layers)
        var hasSelection = comp.selectedLayers.length > 0;
        var targetLayers = hasSelection ? comp.selectedLayers : comp.layers;
        
        // Exit if no layers exist
        if (targetLayers.length === 0 || comp.numLayers === 0) {
            alert("No layers found.");
            return;
        }

        app.beginUndoGroup("Adjust Comp Duration Based on Layers");

        var minInPoint = comp.duration;
        var maxOutPoint = 0;

        // 2. Calculate the range of target layers
        var loopCount = hasSelection ? targetLayers.length : comp.numLayers;
        for (var i = 1; i <= loopCount; i++) {
            var layer = hasSelection ? targetLayers[i-1] : comp.layer(i);
            if (layer.inPoint < minInPoint) minInPoint = layer.inPoint;
            if (layer.outPoint > maxOutPoint) maxOutPoint = layer.outPoint;
        }

        var newDuration = maxOutPoint - minInPoint;

        if (newDuration > 0) {
            // 3. Offset all layers to start at 0 seconds
            for (var j = 1; j <= comp.numLayers; j++) {
                comp.layer(j).startTime -= minInPoint;
            }

            // 4. Set new composition duration
            comp.duration = newDuration;
            comp.displayStartTime = 0;
        }

        app.endUndoGroup();
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

    // Insert a line separator
    var separator6 = panel.add("statictext", undefined, "----------------------------------------------");
}

    // ★★★★★End Here★★★★★
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


    // ★★★★★Align the plane with the component★★★★★

    // Headline
    panel.add("statictext", undefined, "Composize the plane");

    // UI Block
    var fitGrp = panel.add("panel", undefined, "Method Selection");
    fitGrp.orientation = "column";
    fitGrp.alignChildren = ["left", "top"];

    var fitRb1 = fitGrp.add("radiobutton", undefined, "1: Adjust using the scale");
    var fitRb2 = fitGrp.add("radiobutton", undefined, "2: Combine the sauces");

    // Method 2 Option (Indentation)
    var fitOptGrp = fitGrp.add("group");
    fitOptGrp.margins = [20, 0, 0, 0];
    var fitChkNew = fitOptGrp.add("checkbox", undefined, "New Replace");
    fitChkNew.helpTip =
        "When you check this box, a new plane will be created and used as a replacement without modifying the original plane source.\n" +
        "If unchecked, it changes the size of the original plane (affecting all layers using the same plane).";

    // Initial state
    fitRb1.value = true;
    fitChkNew.value = false;
    fitChkNew.enabled = false;

    // UI control
    fitRb1.onClick = function () { fitChkNew.enabled = false; };
    fitRb2.onClick = function () { fitChkNew.enabled = true; };

    // Execute Button
    var fitBtn = panel.add("button", undefined, "Execute");

    // ---- Processing functions start here ----
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

    // Recursively search for and modify the size of rectangles and ellipses within shapes
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

    // ---- Execution processing ----
    fitBtn.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please activate the composition.");
            return;
        }

        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("Please select a layer.");
            return;
        }

        app.beginUndoGroup("Fit to Comp Smart");

        var compW = comp.width;
        var compH = comp.height;
        var now = comp.time;

        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // Skip anything other than AVLayer (including planes) or ShapeLayer
                if (!(layer instanceof AVLayer) && !(layer instanceof ShapeLayer)) continue;

                // Common: Scale adjustment (Faure)
                var fitScale = function () {
                    var rect = layer.sourceRectAtTime(now, false);
                    if (rect.width === 0 || rect.height === 0) return;

                    var sx = (compW / rect.width) * 100;
                    var sy = (compH / rect.height) * 100;

                    if (layer.threeDLayer) __S(layer).setValue([sx, sy, 100]);
                    else __S(layer).setValue([sx, sy]);

                    __centerLayer(layer, compW, compH, now);
                };

                // Method 1: Align everything to scale
                if (fitRb1.value) {
                    fitScale();
                    continue;
                }

                // Method 2: Change the internal size
                if (fitRb2.value) {
                    // A. Layers & Adjustment Layers
                    if (__isResizableSource(layer)) {

                        // ★ Create new and replace (to avoid sharing)
                        if (fitChkNew.value) {
                            var oldSrc = layer.source;
                            var newColor = [0.5, 0.5, 0.5];
                            var oldName = layer.name;

                            if (oldSrc.mainSource && oldSrc.mainSource.color) {
                                newColor = oldSrc.mainSource.color;
                            }

                            // Temporarily create a new plane to acquire the source
                            var tempLayer = comp.layers.addSolid(newColor, oldName, compW, compH, comp.pixelAspect, comp.duration);
                            var newSrc = tempLayer.source;
                            tempLayer.remove();

                            // Source Replacement
                            layer.replaceSource(newSrc, false);
                        }
                        // ★ Resize existing sources (shared)
                        else {
                            var src = layer.source;
                            src.width = compW;
                            src.height = compH;
                            src.pixelAspect = comp.pixelAspect;
                        }

                        // Reset the scale to 100% and center it.
                        if (layer.threeDLayer) __S(layer).setValue([100, 100, 100]);
                        else __S(layer).setValue([100, 100]);

                        __centerLayer(layer, compW, compH, now);
                    }
                    // B. Shape Layer (Rectangle/Ellipse)
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
                    // C. Other (Images, etc.)
                    else {
                        fitScale();
                    }
                }
            }
        } catch (e) {
            alert("Fit to Comp Smart error:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
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

 var checkButton = panel.add("button", undefined, "Start searching in the folder");
 checkButton.helpTip = "Searches for duplicate items based on specified criteria";

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

        }

      // ★★★★★rounding down★★★★★
// ★★★★★ Floor All Values (Integer) ★★★★★

    var floorPanel = panel.add("panel", undefined, "Organizing the Numbers");
    floorPanel.alignment = ["fill", "top"];
    
    var floorButton = floorPanel.add("button", undefined, "Truncate");
    floorButton.helpTip = "Convert all property values (transforms, effects, etc.) within the selected layer to integers.";
    floorButton.size = [200, 40];

    floorButton.onClick = function() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("Please select a layer.");
            return;
        }

        app.beginUndoGroup("Truncation of decimal points");

        for (var i = 0; i < layers.length; i++) {
            processProperties(layers[i]);
        }

        app.endUndoGroup();
        // alert("Processing is complete.");
    };

    /**
     * A function that recursively traverses all properties and truncates numerical values
     */
    function processProperties(propParent) {
        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);

            if (prop.propertyType === PropertyType.PROPERTY) {
                // Check if it is a writable numeric property
                if (prop.hasMinMax || prop.propertyValueType !== PropertyValueType.NO_VALUE) {
                    try {
                        floorPropertyValue(prop);
                    } catch (e) {
                        // Avoiding errors such as read-only
                    }
                }
            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                processProperties(prop);
            }
        }
    }

    /**
     * Process for truncating property values
     */
    function floorPropertyValue(prop) {
        // Process all keys if keyframes exist
        if (prop.numKeys > 0) {
            for (var k = 1; k <= prop.numKeys; k++) {
                var val = prop.keyValue(k);
                prop.setValueAtKey(k, getFlooredValue(val));
            }
        } else {
            // If the key does not exist, process the current value
            var val = prop.value;
            prop.setValue(getFlooredValue(val));
        }
    }

    /**
     * Auxiliary function for truncating numbers or arrays
     */
    function getFlooredValue(val) {
        if (typeof val === "number") {
            return Math.floor(val);
        } else if (val instanceof Array) {
            var newArray = [];
            for (var i = 0; i < val.length; i++) {
                // If the array contains numeric values, truncate them; otherwise, leave them as is.
                newArray.push(typeof val[i] === "number" ? Math.floor(val[i]) : val[i]);
            }
            return newArray;
        }
        return val;
    }

        // ★★★★★Delete★★★★★

	// Delete Function Section (Simply a button only)
    var deletePanel = panel.add("panel", undefined, "Batch Initialization");
    deletePanel.alignment = ["fill", "top"];
    
    var deleteAllButton = deletePanel.add("button", undefined, "Delete all keys and information");
    deleteAllButton.helpTip = "Completely delete and reset all keyframes, expressions, effects, and masks on the selected layer.";
    deleteAllButton.size = [200, 40];

    deleteAllButton.onClick = function() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("Please select a layer.");
            return;
        }

        app.beginUndoGroup("Complete Layer Initialization");

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            // 1. Remove all effects
            // var effectsGroup = layer.property("ADBE Effect Parade");
            // while (effectsGroup && effectsGroup.numProperties > 0) {
            //    effectsGroup.property(1).remove();
            // }

            // 2. Remove all masks
            //var maskGroup = layer.property("ADBE Mask Parade");
            //while (maskGroup && maskGroup.numProperties > 0) {
            //    maskGroup.property(1).remove();
            //}

            // 3. Disable Time Remap
            if (layer.canEnableTimeRemap && layer.timeRemapEnabled) {
                layer.timeRemapEnabled = false;
            }

            // 4. Delete all property keyframes and expressions (recursively)
            // This means that not only the transform, but also the contents of the shape and the contents of the text are affected.
            removeAllKeysAndExpressions(layer);
        }
    }

    /**
     * Function to delve into property groups and remove all keys and expressions
     */
    function removeAllKeysAndExpressions(propParent) {
        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);
            
            if (prop.propertyType === PropertyType.PROPERTY) {
                // If there are keyframes, delete them.
                if (prop.numKeys > 0) {
                    for (var k = prop.numKeys; k > 0; k--) {
                        prop.removeKey(k);
                    }
                }
                // If there is an expression, delete it.
                if (prop.canSetExpression && prop.expression !== "") {
                    prop.expression = "";
                }
            } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                // For groups (such as the contents of shapes), dive deeper.
                removeAllKeysAndExpressions(prop);
            }
        }
    }


// ★★★★★ErrExpDelete★★★★★

    var errorFixPanel = panel.add("panel", undefined, "Project Management");
    errorFixPanel.alignment = ["fill", "top"];
    errorFixPanel.margins = 15;

    var fixAllErrorsButton = errorFixPanel.add("button", undefined, "Disable Error Expressions");
    fixAllErrorsButton.helpTip = "Scans all compositions in the project and disables any expressions that are causing errors.";
    fixAllErrorsButton.size = [200, 40];

    fixAllErrorsButton.onClick = function() {
        var proj = app.project;
        if (proj.numItems === 0) { 
            alert("The project is empty."); 
            return; 
        }
        
        if (!confirm("This will scan ALL compositions in the project and disable expressions with errors. Are you sure?")) {
            return;
        }

        app.beginUndoGroup("Disable All Error Expressions");
        var compCount = 0; 
        var errorCount = 0;

        function disableErrorExpressions(container) {
            for (var i = 1; i <= container.numProperties; i++) {
                var prop = container.property(i);
                if (prop.propertyType === PropertyType.PROPERTY) {
                    if (prop.canSetExpression && prop.expressionEnabled && prop.expression !== "" && prop.expressionError !== "") {
                        prop.expressionEnabled = false;
                        errorCount++;
                    }
                } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                    disableErrorExpressions(prop);
                }
            }
        }

        for (var i = 1; i <= proj.numItems; i++) {
            var item = proj.item(i);
            if (item instanceof CompItem) {
                compCount++;
                for (var j = 1; j <= item.numLayers; j++) { 
                    disableErrorExpressions(item.layer(j)); 
                }
            }
        }
        
        app.endUndoGroup();
        alert("Scan Complete!\nCompositions scanned: " + compCount + "\nErrors disabled: " + errorCount);
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
