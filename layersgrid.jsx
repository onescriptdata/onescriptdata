(function() {
    // Create UI
    var window = new Window("palette", "Arrange Layers in Grid", undefined);
    var gridGroup = window.add("group", undefined, "");
    gridGroup.add("statictext", undefined, "Rows:");
    var rowsInput = gridGroup.add("edittext", undefined, "2"); // Default rows
    rowsInput.characters = 3;

    gridGroup.add("statictext", undefined, "Columns:");
    var colsInput = gridGroup.add("edittext", undefined, "2"); // Default columns
    colsInput.characters = 3;

    gridGroup.add("statictext", undefined, "Clip Width:");
    var clipWidthInput = gridGroup.add("edittext", undefined, "1920"); // Default clip width
    clipWidthInput.characters = 5;

    gridGroup.add("statictext", undefined, "Clip Height:");
    var clipHeightInput = gridGroup.add("edittext", undefined, "1080"); // Default clip height
    clipHeightInput.characters = 5;

    var borderCheckbox = window.add("checkbox", undefined, "Add Borders");
    var numberCheckbox = window.add("checkbox", undefined, "Add Numbers");

    var arrangeButton = window.add("button", undefined, "Arrange");
    var closeButton = window.add("button", undefined, "Close");

    // Arrange layers function
    function arrangeLayersInGrid() {
        app.beginUndoGroup("Arrange Layers in Grid");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                throw new Error("Please select at least one layer.");
            }

            var rows = parseInt(rowsInput.text);
            var cols = parseInt(colsInput.text);
            var clipWidth = parseFloat(clipWidthInput.text);
            var clipHeight = parseFloat(clipHeightInput.text);

            if (isNaN(rows) || isNaN(cols) || isNaN(clipWidth) || isNaN(clipHeight) || rows < 1 || cols < 1) {
                throw new Error("Invalid input values.");
            }

            var totalLayers = Math.min(selectedLayers.length, rows * cols);
            var layerIndex = 0;

            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    if (layerIndex >= totalLayers) break;

                    var layer = selectedLayers[layerIndex];
                    var newPosition = [
                        (c * clipWidth) + (clipWidth / 2),
                        (r * clipHeight) + (clipHeight / 2)
                    ];

                    layer.position.setValue(newPosition);
                    layer.scale.setValue([100, 100]); // Reset scale to 100%

                    // Add border if checked
                    if (borderCheckbox.value) {
                        var borderLayer = comp.layers.addSolid([1, 1, 1], "Border " + (layerIndex + 1), clipWidth, clipHeight, 1);
                        borderLayer.position.setValue(newPosition);
                        borderLayer.moveBefore(layer); // Move border below the layer
                    }

                    // Add number if checked
                    if (numberCheckbox.value) {
                        var numberLayer = comp.layers.addText((layerIndex + 1).toString());
                        var numberTextProp = numberLayer.property("Source Text");
                        var numberTextDocument = numberTextProp.value;
                        numberTextDocument.fontSize = 50; // Set font size
                        numberTextDocument.fillColor = [0, 0, 0]; // Set text color
                        numberTextProp.setValue(numberTextDocument);
                        numberLayer.position.setValue(newPosition);
                    }

                    layerIndex++;
                }
            }

            alert("Layers arranged in grid successfully.");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    arrangeButton.onClick = arrangeLayersInGrid;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();