(function() {
    // Create UI
    var window = new Window("palette", "Extract Layers from Composition", undefined);
    var extractButton = window.add("button", undefined, "Extract Layers");
    var closeButton = window.add("button", undefined, "Close");

    // Extract layers function
    function extractLayersFromComp() {
        app.beginUndoGroup("Extract Layers from Composition");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length !== 1) {
                throw new Error("Please select a single composition layer.");
            }

            var selectedLayer = selectedLayers[0];
            if (!selectedLayer) {
                throw new Error("Selected layer is undefined.");
            }

            if (!selectedLayer.source) {
                throw new Error("Selected layer has no source.");
            }

            if (!(selectedLayer.source instanceof CompItem)) {
                throw new Error("The selected layer is not a composition.");
            }

            var nestedComp = selectedLayer.source;

            // Extract layers
            for (var i = 1; i <= nestedComp.numLayers; i++) {
                var layer = nestedComp.layer(i);
                if (!layer) {
                    alert("Warning: Layer " + i + " in nested comp is undefined. Skipping.");
                    continue;
                }

                var newLayer = layer.copyToComp(comp);
                if (!newLayer) {
                    continue;
                }
                
                // Adjust layer timing
                newLayer.startTime = selectedLayer.startTime + layer.startTime;
                newLayer.inPoint = selectedLayer.startTime + layer.inPoint;
                newLayer.outPoint = selectedLayer.startTime + layer.outPoint;

                // Apply nested comp's transformations
                applyNestedTransforms(newLayer, selectedLayer);
            }

            // Remove the nested composition layer
            selectedLayer.remove();

            alert("Layers extracted successfully.");
        } catch (error) {
            alert("Error: " + error.toString() + "\nLine: " + error.line);
        } finally {
            app.endUndoGroup();
        }
    }

    // Function to apply nested composition's transformations to extracted layer
    function applyNestedTransforms(layer, nestedLayer) {
        try {
            var transform = layer.transform;
            var nestedTransform = nestedLayer.transform;

            // Apply scale
            var originalScale = transform.scale.value;
            var nestedScale = nestedTransform.scale.value;
            transform.scale.setValue([
                (originalScale[0] * nestedScale[0]) / 100,
                (originalScale[1] * nestedScale[1]) / 100,
                (originalScale[2] * nestedScale[2]) / 100
            ]);

            // Apply rotation
            transform.rotation.setValue(transform.rotation.value + nestedTransform.rotation.value);

            // Apply position offset
            var originalPosition = transform.position.value;
            var nestedPosition = nestedTransform.position.value;
            transform.position.setValue([
                originalPosition[0] + nestedPosition[0],
                originalPosition[1] + nestedPosition[1],
                originalPosition[2] + nestedPosition[2]
            ]);

            // Apply opacity
            transform.opacity.setValue((transform.opacity.value * nestedTransform.opacity.value) / 100);
        } catch (error) {
            alert("Error in applyNestedTransforms: " + error.toString() + "\nLine: " + error.line);
        }
    }

    // Button click events
    extractButton.onClick = extractLayersFromComp;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();