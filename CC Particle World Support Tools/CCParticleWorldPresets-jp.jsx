/*
    CC Particle World Preset UI v1.0.0
    - 灰色項目も [UNREADABLE] として保存
*/

(function () {
    app.beginUndoGroup("CC Particle World 設定管理");

    // ===== 整数として扱う末端名 =====
    var integerProps = {
        "Color Map":1, "Transfer Mode":1, "Particle Type":1, "Type":1, "Mode":1,
        "Grid Subdivisions":1, "Motion Path Frames":1,
        "Grid Position":1, "Grid Axis":1,
        "Particle Visibility":1, "Render Animation":1, "Floor Action":1,
        "Max Particles":1, "Unseen Particles":1,
        "Rotation Axis":1
    };

    // ===== 保存先ファイル =====
    var scriptFile = new File($.fileName);
    var presetFile = new File(scriptFile.path + "/CCParticleWorldPresets.txt");

    function canWriteHere(f) {
        try {
            var t = new File(f.fsName + ".tmp");
            t.encoding = "UTF-8";
            if (t.open("w")) { t.write("\uFEFFtest"); t.close(); t.remove(); return true; }
        } catch(e) {}
        return false;
    }
    if (!canWriteHere(presetFile)) {
        presetFile = new File(Folder.desktop.fsName + "/CCParticleWorldPresets.txt");
    }

    // 無音アラート
    function silentAlert(msg) {
        var dlg = new Window("dialog", "通知");
        dlg.add("statictext", undefined, msg);
        dlg.add("button", undefined, "OK", {name:"ok"});
        dlg.show();
    }
    alert = silentAlert;

    var settingsStore = [];

    // ===== 火の粉（完全版プリセット） =====
    var defaultPreset = {
        "Grid & Guides": "[UNREADABLE]",
        "Position": 1,
        "Radius": 1,
        "Motion Path": 1,
        "Motion Path Frames": 30,
        "Grid": 1,
        "Grid Position": 1,
        "Grid Axis": 2,
        "Grid Subdivisions": 16,
        "Grid Size": 0.4,
        "Horizon": 1,
        "Axis Box": 1,
        "Birth Rate": 0.1,
        "Longevity (sec)": 3,
        "Producer": "[UNREADABLE]",
        "Position X": 0,
        "Position Y": 0.2,
        "Position Z": 0,
        "Radius X": 0.7,
        "Radius Y": 0,
        "Radius Z": 0.5,
        "Physics": "[UNREADABLE]",
        "Animation": 6,
        "Velocity": 0.3,
        "Inherit Velocity %": 0,
        "Gravity": -0.01,
        "Resistance": 0,
        "Extra": 0,
        "Extra Angle": 10,
        "Floor": "[UNREADABLE]",
        "Floor Position": 0.2,
        "Particle Visibility": 1,
        "Render Animation": 1,
        "Floor Action": 1,
        "Bounciness": 65,
        "Random Bounciness": 25,
        "Bounce Spread": 10,
        "Direction Axis": "[UNREADABLE]",
        "Axis X": 0,
        "Axis Y": -1,
        "Axis Z": 0,
        "Gravity Vector": "[UNREADABLE]",
        "Gravity X": 0,
        "Gravity Y": 1,
        "Gravity Z": 0,
        "Particle": "[UNREADABLE]",
        "Particle Type": 4,
        "Texture": "[UNREADABLE]",
        "Texture Layer": 0,
        "Scatter": 0,
        "Texture Time": 2,
        "Align To Direction": 0,
        "Rotation Speed": 180,
        "Initial Rotation": 360,
        "Rotation Axis": 4,
        "Birth Size": 0.1,
        "Death Size": 0,
        "Size Variation": 0,
        "Max Opacity": 100,
        "Opacity Map": "[UNREADABLE]",
        "Disabled": 0,
        "Color Map": 2,
        "Birth Color": [1,1,1,1],
        "Death Color": [1,0,0,1],
        "Custom Color Map": "[UNREADABLE]",
        "Color At Birth": [1,1,0.314,1],
        "Color At 25%": [1,0.627,0.157,1],
        "Color At 50%": [0.753,0.361,0.078,1],
        "Color At 75%": [0.502,0,0,1],
        "Color At Death": [0,0,0,1],
        "Volume Shade (approx.)": 0,
        "Transfer Mode": 1,
        "Extras": "[UNREADABLE]",
        "Effect Camera": "[UNREADABLE]",
        "Rotation X": 0,
        "Rotation Y": 0,
        "Rotation Z": 0,
        "FOV": 45,
        "Depth Cue": "[UNREADABLE]",
        "Type": 1,
        "Fog Color": [0.502,0.502,0.502,1],
        "Light Direction": "[UNREADABLE]",
        "Light X": -0.577,
        "Light Y": 0.577,
        "Light Z": 0.577,
        "Hold Particle Release": 0,
        "Composite With Original": 0,
        "Random Seed": 0,
        "コンポジットオプション/マスク": "[UNREADABLE]",
        "コンポジットオプション/エフェクトの不透明度": 100,
        "コンポジットオプション/GPU レンダリング": 1,
        "Extras/Effect Camera/Distance": 1,
        "Extras/Effect Camera/Type": 1,
        "Mode": 1,
        "=": "[UNREADABLE]"
    };

    // ===== ユーティリティ =====
    function lastSeg(name) { var s = (""+name).split("/"); return s[s.length-1]; }
    function round3(n) { return Math.round(n*1000)/1000; }

    function getValueSafe(prop) {
        try {
            var pv = prop.value;
            if (pv instanceof Array) {
                var out = [];
                for (var i=0;i<pv.length;i++) out.push(typeof pv[i]==="number" ? round3(pv[i]) : pv[i]);
                return out.join(",");
            }
            if (typeof pv === "number") return pv;
            if (typeof pv === "boolean") return pv ? 1 : 0;
            return pv;
        } catch(e) {
            return null;
        }
    }

    function normalizeForSave(val, tailName) {
        if (val === null || val === undefined) return null;
        if (typeof val === "string") return val;
        if (typeof val === "number") {
            if (integerProps.hasOwnProperty(tailName)) return Math.round(val);
            return round3(val);
        }
        if (typeof val === "boolean") return val ? 1 : 0;
        return val;
    }

    function parseValueForApply(str, tailName) {
        if (str === undefined) return str;
        if (typeof str !== "string") return str;
        if (str.indexOf(",") >= 0) {
            var arr = str.split(",");
            for (var i=0;i<arr.length;i++) arr[i] = parseFloat(arr[i]);
            return arr;
        }
        if (str === "true") return 1;
        if (str === "false") return 0;
        var n = parseFloat(str);
        if (!isNaN(n)) {
            if (integerProps.hasOwnProperty(tailName)) return Math.round(n);
            if (Math.floor(n) === n) return parseInt(n,10);
            return n;
        }
        return str;
    }

    // ===== Effect Camera グループ検出 =====
    function looksLikeEffectCameraGroup(grp) {
        var hasFOV=false, hasRotX=false, hasDist=false, hasType=false;
        try {
            for (var i=1;i<=grp.numProperties;i++) {
                var p = grp.property(i);
                if (!p || p.numProperties>0) continue;
                var nm = p.name;
                if (nm === "FOV") hasFOV=true;
                else if (nm === "Rotation X") hasRotX=true;
                else if (nm === "Distance") hasDist=true;
                else if (nm === "Type" || nm === "Mode") hasType=true;
            }
        } catch(e) {}
        var score = (hasFOV?1:0)+(hasRotX?1:0)+(hasDist?1:0)+(hasType?1:0);
        return score >= 2;
    }

    function findEffectCameraGroup(root) {
        var stack=[root];
        while (stack.length) {
            var g = stack.shift();
            if (!g || !g.numProperties) continue;
            if (looksLikeEffectCameraGroup(g)) return g;
            for (var i=1;i<=g.numProperties;i++) {
                var child = g.property(i);
                if (child && child.numProperties>0) stack.push(child);
            }
        }
        return null;
    }

    // ===== 再帰収集（灰色項目も保存） =====
    function collectAllProps(group, prefix, store) {
        for (var i=1; i<=group.numProperties; i++) {
            var p = group.property(i);
            if (!p) continue;
            var full = prefix ? (prefix + "/" + p.name) : p.name;

            if (p.numProperties > 0) {
                collectAllProps(p, full, store);
                continue;
            }

            var raw = getValueSafe(p);

            if (raw === null || raw === undefined) {
                store[full] = "[UNREADABLE]";
                continue;
            }

            var norm = normalizeForSave(raw, lastSeg(full));
            if (norm === null || norm === undefined) {
                store[full] = "[UNREADABLE]";
                continue;
            }

            store[full] = norm;
        }
    }

    // ===== シリアライズ / デシリアライズ =====
    function serializePreset(preset) {
        var parts = [];
        for (var k in preset) {
            var v = preset[k];
            if (v instanceof Array) v = v.join(",");
            parts.push(k + "=" + v);
        }
        return parts.join(";");
    }
    function deserializePreset(line) {
        var obj = {};
        if (!line) return obj;
        var parts = line.split(";");
        for (var i=0;i<parts.length;i++) {
            var kv = parts[i].split("=");
            if (kv.length !== 2) continue;
            var key = kv[0];
            var tail = lastSeg(key);
            obj[key] = parseValueForApply(kv[1], tail);
        }
        return obj;
    }

    // ===== UTF-8(BOM) I/O =====
    function writeUTF8BOM(file, text) {
        file.encoding = "UTF-8";
        if (!file.open("w")) throw new Error("open for write failed");
        file.write("\uFEFF"); file.write(text); file.close();
    }
    function readUTF8All(file) {
        file.encoding = "UTF-8";
        if (!file.open("r")) throw new Error("open for read failed");
        var content = file.read(); file.close();
        if (content && content.charAt(0) === "\uFEFF") content = content.substr(1);
        return content;
    }

    function saveToDisk() {
        try {
            var buf = "";
            for (var i=0; i<settingsStore.length; i++) {
                var s = settingsStore[i];
                buf += "[" + s.name + "]\n";
                buf += serializePreset(s.data) + "\n";
                buf += "---\n";
            }
            writeUTF8BOM(presetFile, buf);
        } catch(e) { alert("保存失敗: " + e.toString()); }
    }

    function loadFromDisk() {
        settingsStore = [];
        if (!presetFile.exists) return;
        try {
            var content = readUTF8All(presetFile);
            var lines = content.split(/\r?\n/);
            var name=null, dataStr="";
            for (var i=0;i<lines.length;i++) {
                var line = lines[i];
                if (!line) continue;
                if (line.indexOf("[") === 0 && line.charAt(line.length-1) === "]") {
                    name = line.substring(1, line.length-1);
                } else if (line === "---") {
                    if (name && dataStr!=="") settingsStore.push({name:name, data:deserializePreset(dataStr)});
                    name=null; dataStr="";
                } else {
                    dataStr = line;
                }
            }
        } catch(e) { alert("読み込みエラー: " + e.toString()); }
    }

    // ===== 適用 =====
    function findPropByPath(effect, path) {
        var parts = (""+path).split("/");
        var cur = effect;
        for (var i=0;i<parts.length;i++) {
            var found = null;
            for (var j=1; j<=cur.numProperties; j++) {
                var pr = cur.property(j);
                if (pr && pr.name === parts[i]) { found = pr; break; }
            }
            if (!found) return null;
            cur = found;
        }
        return cur;
    }

    function applyPreset(effect, preset) {
        var cam = findEffectCameraGroup(effect);
        if (cam) {
            var typeProp = cam.property("Type") || cam.property("Mode");
            var savedMode = null;
            if (preset.hasOwnProperty("Extras/Effect Camera/Type")) savedMode = preset["Extras/Effect Camera/Type"];
            if (preset.hasOwnProperty("Extras/Effect Camera/Mode")) savedMode = preset["Extras/Effect Camera/Mode"];
            if (preset.hasOwnProperty("Mode")) savedMode = preset["Mode"];
            if (savedMode !== null && savedMode !== undefined && typeProp) {
                try { typeProp.setValue(parseValueForApply(String(savedMode), "Type")); } catch(e) {}
            }

            var distKey = null;
            if (preset.hasOwnProperty("Extras/Effect Camera/Distance")) distKey = "Extras/Effect Camera/Distance";
            else if (preset.hasOwnProperty("Distance")) distKey = "Distance";
            if (distKey) {
                var distProp = cam.property("Distance");
                if (distProp) {
                    var v = preset[distKey];
                    if (v !== "[UNREADABLE]") {
                        try {
                            if (typeof v === "string" && v.indexOf(",")>=0) v = parseFloat(v);
                            distProp.setValue(v);
                        } catch(e) {}
                    }
                }
            }
        }

        for (var k in preset) {
            var val = preset[k];
            if (val === "[UNREADABLE]") continue;
            var tail = lastSeg(k);
            if (tail === "Distance" || tail === "Type" || tail === "Mode") continue;
            var prop = findPropByPath(effect, k);
            if (!prop) continue;
            if (typeof val === "string" && val.indexOf(",") >= 0) {
                var arr = val.split(","); for (var ai=0; ai<arr.length; ai++) arr[ai] = parseFloat(arr[ai]);
                val = arr;
            }
            try { prop.setValue(val); } catch(e) {}
        }
    }

    // ===== UI =====
    var win = new Window("palette","CC Particle World Preset",undefined);
    win.orientation = "column";

    var grp = win.add("group"); grp.orientation = "row";
    var btnApply  = grp.add("button", undefined, "設定適用");
    var btnSave   = grp.add("button", undefined, "現在の設定を記憶");
    var btnDelete = grp.add("button", undefined, "記憶削除");
    var btnRename = grp.add("button", undefined, "リネーム");

    var grp2 = win.add("group"); grp2.orientation = "row";
    var btnExport = grp2.add("button", undefined, "エクスポート(.TXT)");
    var btnImport = grp2.add("button", undefined, "インポート(.TXT)");

    var grp3 = win.add("group"); grp3.orientation = "row";
    var lblPath = grp3.add("statictext", undefined, "保存先: " + presetFile.fsName, {truncate:"middle"});
    lblPath.preferredSize.width = 420;
    var btnChangePath = grp3.add("button", undefined, "設定保存先");

    var listBox = win.add("listbox", [0,0,420,200], [], {multiselect:false});

    function refreshList() {
        listBox.removeAll();
        for (var i=0;i<settingsStore.length;i++) listBox.add("item", settingsStore[i].name);
        lblPath.text = "保存先: " + presetFile.fsName;
    }

    btnChangePath.onClick = function () {
        var f = Folder.selectDialog("プリセット保存先フォルダを選んでください");
        if (f) { presetFile = new File(f.fsName + "/CCParticleWorldPresets.txt"); saveToDisk(); refreshList(); }
    };

    // 実行処理（成功したら true）
    function applySetting(preset) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("コンポをアクティブにしてください"); return false; }
        if (comp.selectedLayers.length === 0) { alert("レイヤーを選択してください"); return false; }
        var layer = comp.selectedLayers[0];
        var fx = layer.Effects.property("CC Particle World");
        if (!fx) fx = layer.Effects.addProperty("CC Particle World");
        applyPreset(fx, preset);
        return true;
    }

    // 設定適用ボタン
    btnApply.onClick = function () {
        if (listBox.selection) {
            var idx = listBox.selection.index;
            if (applySetting(settingsStore[idx].data)) {
                alert(settingsStore[idx].name + " を適用しました！");
            }
        } else {
            if (applySetting(defaultPreset)) {
                alert("火の粉 を適用しました！");
            }
        }
    };

    // ダブルクリックで適用
    listBox.onDoubleClick = function () {
        if (listBox.selection) {
            var idx = listBox.selection.index;
            if (applySetting(settingsStore[idx].data)) {
                alert(settingsStore[idx].name + " を適用しました！");
            }
        }
    };

    // ===== その他ボタン =====
    btnSave.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("コンポをアクティブにしてください"); return; }
        if (comp.selectedLayers.length === 0) { alert("レイヤーを選択してください"); return; }
        var layer = comp.selectedLayers[0];
        var fx = layer.Effects.property("CC Particle World");
        if (!fx) { alert("CC Particle World が適用されていません"); return; }

        var name = prompt("この設定の名前を入力してください","記憶" + (settingsStore.length+1));
        if (!name) return;

        var preset = {};
        collectAllProps(fx, "", preset);

        var cam = findEffectCameraGroup(fx);
        if (cam) {
            var distProp = cam.property("Distance");
            if (distProp) {
                var d = getValueSafe(distProp);
                if (d !== null && d !== undefined) {
                    for (var k in preset) if (lastSeg(k)==="Distance" && k!=="Extras/Effect Camera/Distance") delete preset[k];
                    preset["Extras/Effect Camera/Distance"] = normalizeForSave(d, "Distance");
                }
            }
            var tProp = cam.property("Type") || cam.property("Mode");
            if (tProp) {
                var t = getValueSafe(tProp);
                if (t !== null && t !== undefined) {
                    var tn = normalizeForSave(t, "Type");
                    preset["Extras/Effect Camera/Type"] = tn;
                    preset["Mode"] = tn;
                }
            }
        }

        settingsStore.push({name:name, data:preset});
        saveToDisk(); refreshList();
    };

    btnDelete.onClick = function () {
        if (!listBox.selection) return;
        settingsStore.splice(listBox.selection.index, 1);
        saveToDisk(); refreshList();
    };

    btnRename.onClick = function () {
        if (!listBox.selection) return;
        var idx = listBox.selection.index;
        var newName = prompt("新しい名前を入力してください", settingsStore[idx].name);
        if (!newName) return;
        settingsStore[idx].name = newName;
        saveToDisk(); refreshList();
    };

    btnExport.onClick = function () {
        if (!listBox.selection) return;
        var idx = listBox.selection.index;
        var f = File.saveDialog("プリセットを書き出すファイル名を指定してください", "*.txt");
        if (!f) return;
        if (!/\.[^\.]+$/.test(f.name)) f = new File(f.fsName + ".txt");
        try {
            var buf = "[" + settingsStore[idx].name + "]\n" + serializePreset(settingsStore[idx].data) + "\n---\n";
            f.encoding = "UTF-8"; f.open("w"); f.write("\uFEFF"); f.write(buf); f.close();
            alert("エクスポート完了: " + f.fsName);
        } catch(e) { alert("エクスポート失敗: " + e.toString()); }
    };

    btnImport.onClick = function () {
        var f = File.openDialog("インポートするプリセットを選択", "*.txt");
        if (!f) return;
        try {
            f.encoding = "UTF-8"; f.open("r");
            var content = f.read(); f.close();
            if (content && content.charAt(0) === "\uFEFF") content = content.substr(1);
            var lines = content.split(/\r?\n/);
            var name=null, dataStr="";
            for (var i=0;i<lines.length;i++) {
                var line = lines[i];
                if (!line) continue;
                if (line.indexOf("[") === 0 && line.charAt(line.length-1) === "]") {
                    name = line.substring(1, line.length-1);
                } else if (line === "---") {
                    if (name && dataStr !== "") settingsStore.push({name:name, data:deserializePreset(dataStr)});
                    name=null; dataStr="";
                } else {
                    dataStr = line;
                }
            }
            saveToDisk(); refreshList();
            alert("インポート完了");
        } catch(e) { alert("インポート失敗: " + e.toString()); }
    };

    // ===== 起動時ロード =====
    loadFromDisk();
    if (settingsStore.length === 0) {
        settingsStore.push({name:"火の粉", data:defaultPreset});
        saveToDisk();
    }
    refreshList();

    win.center(); win.show();
    app.endUndoGroup();
})();
