//ExpressionFinder v1.1 by Digimonkey (English Version)
(function(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Expression Finder", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.spacing = 10;
        win.margins = 16;

        // --- Top Control Area ---
        var topControls = win.add("group");
        topControls.orientation = "column";
        topControls.alignChildren = ["fill", "top"];
        topControls.alignment = ["fill", "top"];
        topControls.spacing = 8;

        var scopeGroup = topControls.add("panel", undefined, "Search Scope");
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

        var btnFixNames = topControls.add("button", undefined, "Lock Layer Names (Fix Source Link)");
        btnFixNames.preferredSize.height = 30;
        btnFixNames.helpTip = "Sets the current layer name as a custom name to prevent broken expressions when changing source names.";

        // --- List Display Area ---
        var listGroup = win.add("group");
        listGroup.alignment = ["fill", "fill"];
        listGroup.orientation = "column";

        var resList = listGroup.add("listbox", undefined, undefined, {
            numberOfColumns: 6,
            showHeaders: true,
            columnTitles: ["Comp", "Layer", "Property", "Type", "Status", "Reference Detail"]
        });
        resList.alignment = ["fill", "fill"];

        var searchData = [];

        function getTargetComps() {
            var comps = [];
            if (rbAllComps.value) {
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i) instanceof CompItem) comps.push(app.project.item(i));
                }
            } else {
                var selectedItems = app.project.selection;
                for (var i = 0; i < selectedItems.length; i++) {
                    if (selectedItems[i] instanceof CompItem) comps.push(selectedItems[i]);
                }
            }
            return comps;
        }

        // --- Fix Name Logic ---
        btnFixNames.onClick = function() {
            var targetComps = getTargetComps();
            if (targetComps.length === 0) return alert("No target compositions found.");

            app.beginUndoGroup("Fix Layer Names");
            var count = 0;
            try {
                for (var c = 0; c < targetComps.length; c++) {
                    var comp = targetComps[c];
                    for (var l = 1; l <= comp.numLayers; l++) {
                        var layer = comp.layer(l);
                        var isLocked = layer.locked;
                        
                        if (isLocked) layer.locked = false;

                        var currentName = layer.name;
                        layer.name = "temp_name";
                        layer.name = currentName;

                        if (isLocked) layer.locked = true;
                        count++;
                    }
                }
                alert("Fixed " + count + " layer names.");
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
                        var type = "Internal";
                        
                        if (exp.indexOf("comp(") !== -1) type = "Comp Ref";
                        else if (isNullReference(exp, comp)) type = "Null Ref";
                        else if (exp.indexOf("effect(") !== -1) type = "Effect Ref";
                        else if (exp.indexOf("layer(") !== -1 || exp.indexOf("parent") !== -1) type = "External Layer Ref";
                        
                        var status = (prop.expressionError !== "") ? "Error" : "OK";
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
            resList.columnWidths = [w * 0.15, w * 0.15, w * 0.18, w * 0.15, w * 0.1, w * 0.27];
        };

        win.layout.layout(true);
        return win;
    }

    var myWin = buildUI(thisObj);
    if (myWin instanceof Window) { myWin.center(); myWin.show(); }
})(this);