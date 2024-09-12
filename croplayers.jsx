(function() {
    // Create UI
    var window = new Window("palette", "Auto Crop Composition", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Instructions
    mainGroup.add("statictext", undefined, "Select at least one layer in the composition.");

    // Center Layers Option
    var centerGroup = mainGroup.add("group");
    var centerCheckbox = centerGroup.add("checkbox", undefined, "Center layers in the new composition");

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var cropButton = buttonGroup.add("button", undefined, "Auto Crop Composition");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Auto Crop Function
    function autoCropComposition() {
        app.beginUndoGroup("Auto Crop Composition");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var minX = comp.width;
            var minY = comp.height;
            var maxX = 0;
            var maxY = 0;

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                if (layer instanceof AVLayer) {
                    var bounds = layer.sourceRectAtTime(comp.time, false);
                    var layerMinX = layer.position.value[0] + bounds.left;
                    var layerMinY = layer.position.value[1] + bounds.top;
                    var layerMaxX = layerMinX + bounds.width;
                    var layerMaxY = layerMinY + bounds.height;

                    if (layerMinX < minX) minX = layerMinX;
                    if (layerMinY < minY) minY = layerMinY;
                    if (layerMaxX > maxX) maxX = layerMaxX;
                    if (layerMaxY > maxY) maxY = layerMaxY;
                }
            }

            var newWidth = maxX - minX;
            var newHeight = maxY - minY;

            if (newWidth > 0 && newHeight > 0) {
                comp.width = newWidth;
                comp.height = newHeight;

                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    if (layer instanceof AVLayer) {
                        var newPosX = layer.position.value[0] - minX;
                        var newPosY = layer.position.value[1] - minY;
                        layer.position.setValue([newPosX, newPosY]);

                        if (centerCheckbox.value) {
                            var centerX = newWidth / 2;
                            var centerY = newHeight / 2;
                            layer.position.setValue([centerX, centerY]);
                        }
                    }
                }

                alert("Composition cropped successfully!");
            } else {
                throw new Error("Invalid dimensions calculated for the composition.");
            }
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    cropButton.onClick = autoCropComposition;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();