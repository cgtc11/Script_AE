(function (thisObj) {
    var SCRIPTS_ROOT = new Folder(Folder.startup.fullName + "/Scripts");

    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "Scripts Browser", undefined, {resizeable:true});

        win.orientation = "column";
        win.alignChildren = ["fill", "fill"];
        win.spacing = 5;
        win.margins = 10;

        // --- ツールバー ---
        var toolBar = win.add("group");
        toolBar.orientation = "row";
        toolBar.alignment = ["fill", "top"]; // 横いっぱいに広げる
        var btnRefresh = toolBar.add("button", undefined, "再読み込み");
        var btnSetRoot = toolBar.add("button", undefined, "ルート変更");

        // --- ツリービュー ---
        // ここを修正：preferredSizeを削除し、親要素に合わせて広がるように設定
        var tree = win.add("treeview", undefined, "");
        tree.alignment = ["fill", "fill"]; 

        // --- フォルダ取得・ソート関数 (変更なし) ---
        function getSortedFiles(folder) {
            var items = folder.getFiles();
            var folders = [];
            var files = [];
            for (var i = 0; i < items.length; i++) {
                if (items[i] instanceof Folder) {
                    folders.push(items[i]);
                } else if (items[i] instanceof File && items[i].name.match(/\.(jsx|jsxbin)$/i)) {
                    files.push(items[i]);
                }
            }
            var sortFn = function(a, b) { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); };
            folders.sort(sortFn);
            files.sort(sortFn);
            return folders.concat(files);
        }

        function addFolder(folder, parentNode) {
            var items = getSortedFiles(folder);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemName = File.decode(item.name);
                if (item instanceof Folder) {
                    var node = parentNode.add("node", "📁 " + itemName);
                    addFolder(item, node);
                } else {
                    var fileNode = parentNode.add("item", "📄 " + itemName);
                    fileNode.file = item;
                }
            }
        }

        function refreshTree() {
            tree.removeAll();
            if (SCRIPTS_ROOT.exists) {
                addFolder(SCRIPTS_ROOT, tree);
            } else {
                alert("フォルダが見つかりません:\n" + SCRIPTS_ROOT.fsName);
            }
        }

        // イベント処理
        btnRefresh.onClick = refreshTree;
        btnSetRoot.onClick = function () {
            var newPath = Folder.selectDialog("フォルダを選択");
            if (newPath) { SCRIPTS_ROOT = newPath; refreshTree(); }
        };

        tree.onDoubleClick = function () {
            var sel = tree.selection;
            if (sel && sel.file) { $.evalFile(sel.file); }
        };

        // --- 追加: リサイズ対応 ---
        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };

        refreshTree();
        win.layout.layout(true);
        return win;
    }

    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) {
        myUI.center();
        myUI.show();
    }
})(this);