(function() {
    // Create UI
    var window = new Window("palette", "Center Layers", undefined);
    var centerButton = window.add("button", undefined, "Center Selected Layers");
    var closeButton = window.add("button", undefined, "Close");

    // Center layers function
    function centerLayers() {
        app.beginUndoGroup("Center Layers");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                throw new Error("Please select at least one layer.");
            }

            // Calculate the center position of the composition
            var centerX = comp.width / 2;
            var centerY = comp.height / 2;

            // Set the position of each selected layer to the center
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                layer.position.setValue([centerX, centerY]);
            }

            alert("Selected layers have been centered.");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    centerButton.onClick = centerLayers;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();