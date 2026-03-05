(function (thisObj) {
    // 実行中のAEのScriptsフォルダを初期値として取得
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
        var btnRefresh = toolBar.add("button", undefined, "再読み込み");
        var btnSetRoot = toolBar.add("button", undefined, "ルート変更"); // ← 削除せず残しました

        // --- ツリービュー ---
        var tree = win.add("treeview", undefined, "");
        tree.preferredSize = [300, 600];

        // --- 関数: フォルダ内容の取得とソート（フォルダを上、ファイルを下に） ---
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

            // 名前順にソート（日本語対応）
            var sortFn = function(a, b) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            };
            folders.sort(sortFn);
            files.sort(sortFn);

            return folders.concat(files);
        }

        // --- 関数: ツリーの構築 ---
        function addFolder(folder, parentNode) {
            var items = getSortedFiles(folder);

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemName = File.decode(item.name); // 日本語デコード

                if (item instanceof Folder) {
                    var node = parentNode.add("node", "📁 " + itemName);
                    addFolder(item, node); // 再帰的に中身も追加
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

        // --- イベント処理 ---
        
        // 再読み込み
        btnRefresh.onClick = refreshTree;

        // ルート変更（読み込む場所を変更）
        btnSetRoot.onClick = function () {
            var newPath = Folder.selectDialog("スクリプトを読み込むルートフォルダを選択してください");
            if (newPath) {
                SCRIPTS_ROOT = newPath;
                refreshTree();
            }
        };

        // 実行（ダブルクリック）
        tree.onDoubleClick = function () {
            var sel = tree.selection;
            if (sel && sel.file) {
                $.evalFile(sel.file);
            }
        };

        // 初回読み込み
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