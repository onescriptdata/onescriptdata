(function() {
    // Create UI
    var window = new Window("palette", "Add Fades at Cursor", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Fade Duration
    var durationGroup = mainGroup.add("group");
    durationGroup.add("statictext", undefined, "Fade Duration (frames):");
    var durationInput = durationGroup.add("edittext", undefined, "15");
    durationInput.characters = 5;

    // Time Tolerance
    var toleranceGroup = mainGroup.add("group");
    toleranceGroup.add("statictext", undefined, "Time Tolerance (frames):");
    var toleranceInput = toleranceGroup.add("edittext", undefined, "0");
    toleranceInput.characters = 5;

    // Fade Type
    var fadeTypeGroup = mainGroup.add("panel", undefined, "Fade Type");
    fadeTypeGroup.orientation = "column";
    var opacityRadio = fadeTypeGroup.add("radiobutton", undefined, "Opacity");
    var transformRadio = fadeTypeGroup.add("radiobutton", undefined, "Transform (Scale)");
    opacityRadio.value = true;

    // Fade Direction
    var fadeDirectionGroup = mainGroup.add("panel", undefined, "Fade Direction");
    fadeDirectionGroup.orientation = "column";
    var fadeInRadio = fadeDirectionGroup.add("radiobutton", undefined, "Fade In");
    var fadeOutRadio = fadeDirectionGroup.add("radiobutton", undefined, "Fade Out");
    fadeInRadio.value = true;

    // Ease Options
    var easeOptionsGroup = mainGroup.add("panel", undefined, "Ease Options");
    easeOptionsGroup.orientation = "column";
    var easeCheck = easeOptionsGroup.add("checkbox", undefined, "Apply Easing");
    easeCheck.value = true;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var applyButton = buttonGroup.add("button", undefined, "Apply Fades");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Apply Fades Function
    function applyFades() {
        app.beginUndoGroup("Apply Fades at Cursor");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var fadeDuration = parseInt(durationInput.text) / comp.frameRate;
            var timeTolerance = parseInt(toleranceInput.text) / comp.frameRate;
            var useOpacity = opacityRadio.value;
            var fadeIn = fadeInRadio.value;

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var randomOffset = (Math.random() * 2 - 1) * timeTolerance;
                var fadeTime = comp.time + randomOffset;
                addFade(layer, fadeTime, fadeDuration, useOpacity, fadeIn);
            }

            alert("Fades applied successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addFade(layer, fadeTime, duration, useOpacity, fadeIn) {
        var startTime, endTime;
        if (fadeIn) {
            startTime = fadeTime;
            endTime = fadeTime + duration;
        } else {
            startTime = fadeTime - duration;
            endTime = fadeTime;
        }

        if (useOpacity) {
            layer.opacity.setValueAtTime(startTime, fadeIn ? 0 : 100);
            layer.opacity.setValueAtTime(endTime, fadeIn ? 100 : 0);
            if (easeCheck.value) {
                var ease = new KeyframeEase(0, 33);
                layer.opacity.setTemporalEaseAtKey(fadeIn ? 2 : 1, [ease]);
            }
        } else {
            layer.scale.setValueAtTime(startTime, fadeIn ? [0, 0] : [100, 100]);
            layer.scale.setValueAtTime(endTime, fadeIn ? [100, 100] : [0, 0]);
            if (easeCheck.value) {
                var ease = new KeyframeEase(0, 33);
                layer.scale.setTemporalEaseAtKey(fadeIn ? 2 : 1, [ease, ease]);
            }
        }
    }

    // Button click events
    applyButton.onClick = applyFades;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();