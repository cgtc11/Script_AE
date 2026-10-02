(function (thisObj) {
    // AEの表示言語に合わせてUI文言を選択する（日本語以外は英語）。
    var UI_TEXT = (app.isoLanguage === "ja_JP") ? {
        refresh: "再読み込み",
        setRoot: "ルート変更",
        openFolder: "フォルダを開く",
        folderNotFound: "フォルダが見つかりません:",
        selectFolder: "フォルダを選択",
        openFolderFailed: "フォルダを開けませんでした:"
    } : {
        refresh: "Refresh",
        setRoot: "Change Root",
        openFolder: "Open Folder",
        folderNotFound: "Folder not found:",
        selectFolder: "Select a folder",
        openFolderFailed: "Could not open the folder:"
    };

    // --- 設定ファイルのパス定義 ---
    var PREF_FILE = new File(Folder.myDocuments.fullName + "/ScriptBrowser.txt");
    
    // 起動時に設定ファイルを読み込む。なければデフォルト
    var SCRIPTS_ROOT = loadPref() || new Folder(Folder.startup.fullName + "/Scripts");

    function savePref(folder) {
        try {
            PREF_FILE.open("w");
            PREF_FILE.write(folder.fsName);
            PREF_FILE.close();
        } catch (e) {
            // 保存失敗時はサイレントにスルー
        }
    }

    function loadPref() {
        if (PREF_FILE.exists) {
            PREF_FILE.open("r");
            var path = PREF_FILE.read();
            PREF_FILE.close();
            var f = new Folder(path);
            return f.exists ? f : null;
        }
        return null;
    }

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
        toolBar.alignment = ["fill", "top"];
        var btnRefresh = toolBar.add("button", undefined, UI_TEXT.refresh);
        var btnSetRoot = toolBar.add("button", undefined, UI_TEXT.setRoot);
        var btnOpenFolder = toolBar.add("button", undefined, UI_TEXT.openFolder);

        // --- ツリービュー ---
        var tree = win.add("treeview", undefined, "");
        tree.alignment = ["fill", "fill"]; 

        // --- 関数群 ---
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
                    node.folder = item;
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
                alert(UI_TEXT.folderNotFound + "\n" + SCRIPTS_ROOT.fsName);
            }
        }

        // --- イベント処理 ---
        btnRefresh.onClick = refreshTree;
        
        btnSetRoot.onClick = function () {
            var newPath = Folder.selectDialog(UI_TEXT.selectFolder);
            if (newPath) { 
                SCRIPTS_ROOT = newPath; 
                savePref(newPath); // ルート変更時に保存
                refreshTree(); 
            }
        };

        btnOpenFolder.onClick = function() {
            var targetFolder = SCRIPTS_ROOT;
            var sel = tree.selection;
            if (sel) {
                if (sel.folder) targetFolder = sel.folder;
                else if (sel.file) targetFolder = sel.file.parent;
            }
            // 最新の存在状態を確認し、失敗時は無言で終了しない。
            targetFolder = new Folder(targetFolder.fsName);
            if (!targetFolder.exists) {
                alert(UI_TEXT.folderNotFound + "\n" + targetFolder.fsName);
                return;
            }
            try {
                if (Folder.fs === "Windows") {
                    // WindowsではExplorerにパスを直接渡す。空白や日本語を含むパスにも対応。
                    var explorer = new File(Folder.system.fsName + "/explorer.exe");
                    if (!explorer.exists) explorer = new File(Folder.system.parent.fsName + "/explorer.exe");
                    if (explorer.exists) {
                        system.callSystem('"' + explorer.fsName + '" "' + targetFolder.fsName + '"');
                    } else if (!targetFolder.execute()) {
                        alert(UI_TEXT.openFolderFailed + "\n" + targetFolder.fsName);
                    }
                } else if (!targetFolder.execute()) {
                    alert(UI_TEXT.openFolderFailed + "\n" + targetFolder.fsName);
                }
            } catch (e) {
                alert(UI_TEXT.openFolderFailed + "\n" + targetFolder.fsName + "\n" + e.toString());
            }
        };

        tree.onDoubleClick = function () {
            var sel = tree.selection;
            if (sel && sel.file) { $.evalFile(sel.file); }
        };

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