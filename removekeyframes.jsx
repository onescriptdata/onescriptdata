(function() {
    // Create UI
    var window = new Window("palette", "Remove Keyframes", undefined);
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

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var removeButton = buttonGroup.add("button", undefined, "Remove Keyframes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Remove Keyframes Function
    function removeKeyframes() {
        app.beginUndoGroup("Remove Keyframes");
        
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
                var property;
                switch (propType.selection.index) {
                    case 0: property = layer.property("Position"); break;
                    case 1: property = layer.property("Scale"); break;
                    case 2: property = layer.property("Rotation"); break;
                    case 3: property = layer.property("Opacity"); break;
                }
                if (property && property.numKeys > 0) {
                    while (property.numKeys > 0) {
                        property.removeKey(1);
                    }
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
    removeButton.onClick = removeKeyframes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();