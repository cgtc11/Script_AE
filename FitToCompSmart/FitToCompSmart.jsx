(function () {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("コンポジションをアクティブにしてください。");
        return;
    }

    // ウィンドウタイトル
    var win = new Window("palette", "Fit to Comp Smart v2", undefined);
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];

    var panel = win.add("panel", undefined, "方法選択");
    panel.orientation = "column";
    panel.alignChildren = ["left", "top"];

    var rb1 = panel.add("radiobutton", undefined, "方法1：スケールで合わせる（中央配置・画面覆う）");
    var rb2 = panel.add("radiobutton", undefined, "方法2：中身(ソース)をコンポサイズにする");
    
    // 方法2のオプション（インデントして配置）
    var grpOption = panel.add("group");
    grpOption.margins = [20, 0, 0, 0]; // インデント
    var chkNew = grpOption.add("checkbox", undefined, "新規平面を作成して置き換え (共有回避)");
    chkNew.helpTip = "チェックを入れると、元の平面ソースを変更せず、新しい平面を作成して置き換えます。\nチェックなしだと、元の平面のサイズを変更します（同じ平面を使っている全レイヤーに影響します）。";

    // 初期状態
    rb1.value = true;
    chkNew.value = false;
    chkNew.enabled = false; // 最初はRB1なので無効化

    // UI制御
    rb1.onClick = function() { chkNew.enabled = false; };
    rb2.onClick = function() { chkNew.enabled = true; };

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

        app.beginUndoGroup("Fit to Comp Smart");

        var compW = comp.width;
        var compH = comp.height;
        var now = comp.time;

        try {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                // AVLayer(平面含む) または ShapeLayer 以外はスキップ
                if (!(layer instanceof AVLayer) && !(layer instanceof ShapeLayer)) continue;

                // 共通：スケール合わせ用関数（フォールバック用）
                var fitScale = function() {
                    var rect = layer.sourceRectAtTime(now, false);
                    if (rect.width === 0 || rect.height === 0) return;

                    var sx = (compW / rect.width) * 100;
                    var sy = (compH / rect.height) * 100;

                    // 画面を覆うように大きい方に合わせるなら Math.max、収めるなら Math.min
                    // ここでは元のロジック「画面覆う」に準拠して別々に計算していますが、
                    // もしアスペクト比維持したい場合はロジック調整が必要。現在はFill(Stretch)気味の動作。
                    
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
                        
                        // ★ 新規作成して置き換え (チェックありの場合)
                        if (chkNew.value) {
                            var oldSrc = layer.source;
                            var newColor = [0.5, 0.5, 0.5];
                            var oldName = layer.name;
                            
                            // 元の色を取得
                            if (oldSrc.mainSource && oldSrc.mainSource.color) {
                                newColor = oldSrc.mainSource.color;
                            }

                            // 一時的に新規平面を作成してソースを取得
                            // 名前は現在のレイヤー名を引き継ぐ
                            var tempLayer = comp.layers.addSolid(newColor, oldName, compW, compH, comp.pixelAspect, comp.duration);
                            var newSrc = tempLayer.source;
                            tempLayer.remove(); // レイヤー自体は不要なので削除

                            // ソースを置き換え
                            layer.replaceSource(newSrc, false);
                        } 
                        // ★ 既存ソースをリサイズ (チェックなしの場合)
                        else {
                            var src = layer.source;
                            src.width = compW;
                            src.height = compH;
                            src.pixelAspect = comp.pixelAspect;
                        }

                        // スケールを100%にリセットして位置合わせ
                        if (layer.threeDLayer) S(layer).setValue([100, 100, 100]);
                        else S(layer).setValue([100, 100]);

                        centerLayer(layer, compW, compH, now);
                    } 
                    // B. シェイプレイヤー (長方形 or 楕円)
                    // ※シェイプはインスタンスごとの保持なので「新規作成」の概念は適用せず、常にパスサイズ変更を行う
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
                    // C. その他 (画像素材などリサイズできないもの)
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