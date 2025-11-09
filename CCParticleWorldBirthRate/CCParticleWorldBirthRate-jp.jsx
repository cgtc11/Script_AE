/* 
    Universal Key Generator v1.0.0
    - レイヤーを選択すればOK
    - そのレイヤーの「選択中のプロパティ」にキーを打つ
    - プロパティ判定はせず、数値が打てるものなら全部対象
*/

(function () {
    app.beginUndoGroup("Universal Key Generator");

    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("コンポジションを開いてください。");
        return;
    }

    // 無音アラート
    function silentAlert(msg) {
        var dlg = new Window("dialog", "通知");
        dlg.add("statictext", undefined, msg);
        dlg.add("button", undefined, "OK", {name:"ok"});
        dlg.show();
    }
    alert = silentAlert;

    // ========= UI =========
    var win = new Window("palette", "BirthRate Key Generator", undefined);
    win.orientation = "column";

    // ★ 説明＋参考値（複数行で表示）
    var infoGroup = win.add("group");
    infoGroup.orientation = "column";
    infoGroup.add("statictext", undefined, "BirthRateを選択して実行してください。");
    infoGroup.add("statictext", undefined, "粒の最小単位");
    infoGroup.add("statictext", undefined, "Line：0.0039   Other：0.0313");

    var g1 = win.add("group");
    g1.add("statictext", undefined, "粒の量 (BirthRate):");
    var valInput = g1.add("edittext", undefined, "0.004");
    valInput.characters = 6;

    var g2 = win.add("group");
    g2.add("statictext", undefined, "1ループのキー数:");
    var countInput = g2.add("edittext", undefined, "3");
    countInput.characters = 6;

    var g3 = win.add("group");
    g3.add("statictext", undefined, "繰り返し回数:");
    var repeatInput = g3.add("edittext", undefined, "5");
    repeatInput.characters = 6;

    var g4 = win.add("group");
    g4.add("statictext", undefined, "間隔フレーム:");
    var intervalInput = g4.add("edittext", undefined, "10");
    intervalInput.characters = 6;

    var runBtn = win.add("button", undefined, "実行");

    // ========= 実行処理 =========
    runBtn.onClick = function () {
        var selProps = comp.selectedProperties;
        if (selProps.length === 0) {
            alert("キーを打ちたいプロパティを選択してください。");
            return;
        }

        var val = parseFloat(valInput.text);
        var count = parseInt(countInput.text, 10);
        var repeat = parseInt(repeatInput.text, 10);
        var interval = parseInt(intervalInput.text, 10);

        if (isNaN(val) || isNaN(count) || isNaN(repeat) || isNaN(interval)) {
            alert("入力が不正です。");
            return;
        }

        var fd = comp.frameDuration;
        var startF = Math.floor(comp.time / fd); // タイムスライダー位置

        // 選択しているすべてのプロパティを処理
        for (var p = 0; p < selProps.length; p++) {
            var prop = selProps[p];
            if (!(prop instanceof Property)) continue; // 数値系以外は無視

            // 既存キー削除
            while (prop.numKeys > 0) {
                prop.removeKey(prop.numKeys);
            }

            var curFrame = startF;
            for (var r = 0; r < repeat; r++) {
                // 開始は0キー
                prop.setValueAtTime(curFrame * fd, 0);

                // count回ぶん val を連続
                for (var i = 1; i <= count; i++) {
                    var t = (curFrame + i) * fd;
                    prop.setValueAtTime(t, val);
                }

                // 終了時に0
                var endFrame = curFrame + count + 1;
                prop.setValueAtTime(endFrame * fd, 0);

                // 終了後に interval を空けて次へ
                curFrame = endFrame + interval;
            }
        }

        alert("キー打ち完了！（開始位置：" + startF + "f）");
    };

    win.center();
    win.show();

    app.endUndoGroup();
})();
