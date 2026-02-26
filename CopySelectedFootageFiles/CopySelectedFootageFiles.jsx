/* CopySelectedFootageFiles_v35.jsx
    - 修正点：レイアウトの最適化
        1) 上部操作パネル、ソートボタンを上部に固定。
        2) リスト表示・階層表示がウィンドウのリサイズに合わせて縦に最大化されるよう修正。
*/

(function (thisObj) {

    var sortConfig = { key: "index", reverse: false };

    function isSequence(it) {
        if (!it.mainSource) return false;
        if (it.mainSource.isSequence === true) return true;
        if (it.name.indexOf("[") !== -1 && it.name.indexOf("]") !== -1) return true;
        return false;
    }

    function ensureFolder(folderObj) {
        if (!folderObj.exists) {
            if (folderObj.parent && !folderObj.parent.exists) ensureFolder(folderObj.parent);
            folderObj.create();
        }
    }

    function getUniqueStorage(parentFolder, originalName) {
        var path = parentFolder.fsName + "/" + originalName;
        var testObj = new File(path);
        if (!testObj.exists) return originalName;

        var baseName, ext;
        var dotIdx = originalName.lastIndexOf(".");
        
        if (dotIdx !== -1 && originalName.length - dotIdx <= 5) {
            baseName = originalName.substring(0, dotIdx);
            ext = originalName.substring(dotIdx);
        } else {
            baseName = originalName;
            ext = "";
        }

        var counter = 1;
        while (true) {
            var newName = baseName + "_" + counter + ext;
            var newPath = parentFolder.fsName + "/" + newName;
            if (!(new File(newPath).exists)) return newName;
            counter++;
        }
    }

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Copy & Relink v35", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = ["fill","fill"];
        win.margins = 10;
        win.spacing = 5;

        // --- 上部固定エリア ---
        var top = win.add("group");
        top.orientation = "column";
        top.alignChildren = ["fill","top"];
        top.spacing = 5;
        // ウィンドウを広げてもこのグループが縦に伸びないようにする
        top.alignment = ["fill", "top"]; 

        var pDest = top.add("panel", undefined, "コピー先フォルダ");
        pDest.orientation = "row";
        var etDest = pDest.add("edittext", undefined, "");
        etDest.alignment = ["fill", "center"];
        var btnBrowse = pDest.add("button", undefined, "参照");
        
        var cbRename = top.add("checkbox", undefined, "同名フォルダ/ファイルはリネーム（上書き防止）");
        cbRename.value = false;

        var cbAutoRelink = top.add("checkbox", undefined, "コピー後リンク自動更新");
        cbAutoRelink.value = true;

        btnBrowse.onClick = function() {
            var f = Folder.selectDialog();
            if(f) etDest.text = f.fsName;
        };

        var gBtns = top.add("group");
        var btnRefresh = gBtns.add("button", undefined, "一覧更新");
        var btnCopy = gBtns.add("button", undefined, "選択をコピー");
        var btnRelink = gBtns.add("button", undefined, "リンク更新");

        btnRelink.enabled = !cbAutoRelink.value;
        cbAutoRelink.onClick = function() {
            btnRelink.enabled = !this.value;
        };

        // --- メインエリア（ここが伸びる） ---
        var tbs = win.add("tabbedpanel");
        tbs.alignment = ["fill","fill"]; // 上下左右に広がる設定

        // リスト表示タブ
        var tList = tbs.add("tab", undefined, "リスト表示");
        tList.orientation = "column";
        tList.alignChildren = ["fill", "fill"];
        tList.spacing = 5;

        // ソートボタンもリスト表示タブの中の上部に配置
        var sortGroup = tList.add("group");
        sortGroup.alignment = ["fill", "top"];
        var bSortAE = sortGroup.add("button", undefined, "AE順");
        var bSortType = sortGroup.add("button", undefined, "Type順");
        var bSortName = sortGroup.add("button", undefined, "名前順");
        var bSortPath = sortGroup.add("button", undefined, "パス順");

        var lb = tList.add("listbox", undefined, "", {
            multiselect: true, numberOfColumns: 3, showHeaders: true,
            columnTitles: ["Type", "Name", "Path"],
            columnWidths: [60, 200, 400]
        });
        lb.alignment = ["fill","fill"]; // リストボックスを最大化

        // 階層表示タブ
        var tTree = tbs.add("tab", undefined, "階層表示");
        tTree.orientation = "column";
        tTree.alignChildren = ["fill", "fill"];
        var tv = tTree.add("treeview");
        tv.alignment = ["fill","fill"];

        var masterItems = [];

        // --- 以下ロジック部分は変更なし ---
        function refresh() {
            if (!app.project) return;
            masterItems = [];
            var idx = 0;
            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (!(it instanceof FootageItem) || !it.mainSource.file) continue;
                var isSeq = isSequence(it);
                masterItems.push({
                    index: idx++,
                    type: isSeq ? "SEQ" : "FILE",
                    name: it.name,
                    path: isSeq ? it.mainSource.file.parent.fsName : it.mainSource.file.fsName,
                    item: it, isSeq: isSeq, file: it.mainSource.file, parent: it.mainSource.file.parent,
                    renamedStorageName: null 
                });
            }
            sortData(sortConfig.key, false);
            updateTreeView();
        }

        function sortData(key, toggle) {
            if (toggle) {
                if (sortConfig.key === key) sortConfig.reverse = !sortConfig.reverse;
                else { sortConfig.key = key; sortConfig.reverse = false; }
            }
            masterItems.sort(function(a, b) {
                var vA = a[key]; var vB = b[key];
                if (typeof vA === "string") { vA = vA.toLowerCase(); vB = vB.toLowerCase(); }
                if (vA < vB) return sortConfig.reverse ? 1 : -1;
                if (vA > vB) return sortConfig.reverse ? -1 : 1;
                return 0;
            });
            updateListView();
        }

        function updateListView() {
            lb.removeAll();
            for (var i = 0; i < masterItems.length; i++) {
                var d = masterItems[i];
                var row = lb.add("item", d.type);
                row.subItems[0].text = d.name;
                row.subItems[1].text = d.path;
                row._data = d;
            }
        }

        function updateTreeView() {
            tv.removeAll();
            var folderMap = {};
            function getTreeNode(aeItem) {
                if (aeItem.parentFolder.id === app.project.rootFolder.id) return tv;
                var parentId = aeItem.parentFolder.id;
                if (!folderMap[parentId]) {
                    var pNode = getTreeNode(aeItem.parentFolder);
                    folderMap[parentId] = pNode.add("node", aeItem.parentFolder.name);
                }
                return folderMap[parentId];
            }
            for (var i = 0; i < masterItems.length; i++) {
                var d = masterItems[i];
                var node = getTreeNode(d.item);
                var itemNode = node.add("item", d.name);
                itemNode._data = d;
            }
        }

        bSortAE.onClick = function() { sortData("index", true); };
        bSortType.onClick = function() { sortData("type", true); };
        bSortName.onClick = function() { sortData("name", true); };
        bSortPath.onClick = function() { sortData("path", true); };
        btnRefresh.onClick = refresh;

        function getSelectedData() {
            var selected = [];
            if (tbs.selection == tList) {
                if (!lb.selection) return [];
                for(var i=0; i<lb.selection.length; i++) selected.push(lb.selection[i]._data);
            } else {
                if(tv.selection && tv.selection._data) selected.push(tv.selection._data);
            }
            return selected;
        }

        function executeRelink(data, destPath) {
            var dest = new Folder(destPath);
            var c = 0;
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                var storageName = d.renamedStorageName ? d.renamedStorageName : (d.isSeq ? d.parent.name : d.file.name);
                var targetPath = d.isSeq 
                    ? dest.fsName + "/" + storageName + "/" + d.file.name 
                    : dest.fsName + "/" + storageName;
                
                var f = new File(targetPath);
                if (f.exists) {
                    if (d.isSeq) d.item.replaceWithSequence(f, false); else d.item.replace(f);
                    c++;
                }
            }
            return c;
        }

        btnCopy.onClick = function() {
            var data = getSelectedData();
            if (data.length == 0 || etDest.text == "") return alert("対象または保存先を確認してください");
            var destRoot = new Folder(etDest.text);
            ensureFolder(destRoot);
            var count = 0;

            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (d.isSeq) {
                    var folderName = cbRename.value ? getUniqueStorage(destRoot, d.parent.name) : d.parent.name;
                    var subFolder = new Folder(destRoot.fsName + "/" + folderName);
                    ensureFolder(subFolder);
                    var files = d.parent.getFiles();
                    for (var f = 0; f < files.length; f++) {
                        if (files[f] instanceof File) {
                            var targetFile = new File(subFolder.fsName + "/" + files[f].name);
                            files[f].copy(targetFile);
                        }
                    }
                    d.renamedStorageName = folderName;
                    count++;
                } else {
                    var fileName = cbRename.value ? getUniqueStorage(destRoot, d.file.name) : d.file.name;
                    var targetFile = new File(destRoot.fsName + "/" + fileName);
                    if (d.file.copy(targetFile)) {
                        d.renamedStorageName = fileName;
                        count++;
                    }
                }
            }

            var msg = "コピー完了: " + count + "件";
            if (cbAutoRelink.value) {
                var relinkCount = executeRelink(data, etDest.text);
                msg += "\n自動再リンク: " + relinkCount + "件完了";
                refresh();
            }
            alert(msg);
        };

        btnRelink.onClick = function() {
            var data = getSelectedData();
            if (data.length == 0 || etDest.text == "") return;
            var c = executeRelink(data, etDest.text);
            refresh();
            alert(c + " 件再リンク完了");
        };

        win.onResizing = win.onResize = function() { this.layout.resize(); };
        refresh();
        return win;
    }

    var mainWin = buildUI(thisObj);
    if (mainWin instanceof Window) { mainWin.center(); mainWin.show(); }

})(this);