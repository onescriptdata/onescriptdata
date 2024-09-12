(function() {
    // Create UI
    var window = new Window("palette", "Random Keyframes", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Property Type
    var propTypeGroup = mainGroup.add("group");
    propTypeGroup.add("statictext", undefined, "Property:");
    var propType = propTypeGroup.add("dropdownlist", undefined, ["Position", "Scale", "Rotation", "Opacity"]);
    propType.selection = 0;

    // Number of Keyframes
    var keyframesGroup = mainGroup.add("group");
    keyframesGroup.add("statictext", undefined, "Number of Keyframes:");
    var numKeyframes = keyframesGroup.add("edittext", undefined, "10");
    numKeyframes.characters = 5;

    // Time Range
    var timeRangeGroup = mainGroup.add("group");
    timeRangeGroup.add("statictext", undefined, "Time Range (seconds):");
    var timeRange = timeRangeGroup.add("edittext", undefined, "10");
    timeRange.characters = 5;

    // Value Range
    var valueRangeGroup = mainGroup.add("group");
    valueRangeGroup.add("statictext", undefined, "Value Range (min, max):");
    var minValue = valueRangeGroup.add("edittext", undefined, "0");
    minValue.characters = 5;
    var maxValue = valueRangeGroup.add("edittext", undefined, "100");
    maxValue.characters = 5;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var createButton = buttonGroup.add("button", undefined, "Create Keyframes");
    var removeButton = buttonGroup.add("button", undefined, "Remove Keyframes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Create Random Keyframes Function
    function createRandomKeyframes() {
        app.beginUndoGroup("Create Random Keyframes");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length !== 1) {
                throw new Error("Please select a single layer.");
            }

            var layer = selectedLayers[0];
            var property;
            switch (propType.selection.index) {
                case 0: property = layer.property("Position"); break;
                case 1: property = layer.property("Scale"); break;
                case 2: property = layer.property("Rotation"); break;
                case 3: property = layer.property("Opacity"); break;
            }

            if (!property) {
                throw new Error("Invalid property selected.");
            }

            var numKeys = parseInt(numKeyframes.text);
            var timeRangeVal = parseFloat(timeRange.text);
            var minVal = parseFloat(minValue.text);
            var maxVal = parseFloat(maxValue.text);

            if (isNaN(numKeys) || numKeys <= 0) {
                throw new Error("Please enter a valid number of keyframes.");
            }
            if (isNaN(timeRangeVal) || timeRangeVal <= 0) {
                throw new Error("Please enter a valid time range.");
            }
            if (isNaN(minVal) || isNaN(maxVal) || minVal >= maxVal) {
                throw new Error("Please enter a valid value range.");
            }

            for (var i = 0; i < numKeys; i++) {
                var time = Math.random() * timeRangeVal;
                var value;
                if (property.propertyValueType === PropertyValueType.TwoD) {
                    value = [Math.random() * (maxVal - minVal) + minVal, Math.random() * (maxVal - minVal) + minVal];
                } else if (property.propertyValueType === PropertyValueType.ThreeD) {
                    value = [Math.random() * (maxVal - minVal) + minVal, Math.random() * (maxVal - minVal) + minVal, Math.random() * (maxVal - minVal) + minVal];
                } else {
                    value = Math.random() * (maxVal - minVal) + minVal;
                }
                property.setValueAtTime(time, value);
            }

            alert("Random keyframes created successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Remove Keyframes Function
    function removeKeyframes() {
        app.beginUndoGroup("Remove Keyframes");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length !== 1) {
                throw new Error("Please select a single layer.");
            }

            var layer = selectedLayers[0];
            var property;
            switch (propType.selection.index) {
                case 0: property = layer.property("Position"); break;
                case 1: property = layer.property("Scale"); break;
                case 2: property = layer.property("Rotation"); break;
                case 3: property = layer.property("Opacity"); break;
            }

            if (!property) {
                throw new Error("Invalid property selected.");
            }

            if (property.numKeys > 0) {
                while (property.numKeys > 0) {
                    property.removeKey(1);
                }
            }

            alert("Keyframes removed successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    createButton.onClick = createRandomKeyframes;
    removeButton.onClick = removeKeyframes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();