/* 
    Universal Key Generator v1.0.0
    - Select a property on a layer
    - Keys will be applied to all selected properties
    - Works on any numeric property
*/

(function () {
    app.beginUndoGroup("Universal Key Generator");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please open a composition.");
        return;
    }

    // Silent alert (modal) replacement
    function silentAlert(msg) {
        var dlg = new Window("dialog", "Notice");
        dlg.add("statictext", undefined, msg);
        dlg.add("button", undefined, "OK", {name:"ok"});
        dlg.show();
    }
    alert = silentAlert;

    // ========= UI =========
    var win = new Window("palette", "BirthRate Key Generator", undefined);
    win.orientation = "column";

    // ★ Info + Reference values
    var infoGroup = win.add("group");
    infoGroup.orientation = "column";
    infoGroup.add("statictext", undefined, "Select BirthRate and run.");
    infoGroup.add("statictext", undefined, "Minimum particle unit");
    infoGroup.add("statictext", undefined, "Line: 0.0039   Other: 0.0313");

    var g1 = win.add("group");
    g1.add("statictext", undefined, "Particle Strength (BirthRate):");
    var valInput = g1.add("edittext", undefined, "0.004");
    valInput.characters = 6;

    var g2 = win.add("group");
    g2.add("statictext", undefined, "Keys per cycle:");
    var countInput = g2.add("edittext", undefined, "3");
    countInput.characters = 6;

    var g3 = win.add("group");
    g3.add("statictext", undefined, "Number of repeats:");
    var repeatInput = g3.add("edittext", undefined, "5");
    repeatInput.characters = 6;

    var g4 = win.add("group");
    g4.add("statictext", undefined, "Interval (frames):");
    var intervalInput = g4.add("edittext", undefined, "10");
    intervalInput.characters = 6;

    var runBtn = win.add("button", undefined, "Run");

    // ========= Execution =========
    runBtn.onClick = function () {
        var selProps = comp.selectedProperties;
        if (selProps.length === 0) {
            alert("Please select the property to apply keys.");
            return;
        }

        var val = parseFloat(valInput.text);
        var count = parseInt(countInput.text, 10);
        var repeat = parseInt(repeatInput.text, 10);
        var interval = parseInt(intervalInput.text, 10);

        if (isNaN(val) || isNaN(count) || isNaN(repeat) || isNaN(interval)) {
            alert("Invalid input.");
            return;
        }

        var fd = comp.frameDuration;
        var startF = Math.floor(comp.time / fd); // Timeline cursor position

        // Process all selected properties
        for (var p = 0; p < selProps.length; p++) {
            var prop = selProps[p];
            if (!(prop instanceof Property)) continue; // Skip non-numeric

            // Remove existing keys
            while (prop.numKeys > 0) {
                prop.removeKey(prop.numKeys);
            }

            var curFrame = startF;
            for (var r = 0; r < repeat; r++) {
                // Start with 0
                prop.setValueAtTime(curFrame * fd, 0);

                // Apply "val" for "count" times
                for (var i = 1; i <= count; i++) {
                    var t = (curFrame + i) * fd;
                    prop.setValueAtTime(t, val);
                }

                // End with 0
                var endFrame = curFrame + count + 1;
                prop.setValueAtTime(endFrame * fd, 0);

                // Add interval
                curFrame = endFrame + interval;
            }
        }

        alert("Keys applied! (Start frame: " + startF + ")");
    };

    win.center();
    win.show();

    app.endUndoGroup();
})();
