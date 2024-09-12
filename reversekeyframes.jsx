(function() {
    // Create UI
    var window = new Window("palette", "Reverse Keyframes", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Property checkboxes
    var propsPanel = mainGroup.add("panel", undefined, "Properties to Reverse");
    propsPanel.orientation = "column";
    propsPanel.alignChildren = ["left", "top"];
    propsPanel.spacing = 5;

    var positionCheck = propsPanel.add("checkbox", undefined, "Position");
    var scaleCheck = propsPanel.add("checkbox", undefined, "Scale");
    var rotationCheck = propsPanel.add("checkbox", undefined, "Rotation");
    var opacityCheck = propsPanel.add("checkbox", undefined, "Opacity");

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var reverseButton = buttonGroup.add("button", undefined, "Reverse Keyframes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Reverse Keyframes Function
    function reverseKeyframes() {
        app.beginUndoGroup("Reverse Keyframes");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];

                if (positionCheck.value) reverseProperty(layer.position);
                if (scaleCheck.value) reverseProperty(layer.scale);
                if (rotationCheck.value) reverseProperty(layer.rotation);
                if (opacityCheck.value) reverseProperty(layer.opacity);
            }

            alert("Keyframes reversed successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function reverseProperty(prop) {
        if (prop.numKeys > 1) {
            var keyTimes = [];
            var keyValues = [];

            // Store original keyframe times and values
            for (var i = 1; i <= prop.numKeys; i++) {
                keyTimes.push(prop.keyTime(i));
                keyValues.push(prop.keyValue(i));
            }

            // Remove all existing keyframes
            while (prop.numKeys > 0) {
                prop.removeKey(1);
            }

            // Add reversed keyframes
            var lastKeyTime = keyTimes[keyTimes.length - 1];
            for (var i = 0; i < keyTimes.length; i++) {
                var newTime = lastKeyTime - (keyTimes[i] - keyTimes[0]);
                prop.setValueAtTime(newTime, keyValues[keyTimes.length - 1 - i]);
            }
        }
    }

    // Button click events
    reverseButton.onClick = reverseKeyframes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();