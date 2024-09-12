(function() {
    // Create UI
    var window = new Window("palette", "Select Keyframes at Cursor", undefined);
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

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var selectButton = buttonGroup.add("button", undefined, "Select Keyframes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper function to check if a time is within tolerance
    function isTimeWithinTolerance(time1, time2, tolerance) {
        return Math.abs(time1 - time2) <= tolerance;
    }

    // Select Keyframes Function
    function selectKeyframes() {
        app.beginUndoGroup("Select Keyframes at Cursor");

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
                selectKeyframesInLayer(layer, cursorTime, tolerance);
            }

            alert("Keyframes selected successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function selectKeyframesInLayer(layer, cursorTime, tolerance) {
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
                // Deselect all keyframes for this property
                for (var k = 1; k <= prop.numKeys; k++) {
                    prop.setSelectedAtKey(k, false);
                }
                
                // Select keyframes at cursor
                for (var j = 1; j <= prop.numKeys; j++) {
                    if (isTimeWithinTolerance(prop.keyTime(j), cursorTime, tolerance)) {
                        prop.setSelectedAtKey(j, true);
                    }
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
    selectButton.onClick = selectKeyframes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();