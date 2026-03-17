//ExpressionFinder v1.1.2 (English UI) by Digimonkey
(function(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Expression Finder", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.spacing = 10;
        win.margins = 16;

        // --- Top Controls ---
        var topControls = win.add("group");
        topControls.orientation = "column";
        topControls.alignChildren = ["fill", "top"];
        topControls.alignment = ["fill", "top"];
        topControls.spacing = 8;

        var scopeGroup = topControls.add("panel", undefined, "Search Range (for Search Execution)");
        scopeGroup.orientation = "row";
        var rbAllComps = scopeGroup.add("radioButton", undefined, "All Comps");
        var rbSelectedComps = scopeGroup.add("radioButton", undefined, "Selected Comps");
        var rbSelectedLayers = scopeGroup.add("radioButton", undefined, "Selected Layers");
        rbAllComps.value = true;

        var filterRow = topControls.add("group");
        filterRow.orientation = "row";
        filterRow.add("statictext", undefined, "Filter:");
        var ddFilter = filterRow.add("dropdownlist", undefined, ["Show All", "Null Refs Only", "Comp Refs Only", "Effect Refs Only"]);
        ddFilter.selection = 0;
        
        var btnSearch = filterRow.add("button", undefined, "Run Search");
        btnSearch.alignment = ["fill", "center"];

        var btnFixNames = topControls.add("button", undefined, "Fix Layer Names to Current (Lock-aware)");
        btnFixNames.preferredSize.height = 30;
        btnFixNames.helpTip = "Priority: Selected Layers > Usage of Selected Items > All Comps.";

        // --- List Area ---
        var listGroup = win.add("group");
        listGroup.alignment = ["fill", "fill"];
        listGroup.orientation = "column";

        var resList = listGroup.add("listbox", undefined, undefined, {
            numberOfColumns: 6,
            showHeaders: true,
            columnTitles: ["Comp", "Layer", "Property", "Type", "Status", "Details"]
        });
        resList.alignment = ["fill", "fill"];

        var searchData = [];

        // Helper to get all comps
        function getAllComps() {
            var comps = [];
            for (var i = 1; i <= app.project.numItems; i++) {
                if (app.project.item(i) instanceof CompItem) comps.push(app.project.item(i));
            }
            return comps;
        }

        // Target comps for Search execution
        function getTargetComps() {
            var comps = [];
            if (rbAllComps.value) {
                comps = getAllComps();
            } else {
                var selectedItems = app.project.selection;
                for (var i = 0; i < selectedItems.length; i++) {
                    if (selectedItems[i] instanceof CompItem) comps.push(selectedItems[i]);
                }
            }
            return comps;
        }

        // --- Fix Names Logic ---
        btnFixNames.onClick = function() {
            var layersToProcess = [];
            var activeComp = app.project.activeItem;

            // 1. If layers are selected in timeline
            if (activeComp && activeComp instanceof CompItem && activeComp.selectedLayers.length > 0) {
                layersToProcess = activeComp.selectedLayers;
            } 
            
            // 2. If no layers selected, check project panel selection
            if (layersToProcess.length === 0 && app.project.selection.length > 0) {
                var selectedItems = app.project.selection;
                var allComps = getAllComps();

                for (var i = 0; i < selectedItems.length; i++) {
                    var item = selectedItems[i];
                    if (item instanceof CompItem) {
                        for (var l = 1; l <= item.numLayers; l++) {
                            layersToProcess.push(item.layer(l));
                        }
                    } else if (item instanceof FootageItem) {
                        for (var c = 0; c < allComps.length; c++) {
                            var comp = allComps[c];
                            for (var l = 1; l <= comp.numLayers; l++) {
                                var lyr = comp.layer(l);
                                if (lyr.hasVideo && lyr.source === item) {
                                    layersToProcess.push(lyr);
                                }
                            }
                        }
                    }
                }
            } 

            // 3. If still 0, target all layers in all comps
            if (layersToProcess.length === 0) {
                var allComps = getAllComps();
                for (var i = 0; i < allComps.length; i++) {
                    var comp = allComps[i];
                    for (var l = 1; l <= comp.numLayers; l++) {
                        layersToProcess.push(comp.layer(l));
                    }
                }
            }

            if (layersToProcess.length === 0) return alert("No layers found in project.");

            app.beginUndoGroup("Fix Layer Names (Expression Finder)");
            var count = 0;
            try {
                for (var n = 0; n < layersToProcess.length; n++) {
                    var layer = layersToProcess[n];
                    var isLocked = layer.locked;
                    
                    if (isLocked) layer.locked = false;

                    var currentName = layer.name;
                    layer.name = "temp_name"; 
                    layer.name = currentName;

                    if (isLocked) layer.locked = true;
                    count++;
                }
                alert(count + " layer names have been fixed.");
            } catch (e) {
                alert("Error: " + e.toString());
            } finally {
                app.endUndoGroup();
            }
        };

        // --- Analysis Logic ---
        function getReferenceDetail(exp) {
            var details = [];
            var compMatch = exp.match(/comp\s*\(\s*["'](.+?)["']\s*\)/);
            if (compMatch) details.push("Comp: " + compMatch[1]);
            var layerMatch = exp.match(/layer\s*\(\s*["'](.+?)["']\s*\)/);
            if (layerMatch) details.push("Layer: " + layerMatch[1]);
            var effectMatch = exp.match(/effect\s*\(\s*["'](.+?)["']\s*\)/);
            if (effectMatch) details.push("Effect: " + effectMatch[1]);
            if (exp.indexOf("parent") !== -1) details.push("Parent");
            return details.join(" / ");
        }

        function isNullReference(exp, comp) {
            if (exp.match(/layer\s*\(\s*["'].*?(null|ヌル).*?["']\s*\)/i)) return true;
            if (exp.match(/\.layer\([^\)]*?(null|ヌル)[^\)]*?\)/i)) return true;
            return false;
        }

        btnSearch.onClick = function() {
            resList.removeAll();
            searchData = [];
            
            if (rbSelectedLayers.value) {
                var activeItem = app.project.activeItem;
                if (activeItem && activeItem instanceof CompItem) {
                    var selLayers = activeItem.selectedLayers;
                    for (var l = 0; l < selLayers.length; l++) {
                        searchRecursive(selLayers[l], activeItem, searchData);
                    }
                }
            } else {
                var targetComps = getTargetComps();
                for (var c = 0; c < targetComps.length; c++) {
                    var comp = targetComps[c];
                    for (var l = 1; l <= comp.numLayers; l++) {
                        searchRecursive(comp.layer(l), comp, searchData);
                    }
                }
            }

            for (var j = 0; j < searchData.length; j++) {
                var item = resList.add("item", searchData[j].comp.name);
                item.subItems[0].text = searchData[j].layer.name;
                item.subItems[1].text = searchData[j].prop.name;
                item.subItems[2].text = searchData[j].type;
                item.subItems[3].text = searchData[j].status;
                item.subItems[4].text = searchData[j].detail;
            }
        };

        function searchRecursive(propParent, comp, results) {
            if (!propParent.numProperties) return;
            for (var i = 1; i <= propParent.numProperties; i++) {
                var prop = propParent.property(i);
                if (prop.propertyType === PropertyType.PROPERTY) {
                    if (prop.canSetExpression && prop.expressionEnabled && prop.expression !== "") {
                        var exp = prop.expression;
                        var type = "Internal Calc";
                        
                        if (exp.indexOf("comp(") !== -1) type = "Comp Ref";
                        else if (isNullReference(exp, comp)) type = "Null Ref";
                        else if (exp.indexOf("effect(") !== -1) type = "Effect Ref";
                        else if (exp.indexOf("layer(") !== -1 || exp.indexOf("parent") !== -1) type = "Layer Ref";
                        
                        var status = (prop.expressionError !== "") ? "Error" : "";
                        var detail = getReferenceDetail(exp);
                        
                        var show = false;
                        var idx = ddFilter.selection.index;
                        if (idx === 0) show = true;
                        else if (idx === 1 && type === "Null Ref") show = true;
                        else if (idx === 2 && type === "Comp Ref") show = true;
                        else if (idx === 3 && type === "Effect Ref") show = true;

                        if (show) {
                            var layerObj = (propParent instanceof Layer) ? propParent : getLayerParent(propParent);
                            results.push({comp: comp, layer: layerObj, prop: prop, type: type, status: status, detail: detail});
                        }
                    }
                } else {
                    searchRecursive(prop, comp, results);
                }
            }
        }

        function getLayerParent(prop) {
            var p = prop;
            while (p.parentProperty !== null) { p = p.parentProperty; }
            return p;
        }

        resList.onDoubleClick = function() {
            if (!resList.selection) return;
            var data = searchData[resList.selection.index];
            data.comp.openInViewer();
            for (var i = 1; i <= data.comp.numLayers; i++) data.comp.layer(i).selected = false;
            data.layer.selected = true;
            data.prop.selected = true;
            app.executeCommand(app.findMenuCommandId("Reveal in Timeline"));
        };

        win.onResizing = win.onResize = function() {
            this.layout.resize();
            var w = resList.size[0] - 25;
            resList.columnWidths = [w * 0.18, w * 0.18, w * 0.18, w * 0.12, w * 0.1, w * 0.24];
        };

        win.layout.layout(true);
        return win;
    }

    var myWin = buildUI(thisObj);
    if (myWin instanceof Window) { myWin.center(); myWin.show(); }
})(this);