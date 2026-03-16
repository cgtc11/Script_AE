(function(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Expression Finder Pro", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.spacing = 10;
        win.margins = 16;

        // --- 上部設定エリア（固定） ---
        var topControls = win.add("group");
        topControls.orientation = "column";
        topControls.alignChildren = ["fill", "top"];
        topControls.alignment = ["fill", "top"];
        topControls.spacing = 10;

        // 検索範囲パネル
        var scopeGroup = topControls.add("panel", undefined, "検索範囲");
        scopeGroup.orientation = "row";
        var rbAllComps = scopeGroup.add("radioButton", undefined, "全コンポ");
        var rbSelectedComps = scopeGroup.add("radioButton", undefined, "選択したコンポ");
        var rbSelectedLayers = scopeGroup.add("radioButton", undefined, "選択レイヤー");
        rbAllComps.value = true;

        // フィルタ・検索ボタンの行
        var filterRow = topControls.add("group");
        filterRow.orientation = "row";
        filterRow.add("statictext", undefined, "抽出対象:");
        var ddFilter = filterRow.add("dropdownlist", undefined, ["すべて表示", "Null参照のみ", "他コンポ参照のみ", "エフェクト参照のみ"]);
        ddFilter.selection = 0;
        
        var btnSearch = filterRow.add("button", undefined, "検索実行");
        btnSearch.alignment = ["fill", "center"];
        btnSearch.preferredSize.height = 30;

        // --- リスト表示エリア（伸縮） ---
        var listGroup = win.add("group");
        listGroup.alignment = ["fill", "fill"];
        listGroup.orientation = "column";

        var resList = listGroup.add("listbox", undefined, undefined, {
            numberOfColumns: 6,
            showHeaders: true,
            columnTitles: ["コンポ", "レイヤー", "プロパティ", "種別", "状態", "参照先詳細"]
        });
        resList.alignment = ["fill", "fill"];

        var searchData = [];

        // --- 参照解析ロジック ---
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
            var layerMatch = exp.match(/layer\s*\(\s*["'](.+?)["']\s*\)/);
            var targetName = layerMatch ? layerMatch[1] : null;
            if (targetName) {
                if (targetName.match(/null|ヌル/i)) return true;
                var targetLayer = comp.layer(targetName);
                if (targetLayer) {
                    if (targetLayer.nullLayer) return true;
                    if (targetLayer.width === 100 && targetLayer.height === 100) return true;
                }
            }
            if (exp.match(/null|ヌル/i)) return true;
            return false;
        }

        btnSearch.onClick = function() {
            resList.removeAll();
            searchData = [];
            var targetComps = [];

            if (rbAllComps.value) {
                for (var i = 1; i <= app.project.numItems; i++) {
                    if (app.project.item(i) instanceof CompItem) targetComps.push(app.project.item(i));
                }
            } else if (rbSelectedComps.value) {
                var selectedItems = app.project.selection;
                for (var i = 0; i < selectedItems.length; i++) {
                    if (selectedItems[i] instanceof CompItem) targetComps.push(selectedItems[i]);
                }
                if (targetComps.length === 0) alert("プロジェクトパネルでコンポを選択してください。");
            } else if (rbSelectedLayers.value) {
                var activeItem = app.project.activeItem;
                if (activeItem && activeItem instanceof CompItem) {
                    var selLayers = activeItem.selectedLayers;
                    for (var l = 0; l < selLayers.length; l++) {
                        searchRecursive(selLayers[l], activeItem, searchData);
                    }
                }
            }

            for (var c = 0; c < targetComps.length; c++) {
                var comp = targetComps[c];
                for (var l = 1; l <= comp.numLayers; l++) {
                    searchRecursive(comp.layer(l), comp, searchData);
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
                        var type = "内部計算";
                        if (exp.indexOf("comp(") !== -1) type = "他コンポ参照";
                        else if (isNullReference(exp, comp)) type = "Null参照";
                        else if (exp.indexOf("effect(") !== -1) type = "エフェクト参照";
                        else if (exp.indexOf("layer(") !== -1 || exp.indexOf("parent") !== -1) type = "外部レイヤー参照";
                        
                        var status = (prop.expressionError !== "") ? "エラー" : "";
                        var detail = getReferenceDetail(exp);
                        
                        var show = false;
                        if (ddFilter.selection.index === 0) show = true;
                        if (ddFilter.selection.index === 1 && type === "Null参照") show = true;
                        if (ddFilter.selection.index === 2 && type === "他コンポ参照") show = true;
                        if (ddFilter.selection.index === 3 && type === "エフェクト参照") show = true;

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