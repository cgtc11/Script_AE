(function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("コンポジションをアクティブにしてください。");
        return;
    }

    // ウィンドウタイトルを「Fit to Comp Smart」に変更
    var win = new Window("palette", "Fit to Comp Smart", undefined);
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];

    var panel = win.add("panel", undefined, "方法選択");
    panel.orientation = "column";
    panel.alignChildren = ["left", "top"];

    var rb1 = panel.add("radiobutton", undefined, "方法1：スケールで合わせる（中央配置・画面覆う）");
    var rb2 = panel.add("radiobutton", undefined, "方法2：平面・シェイプの中身をコンポサイズにする");
    
    // 方法1をデフォルトにする
    rb1.value = true;

    var btn = win.add("button", undefined, "実行");

    // --- プロパティ取得用ショートカット ---
    function T(layer) { return layer.property("ADBE Transform Group"); }
    function P(layer) { return T(layer).property("ADBE Position"); }
    function S(layer) { return T(layer).property("ADBE Scale"); }
    function A(layer) { return T(layer).property("ADBE Anchor Point"); }

    // --- 平面/調整レイヤー判定 ---
    function isResizableSource(layer) {
        try {
            return layer.source && layer.source.mainSource && (layer.source.mainSource instanceof SolidSource);
        } catch (e) { return false; }
    }

    // --- 中央配置関数 ---
    function centerLayer(layer, compW, compH, time) {
        var rect = layer.sourceRectAtTime(time, false);
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;

        if (layer.threeDLayer) {
            var currP = P(layer).value;
            A(layer).setValue([centerX, centerY, 0]);
            P(layer).setValue([compW / 2, compH / 2, currP[2]]);
        } else {
            A(layer).setValue([centerX, centerY]);
            P(layer).setValue([compW / 2, compH / 2]);
        }
    }

    // --- シェイプ内の長方形・楕円サイズを再帰的に探して変更する関数 ---
    function findAndSetShapeSize(propParent, w, h) {
        var foundAndSet = false;
        
        for (var i = 1; i <= propParent.numProperties; i++) {
            var prop = propParent.property(i);
            
            // 長方形または楕円形のサイズプロパティを探す
            if (prop.matchName === "ADBE Vector Rect Size" || prop.matchName === "ADBE Vector Ellipse Size") {
                prop.setValue([w, h]);
                foundAndSet = true;
            }
            // グループなら中をさらに探す
            else if (prop.numProperties > 0) {
                if (findAndSetShapeSize(prop, w, h)) {
                    foundAndSet = true;
                }
            }
        }
        return foundAndSet;
    }

    btn.onClick = function () {
        var layers = comp.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("レイヤーを選択してください。");
            return;
        }

        app.beginUndoGroup("Fit to Comp Smart"); // Undo名も合わせました

        var compW = comp.width;
        var compH = comp.height;
        var now = comp.time;

        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (!(layer instanceof AVLayer) && !(layer instanceof ShapeLayer)) continue;

                // 共通：スケール合わせ用関数（フォールバック用）
                var fitScale = function() {
                    var rect = layer.sourceRectAtTime(now, false);
                    if (rect.width === 0 || rect.height === 0) return;

                    var sx = Math.ceil((compW / rect.width) * 100);
                    var sy = Math.ceil((compH / rect.height) * 100);

                    if (layer.threeDLayer) S(layer).setValue([sx, sy, 100]);
                    else S(layer).setValue([sx, sy]);
                    
                    centerLayer(layer, compW, compH, now);
                };

                // 方法1：すべてスケールで合わせる
                if (rb1.value) {
                    fitScale(); 
                    continue;
                }

                // 方法2：中身のサイズを変更する
                if (rb2.value) {
                    // A. 平面・調整レイヤー
                    if (isResizableSource(layer)) {
                        var src = layer.source;
                        src.width = compW;
                        src.height = compH;
                        src.pixelAspect = comp.pixelAspect;

                        if (layer.threeDLayer) S(layer).setValue([100, 100, 100]);
                        else S(layer).setValue([100, 100]);

                        centerLayer(layer, compW, compH, now);
                    } 
                    // B. シェイプレイヤー (長方形 or 楕円)
                    else if (layer instanceof ShapeLayer) {
                        var contents = layer.property("ADBE Root Vectors Group");
                        var isResized = findAndSetShapeSize(contents, compW, compH);

                        if (isResized) {
                            if (layer.threeDLayer) S(layer).setValue([100, 100, 100]);
                            else S(layer).setValue([100, 100]);
                            centerLayer(layer, compW, compH, now);
                        } else {
                            fitScale();
                        }
                    }
                    // C. その他
                    else {
                         fitScale();
                    }
                }
            }
        } catch (err) {
            alert("エラー: " + err.toString());
        }

        app.endUndoGroup();
    };

    win.center();
    win.show();
})();