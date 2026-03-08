(function (thisObj) {
    // --- Preference file path ---
    var PREF_FILE = new File(Folder.myDocuments.fullName + "/ScriptBrowser.txt");
    
    // Load preference on startup, otherwise use default
    var SCRIPTS_ROOT = loadPref() || new Folder(Folder.startup.fullName + "/Scripts");

    function savePref(folder) {
        try {
            PREF_FILE.open("w");
            PREF_FILE.write(folder.fsName);
            PREF_FILE.close();
        } catch (e) {
            // Silently ignore save failures
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

        // --- Toolbar ---
        var toolBar = win.add("group");
        toolBar.orientation = "row";
        toolBar.alignment = ["fill", "top"];
        var btnRefresh = toolBar.add("button", undefined, "Refresh");
        var btnSetRoot = toolBar.add("button", undefined, "Change Root");
        var btnOpenFolder = toolBar.add("button", undefined, "Open Folder");

        // --- Tree View ---
        var tree = win.add("treeview", undefined, "");
        tree.alignment = ["fill", "fill"]; 

        // --- Functions ---
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
                alert("Folder not found:\n" + SCRIPTS_ROOT.fsName);
            }
        }

        // --- Event handlers ---
        btnRefresh.onClick = refreshTree;
        
        btnSetRoot.onClick = function () {
            var newPath = Folder.selectDialog("Select a folder");
            if (newPath) { 
                SCRIPTS_ROOT = newPath; 
                savePref(newPath); // Save when root is changed
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
            if (targetFolder.exists) targetFolder.execute();
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