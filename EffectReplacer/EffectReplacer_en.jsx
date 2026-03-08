#target aftereffects
#targetengine "EffectReplacerEngine"

/*
Effect Replacer (Fixed ReferenceError)
- Replace target effect -> effect to transfer (replacement only)
- Copy template values (apply the settings of the effect to transfer to the new effect)
- Preserve order: move back to the original position with moveTo(). Since references may become invalid after moveTo, reacquire the reference before continuing
*/

(function EffectReplacer(thisObj) {
    try {

        function buildUI(thisObj) {
            var pal = (thisObj instanceof Panel)
                ? thisObj
                : new Window("palette", "Effect Replacer", undefined, { resizeable: true });

            pal.orientation = "column";
            pal.alignChildren = ["fill", "top"];

            // Shared template data (kept inside the UI)
            var template = {
                ok: false,
                effectMatchName: "",
                effectName: "",
                props: {} // key: property.matchName, value: snapshotValue
            };

            // -------------------------------
            // Scope
            // -------------------------------
            var grpScope = pal.add("panel", undefined, "Scope");
            grpScope.orientation = "column";
            grpScope.alignChildren = ["fill", "top"];

            var ddScope = grpScope.add("dropdownlist", undefined, [
                "Active comp only",
                "Selected comps (Project panel selection)",
                "All comps (project)"
            ]);
            ddScope.selection = 2; // Default: all comps

            // -------------------------------
            // Replace Settings
            // -------------------------------
            var grpFR = pal.add("panel", undefined, "Replace Settings (Replace Only)");
            grpFR.orientation = "column";
            grpFR.alignChildren = ["fill", "top"];

            // Target effect to replace
            var rowTarget = grpFR.add("group");
            rowTarget.orientation = "row";
            rowTarget.alignChildren = ["left", "center"];

            rowTarget.add("statictext", undefined, "Effect to replace:");
            var etTarget = rowTarget.add("edittext", undefined, "KNSW Unmult");
            etTarget.characters = 32;

            var btnPickTarget = rowTarget.add("button", undefined, "Get from selected effect");

            // Effect to transfer (newly added effect)
            var rowNew = grpFR.add("group");
            rowNew.orientation = "row";
            rowNew.alignChildren = ["left", "center"];

            rowNew.add("statictext", undefined, "Effect to transfer:");
            var etNew = rowNew.add("edittext", undefined, "Universe_Utilities_Unmult_Premi");
            etNew.characters = 32;

            var btnPickNew = rowNew.add("button", undefined, "Get from selected effect");

            // -------------------------------
            // Options
            // -------------------------------
            var grpOpt = pal.add("panel", undefined, "Options");
            grpOpt.orientation = "column";
            grpOpt.alignChildren = ["fill", "top"];

            var cbOnlySelectedLayers = grpOpt.add("checkbox", undefined, "If layers are selected, target only selected layers (within the comp)");
            cbOnlySelectedLayers.value = false;

            var cbMatchByNameAlso = grpOpt.add("checkbox", undefined, "Also match by display name for the effect to replace (when matchName is unknown)");
            cbMatchByNameAlso.value = true;

            // Name
            var cbKeepOldName = grpOpt.add("checkbox", undefined, "Use the original effect name after replacement (keep old name)");
            cbKeepOldName.value = false;

            // Preserve order
            var cbKeepEffectOrder = grpOpt.add("checkbox", undefined, "Preserve effect order (move back to original position)");
            cbKeepEffectOrder.value = true;

            // Copy template values
            var rowTpl = grpOpt.add("group");
            rowTpl.orientation = "row";
            rowTpl.alignChildren = ["left", "center"];

            var cbCopyTemplateValues = rowTpl.add("checkbox", undefined, "Copy template values (apply the settings of the effect to transfer)");
            cbCopyTemplateValues.value = false; // Default: OFF

            var btnCaptureTemplate = rowTpl.add("button", undefined, "Capture Template");
            var stTemplateStatus = grpOpt.add("statictext", undefined, "Template: Not captured");

            // -------------------------------
            // Run / Log
            // -------------------------------
            var rowRun = pal.add("group");
            rowRun.orientation = "row";
            rowRun.alignChildren = ["fill", "center"];

            var btnRun = rowRun.add("button", undefined, "Run");
            var btnClear = rowRun.add("button", undefined, "Clear Log");

            var log = pal.add("edittext", undefined, "", { multiline: true, scrolling: true });
            log.preferredSize.height = 260;

            function logLine(s) {
                try {
                    log.text += s + "\n";
                    try { log.active = true; } catch (e0) {}
                    try { log.selection = log.text.length; } catch (e1) {}
                } catch (e) {}
            }

            function getActiveComp() {
                var item = app.project ? app.project.activeItem : null;
                if (item && (item instanceof CompItem)) return item;
                return null;
            }

            function getSelectedComps() {
                var out = [];
                if (!app.project) return out;
                var sel = app.project.selection;
                if (!sel || sel.length === 0) return out;
                for (var i = 0; i < sel.length; i++) {
                    if (sel[i] instanceof CompItem) out.push(sel[i]);
                }
                return out;
            }

            function getAllComps() {
                var out = [];
                if (!app.project) return out;
                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (it instanceof CompItem) out.push(it);
                }
                return out;
            }

            function tryGetSelectedEffectInComp(comp) {
                if (!comp) return null;
                if (!comp.selectedLayers || comp.selectedLayers.length === 0) return null;

                for (var li = 0; li < comp.selectedLayers.length; li++) {
                    var layer = comp.selectedLayers[li];
                    var props = layer.selectedProperties;
                    if (!props || props.length === 0) continue;

                    for (var pi = 0; pi < props.length; pi++) {
                        var p = props[pi];
                        var cur = p;
                        while (cur && cur.parentProperty) {
                            if (cur.parentProperty && cur.parentProperty.matchName === "ADBE Effect Parade") {
                                try {
                                    return { name: cur.name, matchName: cur.matchName, effect: cur };
                                } catch (e0) {}
                            }
                            cur = cur.parentProperty;
                        }
                    }
                }
                return null;
            }

            function snapshotEffectValues(effectGroup) {
                var out = { props: {}, count: 0 };
                function walk(pg) {
                    if (!pg || !pg.numProperties) return;
                    for (var i = 1; i <= pg.numProperties; i++) {
                        var pr = null;
                        try { pr = pg.property(i); } catch (e0) { pr = null; }
                        if (!pr) continue;
                        var canSet = false;
                        try { canSet = (typeof pr.setValue === "function"); } catch (e1) { canSet = false; }
                        if (canSet) {
                            var mn = "";
                            try { mn = pr.matchName; } catch (e2) { mn = ""; }
                            if (mn && mn.length > 0) {
                                try {
                                    var v = null;
                                    try { v = pr.valueAtTime(0, false); }
                                    catch (eVT) { v = pr.value; }
                                    out.props[mn] = v;
                                    out.count++;
                                } catch (e3) {}
                            }
                        }
                        var hasChild = false;
                        try { hasChild = (pr.numProperties && pr.numProperties > 0); } catch (e4) { hasChild = false; }
                        if (hasChild) walk(pr);
                    }
                }
                walk(effectGroup);
                return out;
            }

            function applyTemplateValues(newEffectGroup, templateProps, logPrefix) {
                var applied = 0;
                var skipped = 0;
                function walkApply(pg) {
                    if (!pg || !pg.numProperties) return;
                    for (var i = 1; i <= pg.numProperties; i++) {
                        var pr = null;
                        try { pr = pg.property(i); } catch (e0) { pr = null; }
                        if (!pr) continue;
                        var canSet = false;
                        try { canSet = (typeof pr.setValue === "function"); } catch (e1) { canSet = false; }
                        if (canSet) {
                            var mn = "";
                            try { mn = pr.matchName; } catch (e2) { mn = ""; }
                            if (mn && templateProps.hasOwnProperty(mn)) {
                                try {
                                    pr.setValue(templateProps[mn]);
                                    applied++;
                                } catch (e3) {
                                    skipped++;
                                    if (logPrefix) logLine(logPrefix + " [Value copy failed] " + mn + " err=" + e3.toString());
                                }
                            }
                        }
                        var hasChild = false;
                        try { hasChild = (pr.numProperties && pr.numProperties > 0); } catch (e4) { hasChild = false; }
                        if (hasChild) walkApply(pr);
                    }
                }
                walkApply(newEffectGroup);
                return { applied: applied, skipped: skipped };
            }

            function moveAndReacquireEffect(parade, newEff, desiredIndex, expectedMatchName, compName, layerName) {
                if (!newEff) return { eff: null, moved: false, reacquired: false };
                try {
                    if (typeof newEff.moveTo === "function") {
                        newEff.moveTo(desiredIndex);
                        var cand = parade.property(desiredIndex);
                        if (cand) {
                            return { eff: cand, moved: true, reacquired: true };
                        }
                    }
                } catch (eMove) {
                    logLine("[moveTo failed] layer=" + layerName + " err=" + eMove.toString());
                }
                return { eff: newEff, moved: false, reacquired: false };
            }

            function replaceEffectsInComp(comp, targetKey, newMatchName, onlySelectedLayers, matchByNameAlso, keepOldName, keepOrder, doCopyTemplate) {
                var stat = {
                    comps: 0, layersScanned: 0, effectsScanned: 0, replaced: 0, failedAdds: 0,
                    templateAppliedCount: 0, orderFixedCount: 0
                };
                if (!comp) return stat;
                stat.comps++;
                var layers = comp.layers;
                var targetLayers = [];
                if (onlySelectedLayers && comp.selectedLayers && comp.selectedLayers.length > 0) {
                    for (var i = 0; i < comp.selectedLayers.length; i++) targetLayers.push(comp.selectedLayers[i]);
                } else {
                    for (var l = 1; l <= layers.length; l++) targetLayers.push(layers[l]);
                }

                for (var li = 0; li < targetLayers.length; li++) {
                    var layer = targetLayers[li];
                    if (!layer) continue;
                    stat.layersScanned++;
                    var parade = layer.property("ADBE Effect Parade");
                    if (!parade) continue;
                    var toReplace = [];
                    for (var ei = 1; ei <= parade.numProperties; ei++) {
                        var eff = parade.property(ei);
                        if (!eff) continue;
                        stat.effectsScanned++;
                        var isMatch = false;
                        try { if (eff.matchName === targetKey) isMatch = true; } catch (e0) {}
                        if (!isMatch && matchByNameAlso) {
                            try { if (eff.name === targetKey) isMatch = true; } catch (e1) {}
                        }
                        if (isMatch) toReplace.push(ei);
                    }
                    for (var r = toReplace.length - 1; r >= 0; r--) {
                        var idx = toReplace[r];
                        var oldEff = parade.property(idx);
                        var oldName = oldEff.name;
                        var oldEnabled = oldEff.enabled;
                        try { oldEff.remove(); } catch (eRem) { continue; }

                        var newEff = null;
                        try { newEff = parade.addProperty(newMatchName); } catch (eAdd) {
                            stat.failedAdds++;
                            continue;
                        }
                        if (newEff) {
                            newEff.enabled = oldEnabled;
                            if (keepOrder) {
                                var mr = moveAndReacquireEffect(parade, newEff, idx, newMatchName, comp.name, layer.name);
                                if (mr.moved) stat.orderFixedCount++;
                                newEff = mr.eff;
                            }
                            if (keepOldName && oldName) {
                                try { newEff.name = oldName; } catch (e5) {}
                            }
                            if (doCopyTemplate && template.ok && template.effectMatchName === newMatchName) {
                                var res = applyTemplateValues(newEff, template.props, null);
                                stat.templateAppliedCount += res.applied;
                            }
                            stat.replaced++;
                        }
                    }
                }
                return stat;
            }

            function runReplace() {
                var targetKey = etTarget.text;
                var newKey = etNew.text;
                if (!targetKey || !newKey) return;

                var doCopyTemplate = cbCopyTemplateValues.value;
                var keepOrder = cbKeepEffectOrder.value;

                var scopeIndex = ddScope.selection ? ddScope.selection.index : 0;
                var comps = [];
                if (scopeIndex === 0) {
                    var ac = getActiveComp();
                    if (ac) comps = [ac];
                } else if (scopeIndex === 1) {
                    comps = getSelectedComps();
                } else {
                    comps = getAllComps();
                }

                logLine("---- Run ----");
                app.beginUndoGroup("Effect Replace");

                var total = {
                    comps: 0, replaced: 0, orderFixedCount: 0
                };

                for (var i = 0; i < comps.length; i++) {
                    var st = replaceEffectsInComp(
                        comps[i], targetKey, newKey, cbOnlySelectedLayers.value, cbMatchByNameAlso.value,
                        cbKeepOldName.value, keepOrder, doCopyTemplate
                    );
                    total.comps += st.comps;
                    total.replaced += st.replaced;
                    total.orderFixedCount += st.orderFixedCount;
                }

                app.endUndoGroup();

                logLine("---- Result ----");
                logLine("Replaced: " + total.replaced);
                if (keepOrder) {
                    logLine("Preserve order: Done");
                }
            }

            btnPickTarget.onClick = function () {
                var info = tryGetSelectedEffectInComp(getActiveComp());
                if (info) etTarget.text = info.matchName || info.name;
            };

            btnPickNew.onClick = function () {
                var info = tryGetSelectedEffectInComp(getActiveComp());
                if (info) etNew.text = info.matchName;
            };

            btnCaptureTemplate.onClick = function () {
                var info = tryGetSelectedEffectInComp(getActiveComp());
                if (!info) return;
                var snap = snapshotEffectValues(info.effect);
                template.ok = true;
                template.effectMatchName = info.matchName;
                template.effectName = info.name;
                template.props = snap.props;
                stTemplateStatus.text = "Template: " + template.effectName + " / props=" + snap.count;
            };

            btnRun.onClick = function () {
                try { runReplace(); } catch (eRun) { alert(eRun.toString()); }
            };

            btnClear.onClick = function () { log.text = ""; };

            pal.onResizing = pal.onResize = function () {
                try { this.layout.resize(); } catch (e) {}
            };

            logLine("UI started: Default values have been set.");
            return pal;
        }

        var pal = buildUI(thisObj);
        if (pal instanceof Window) {
            pal.center();
            pal.show();
        }

    } catch (eTop) {
        alert("Startup error:\n" + eTop.toString());
    }
})(this);