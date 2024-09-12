(function() {
    // Create UI
    var window = new Window("palette", "Remove Keyframes at Cursor", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Property checkboxes
    var propsPanel = mainGroup.add("panel", undefined, "Properties to Affect");
    propsPanel.orientation = "column";
    propsPanel.alignChildren = ["left", "top"];
    propsPanel.spacing = 5;

    var allPropsCheck = propsPanel.add("checkbox", undefined, "All Properties");
    var positionCheck = propsPanel.add("checkbox", undefined, "Position");
    var scaleCheck = propsPanel.add("checkbox", undefined, "Scale");
    var rotationCheck = propsPanel.add("checkbox", undefined, "Rotation");
    var opacityCheck = propsPanel.add("checkbox", undefined, "Opacity");

    // Time tolerance option
    var toleranceGroup = mainGroup.add("group");
    toleranceGroup.add("statictext", undefined, "Time Tolerance (frames):");
    var toleranceInput = toleranceGroup.add("edittext", undefined, "0");
    toleranceInput.characters = 5;

    // Remove empty properties option
    var removeEmptyCheck = mainGroup.add("checkbox", undefined, "Remove properties with no keyframes");

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var removeButton = buttonGroup.add("button", undefined, "Remove Keyframes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper function to check if a time is within tolerance
    function isTimeWithinTolerance(time1, time2, tolerance) {
        return Math.abs(time1 - time2) <= tolerance;
    }

    // Remove Keyframes Function
    function removeKeyframes() {
        app.beginUndoGroup("Remove Keyframes at Cursor");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var cursorTime = comp.time;
            var tolerance = parseFloat(toleranceInput.text) / comp.frameRate;

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                removeKeyframesFromLayer(layer, cursorTime, tolerance);
            }

            alert("Keyframes removed successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function removeKeyframesFromLayer(layer, cursorTime, tolerance) {
        var properties = [];

        if (allPropsCheck.value) {
            properties = layer.property("ADBE Transform Group").properties;
        } else {
            if (positionCheck.value) properties.push(layer.position);
            if (scaleCheck.value) properties.push(layer.scale);
            if (rotationCheck.value) properties.push(layer.rotation);
            if (opacityCheck.value) properties.push(layer.opacity);
        }

        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            if (prop.numKeys > 0) {
                for (var j = prop.numKeys; j > 0; j--) {
                    if (isTimeWithinTolerance(prop.keyTime(j), cursorTime, tolerance)) {
                        prop.removeKey(j);
                    }
                }

                if (removeEmptyCheck.value && prop.numKeys === 0) {
                    prop.expression = "";
                    prop.setValue(prop.value);
                }
            }
        }
    }

    // Event Listeners
    allPropsCheck.onClick = function() {
        var checked = allPropsCheck.value;
        positionCheck.enabled = !checked;
        scaleCheck.enabled = !checked;
        rotationCheck.enabled = !checked;
        opacityCheck.enabled = !checked;
    };

    // Button click events
    removeButton.onClick = removeKeyframes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();