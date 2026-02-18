(function() {
    var project = app.project;
    var selectedItems = project.selection;

    if (selectedItems.length === 0) {
        alert("フォルダを選択してください。");
        return;
    }

    app.beginUndoGroup("Select Items Inside Folders");

    var targetItems = [];

    // 再帰的にフォルダ内を探索する関数
    function getItemsInFolder(folder) {
        for (var i = 1; i <= folder.numItems; i++) {
            var item = folder.item(i);
            if (item instanceof FolderItem) {
                // フォルダならさらに中身を探索（必要なら）
                getItemsInFolder(item);
            } else {
                // ファイルやコンポなら配列に追加
                targetItems.push(item);
            }
        }
    }

    // 1. 選択されたアイテムからフォルダを特定し、中身をリストアップ
    for (var j = 0; j < selectedItems.length; j++) {
        if (selectedItems[j] instanceof FolderItem) {
            getItemsInFolder(selectedItems[j]);
        }
    }

    // 2. 一旦すべての選択を解除
    for (var k = 1; k <= project.numItems; k++) {
        project.item(k).selected = false;
    }

    // 3. リストアップしたアイテム（ファイルやコンポ）のみを選択
    for (var l = 0; l < targetItems.length; l++) {
        targetItems[l].selected = true;
    }

    app.endUndoGroup();
})();