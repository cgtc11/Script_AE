(function() {
    var win = new Window("dialog", "AEP 階層維持収集ツール", undefined, {resizeable: false});
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 12;
    win.margins = 20;

    var title = win.add("statictext", undefined, "AEP 階層維持収集ツール");
    title.graphics.font = ScriptUI.newFont("dialog", "BOLD", 14);
    title.alignment = ["center", "top"];

    win.add("panel", undefined, "");

    var srcGroup = win.add("panel", undefined, "元のAEPフォルダ");
    var srcInput = srcGroup.add("edittext", [0, 0, 380, 26], "D:\\");
    var srcBtn = srcGroup.add("button", [0, 0, 60, 26], "参照...");
    srcBtn.onClick = function() {
        var f = Folder.selectDialog("元のAEPフォルダを選択");
        if (f) srcInput.text = f.fsName;
    };

    var destGroup = win.add("panel", undefined, "収集先フォルダ");
    var destInput = destGroup.add("edittext", [0, 0, 380, 26], "D:\\");
    var destBtn = destGroup.add("button", [0, 0, 60, 26], "参照...");
    destBtn.onClick = function() {
        var f = Folder.selectDialog("収集先フォルダを選択");
        if (f) destInput.text = f.fsName;
    };

    var optGroup = win.add("group");
    var chkReport = optGroup.add("checkbox", undefined, "レポート出力 (txt)");
    chkReport.value = true;

    var btnGroup = win.add("group");
    var cancelBtn = btnGroup.add("button", [0, 0, 100, 30], "キャンセル");
    var runBtn = btnGroup.add("button", [0, 0, 100, 30], "収集開始");

    cancelBtn.onClick = function() { win.close(); };

    runBtn.onClick = function() {
        try {
            var srcPath = srcInput.text.replace(/\\/g, "/").replace(/\/$/, "");
            var destPath = destInput.text.replace(/\\/g, "/").replace(/\/$/, "");
            var srcRoot = new Folder(srcPath);
            var destRoot = new Folder(destPath);

            if (!srcRoot.exists) { alert("元フォルダが見つかりません"); return; }
            if (!destRoot.exists) destRoot.create();

            var isReportRequested = chkReport.value;
            win.close();

            var aepFiles = [];
            function getAepFiles(folder) {
                var files = folder.getFiles();
                for (var i = 0; i < files.length; i++) {
                    if (files[i] instanceof Folder) getAepFiles(files[i]);
                    else if (files[i].name.toLowerCase().slice(-4) === ".aep") aepFiles.push(files[i]);
                }
            }
            getAepFiles(srcRoot);

            function getItemFolderPath(item) {
                var pathParts = [];
                var parent = item.parentFolder;
                while (parent !== null && parent !== app.project.rootFolder) {
                    pathParts.unshift(parent.name);
                    parent = parent.parentFolder;
                }
                return pathParts.join("/");
            }

            function getAllFootageItems(collection, result) {
                for (var i = 1; i <= collection.length; i++) {
                    var item = collection[i];
                    if (item instanceof FolderItem) getAllFootageItems(item.items, result);
                    else if (item instanceof FootageItem) result.push(item);
                }
                return result;
            }

            var PREF_SECTION = "Main Pref Section v2";
            var PREF_KEY = "Warn Before Save Large File";
            var originalPref = 1;
            try {
                if (app.preferences.havePref(PREF_SECTION, PREF_KEY)) {
                    originalPref = app.preferences.getPrefAsLong(PREF_SECTION, PREF_KEY);
                }
            } catch(e) {}
            app.preferences.savePrefAsLong(PREF_SECTION, PREF_KEY, 0);

            app.beginSuppressDialogs();

            for (var f = 0; f < aepFiles.length; f++) {
                var currentFile = aepFiles[f];
                var projName = currentFile.name.slice(0, -4);
                var relativePath = currentFile.parent.fsName.replace(srcRoot.fsName, "");
                var projOutFolder = new Folder(destRoot.fsName + relativePath + "/" + projName);
                if (!projOutFolder.exists) projOutFolder.create();

                var footageRoot = new Folder(projOutFolder.fsName + "/(フッテージ)");
                if (!footageRoot.exists) footageRoot.create();

                var proj = app.open(currentFile);
                var allFootage = getAllFootageItems(proj.items, []);
                var hasLinkError = false;
                
                var totalFilesCount = 0;
                var totalSize = 0;
                var sourceReportLines = [];
                var compList = [];
                for(var c=1; c<=proj.items.length; c++){
                    if(proj.items[c] instanceof CompItem) compList.push(proj.items[c].name);
                }

                for (var i = 0; i < allFootage.length; i++) {
                    var item = allFootage[i];
                    if (!(item.mainSource instanceof FileSource)) continue;

                    var internalPath = getItemFolderPath(item);
                    var targetFolder = footageRoot;

                    if (internalPath !== "") {
                        targetFolder = new Folder(footageRoot.fsName + "/" + internalPath);
                        if (!targetFolder.exists) {
                            var folderNames = internalPath.split("/");
                            var currentPath = footageRoot.fsName;
                            for (var j = 0; j < folderNames.length; j++) {
                                if (folderNames[j] === "") continue;
                                currentPath += "/" + folderNames[j];
                                var fld = new Folder(currentPath);
                                if (!fld.exists) fld.create();
                            }
                        }
                    }

                    var srcFile = item.mainSource.file;
                    if (srcFile && srcFile.exists) {
                        var destFile = new File(targetFolder.fsName + "/" + srcFile.name);
                        srcFile.copy(destFile.fsName);
                        
                        var line = "";
                        if (item.mainSource.isStill) {
                            totalFilesCount += 1;
                            totalSize += srcFile.length;
                            line = "1 個のファイルを使用した " + srcFile.parent.fsName + " の「" + srcFile.name + "」";
                        } else {
                            var frameCount = Math.round(item.duration * item.frameRate);
                            totalFilesCount += frameCount;
                            totalSize += (srcFile.length * frameCount);
                            // シーケンス名の表記は以前の仕様（item.name）に戻しました
                            line = frameCount + " 個のファイルと 0 個の予備ファイルを使用した " + srcFile.parent.fsName + " のシーケンス「" + item.name + "」";
                        }
                        sourceReportLines.push(line);
                        item.replace(destFile);
                    } else {
                        hasLinkError = true;
                    }
                }

                var saveName = hasLinkError ? projName + "_リンク切れあり.aep" : currentFile.name;
                proj.save(new File(projOutFolder.fsName + "/" + saveName));

                if (isReportRequested) {
                    var now = new Date();
                    var dateStr = now.getFullYear() + "/" + ("0"+(now.getMonth()+1)).slice(-2) + "/" + ("0"+now.getDate()).slice(-2) + "    " + now.toLocaleTimeString();
                    
                    // TXTファイル名にアンダーバーを追加
                    var reportFile = new File(projOutFolder.fsName + "/" + projName + "_レポート.txt");
                    reportFile.encoding = "UTF-8";
                    reportFile.open("w");
                    reportFile.writeln("レポート作成日：");
                    reportFile.writeln("    " + dateStr);
                    reportFile.writeln("");
                    reportFile.writeln("プロジェクト名：" + currentFile.name);
                    reportFile.writeln("");
                    reportFile.writeln("収集されたソースファイル先：");
                    reportFile.writeln("    " + projOutFolder.fsName);
                    reportFile.writeln("");
                    reportFile.writeln("収集されたソースファイル： " + (hasLinkError ? "一部欠落" : "すべて"));
                    reportFile.writeln("");
                    reportFile.writeln("収集されたコンポジション：");
                    reportFile.writeln("    " + (compList.length > 0 ? compList.join(", ") : "なし"));
                    reportFile.writeln("");
                    reportFile.writeln("収集されたファイルの数： " + totalFilesCount);
                    reportFile.writeln("収集されたファイルのサイズ： " + Math.round(totalSize / 1024 / 1024) + " MB");
                    reportFile.writeln("");
                    reportFile.writeln("収集されたソースファイル：");
                    for(var r=0; r<sourceReportLines.length; r++) {
                        reportFile.writeln("    " + sourceReportLines[r]);
                    }
                    reportFile.writeln("");
                    reportFile.writeln("レンダリングプラグイン：");
                    reportFile.writeln("    クラシック3D");
                    reportFile.close();
                }

                proj.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            }

            app.endSuppressDialogs(false);
            app.preferences.savePrefAsLong(PREF_SECTION, PREF_KEY, originalPref);

            alert("収集完了！");

        } catch(e) {
            app.endSuppressDialogs(false);
            alert("エラー: " + e.message);
        }
    };
    win.show();
})();