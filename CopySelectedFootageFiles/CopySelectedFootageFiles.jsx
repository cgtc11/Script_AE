/* CopySelectedFootageFiles_v33.jsx
    - 修正点：
        1) 【重要】連番（SEQ）時のフォルダ名重複回避に対応。
        2) フォルダ名がリネームされた場合も、正しくその中身へ再リンクするよう調整。
        3) 物理的なファイルコピーとAE内データの紐付けを強化。
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

    // 重複しないファイル/フォルダパスを生成する
    function getUniqueStorage(parentFolder, originalName) {
        var path = parentFolder.fsName + "/" + originalName;
        var testObj = new File(path); // FileでもFolderでもexistsは取れる
        if (!testObj.exists) return originalName;

        var baseName, ext;
        var dotIdx = originalName.lastIndexOf(".");
        
        // 拡張子の切り分け（フォルダの場合は拡張子なしとして扱う）
        if (dotIdx !== -1 && originalName.length - dotIdx <= 5) {
            baseName = originalName.substring(0, dotIdx);
            ext = originalName.substring(dotIdx); // .jpg など
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
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Copy & Relink v33", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = ["fill","fill"];
        win.margins = 10;

        var top = win.add("group");
        top.orientation = "column";
        top.alignChildren = ["fill","top"];

        var pDest = top.add("panel", undefined, "コピー先フォルダ");
        pDest.orientation = "row";
        var etDest = pDest.add("edittext", undefined, "");
        etDest.alignment = ["fill", "center"];
        var btnBrowse = pDest.add("button", undefined, "参照");
        
        var cbRename = top.add("checkbox", undefined, "同名フォルダ/ファイルはリネーム（上書き防止）");
        cbRename.value = false;

        btnBrowse.onClick = function() {
            var f = Folder.selectDialog();
            if(f) etDest.text = f.fsName;
        };

        var gBtns = top.add("group");
        var btnRefresh = gBtns.add("button", undefined, "一覧更新");
        var btnCopy = gBtns.add("button", undefined, "選択をコピー");
        var btnRelink = gBtns.add("button", undefined, "リンク更新");

        var tbs = win.add("tabbedpanel");
        tbs.alignment = ["fill","fill"];

        var tList = tbs.add("tab", undefined, "リスト表示");
        tList.orientation = "column";
        tList.alignChildren = ["fill", "fill"];

        var sortGroup = tList.add("group");
        var bSortAE = sortGroup.add("button", undefined, "AE順");
        var bSortType = sortGroup.add("button", undefined, "Type順");
        var bSortName = sortGroup.add("button", undefined, "名前順");
        var bSortPath = sortGroup.add("button", undefined, "パス順");

        var lb = tList.add("listbox", undefined, "", {
            multiselect: true, numberOfColumns: 3, showHeaders: true,
            columnTitles: ["Type", "Name", "Path"],
            columnWidths: [60, 200, 400]
        });
        lb.alignment = ["fill","fill"];
        lb.preferredSize.height = 600;

        var tTree = tbs.add("tab", undefined, "階層表示");
        var tv = tTree.add("treeview");
        tv.alignment = ["fill","fill"];

        var masterItems = [];

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
                    renamedStorageName: null // リネームされたフォルダ名またはファイル名
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

        btnCopy.onClick = function() {
            var data = getSelectedData();
            if (data.length == 0 || etDest.text == "") return alert("対象または保存先を確認してください");
            var destRoot = new Folder(etDest.text);
            ensureFolder(destRoot);
            var count = 0;

            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                if (d.isSeq) {
                    // 連番フォルダ処理
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
                    d.renamedStorageName = folderName; // 新しいフォルダ名を記録
                    count++;
                } else {
                    // 単一ファイル処理
                    var fileName = cbRename.value ? getUniqueStorage(destRoot, d.file.name) : d.file.name;
                    var targetFile = new File(destRoot.fsName + "/" + fileName);
                    
                    if (d.file.copy(targetFile)) {
                        d.renamedStorageName = fileName; // 新しいファイル名を記録
                        count++;
                    }
                }
            }
            alert("コピー完了: " + count + "件");
        };

        btnRelink.onClick = function() {
            var data = getSelectedData();
            if (data.length == 0 || etDest.text == "") return;
            var dest = new Folder(etDest.text);
            var c = 0;
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                // コピー時に確定した名前（フォルダ名 or ファイル名）を使用
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