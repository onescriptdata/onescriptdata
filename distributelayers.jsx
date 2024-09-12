(function() {
    // Create UI
    var window = new Window("palette", "Distribute Layers", undefined);
    var spacingGroup = window.add("group", undefined, "");
    spacingGroup.add("statictext", undefined, "Spacing (px):");
    var spacingInput = spacingGroup.add("edittext", undefined, "50"); // Default spacing value
    spacingInput.characters = 5;

    var distributeButton = window.add("button", undefined, "Distribute");
    var closeButton = window.add("button", undefined, "Close");

    // Distribute layers function
    function distributeLayers() {
        app.beginUndoGroup("Distribute Layers");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 2) {
                throw new Error("Please select at least two layers.");
            }

            var spacing = parseFloat(spacingInput.text);
            if (isNaN(spacing)) {
                throw new Error("Invalid spacing value.");
            }

            // Calculate the total width of the selected layers
            var totalWidth = (selectedLayers.length - 1) * spacing;

            // Calculate the starting position
            var startX = selectedLayers[0].position.value[0] - (totalWidth / 2);

            // Distribute layers
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var newPosition = [startX + (i * spacing), layer.position.value[1]];
                layer.position.setValue(newPosition);
            }

            alert("Layers distributed with " + spacing + " pixels spacing.");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    distributeButton.onClick = distributeLayers;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();