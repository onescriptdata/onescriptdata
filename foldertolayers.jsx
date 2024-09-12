(function() {
    // Create UI
    var window = new Window("palette", "Import Images as Layers", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Folder selection
    var folderGroup = mainGroup.add("group");
    var folderButton = folderGroup.add("button", undefined, "Select Folder");
    var folderText = folderGroup.add("statictext", undefined, "No folder selected");
    folderText.preferredSize.width = 200;

    // Import options
    var importOptionsGroup = mainGroup.add("panel", undefined, "Import Options");
    importOptionsGroup.orientation = "column";
    importOptionsGroup.alignChildren = ["left", "top"];
    importOptionsGroup.spacing = 5;

    var limitCountCheck = importOptionsGroup.add("checkbox", undefined, "Limit number of images");
    var limitCountGroup = importOptionsGroup.add("group");
    limitCountGroup.add("statictext", undefined, "Max count:");
    var limitCountInput = limitCountGroup.add("edittext", undefined, "10");
    limitCountInput.characters = 5;
    limitCountGroup.enabled = false;

    // Size options
    var sizeOptionsGroup = mainGroup.add("panel", undefined, "Size Options");
    sizeOptionsGroup.orientation = "column";
    sizeOptionsGroup.alignChildren = ["left", "top"];
    sizeOptionsGroup.spacing = 5;

    var sizeOptionRadio = sizeOptionsGroup.add("radiobutton", undefined, "Keep original size");
    var fitCompRadio = sizeOptionsGroup.add("radiobutton", undefined, "Fit to composition");
    var customSizeRadio = sizeOptionsGroup.add("radiobutton", undefined, "Custom size");
    var autoFillSizeRadio = sizeOptionsGroup.add("radiobutton", undefined, "Auto-fill grid cells");
    sizeOptionRadio.value = true;

    var customSizeGroup = sizeOptionsGroup.add("group");
    customSizeGroup.add("statictext", undefined, "Width:");
    var customWidthInput = customSizeGroup.add("edittext", undefined, "100");
    customWidthInput.characters = 5;
    customSizeGroup.add("statictext", undefined, "Height:");
    var customHeightInput = customSizeGroup.add("edittext", undefined, "100");
    customHeightInput.characters = 5;
    customSizeGroup.enabled = false;

    // Position options
    var positionOptionsGroup = mainGroup.add("panel", undefined, "Position Options");
    positionOptionsGroup.orientation = "column";
    positionOptionsGroup.alignChildren = ["left", "top"];
    positionOptionsGroup.spacing = 5;

    var centerRadio = positionOptionsGroup.add("radiobutton", undefined, "Center");
    var randomPositionRadio = positionOptionsGroup.add("radiobutton", undefined, "Random Position");
    var gridRadio = positionOptionsGroup.add("radiobutton", undefined, "Grid");
    centerRadio.value = true;

    var gridGroup = positionOptionsGroup.add("group");
    gridGroup.orientation = "column";
    gridGroup.alignChildren = ["left", "top"];
    gridGroup.spacing = 5;

    var autoFillGridCheck = gridGroup.add("checkbox", undefined, "Auto-fill grid");
    
    var gridColumnsGroup = gridGroup.add("group");
    gridColumnsGroup.add("statictext", undefined, "Columns:");
    var gridColumnsInput = gridColumnsGroup.add("edittext", undefined, "5");
    gridColumnsInput.characters = 3;

    var gridRowsGroup = gridGroup.add("group");
    gridRowsGroup.add("statictext", undefined, "Rows:");
    var gridRowsInput = gridRowsGroup.add("edittext", undefined, "5");
    gridRowsInput.characters = 3;

    var gridSpacingGroup = gridGroup.add("group");
    gridSpacingGroup.add("statictext", undefined, "Spacing (px):");
    var gridSpacingInput = gridSpacingGroup.add("edittext", undefined, "10");
    gridSpacingInput.characters = 3;

    gridGroup.enabled = false;

    // Time options
    var timeOptionsGroup = mainGroup.add("panel", undefined, "Time Options");
    timeOptionsGroup.orientation = "column";
    timeOptionsGroup.alignChildren = ["left", "top"];
    timeOptionsGroup.spacing = 5;

    var allAtOnceRadio = timeOptionsGroup.add("radiobutton", undefined, "All at once");
    var sequentialRadio = timeOptionsGroup.add("radiobutton", undefined, "Sequential");
    allAtOnceRadio.value = true;

    var durationGroup = timeOptionsGroup.add("group");
    durationGroup.add("statictext", undefined, "Duration (frames):");
    var durationInput = durationGroup.add("edittext", undefined, "30");
    durationInput.characters = 5;
    durationGroup.enabled = false;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var importButton = buttonGroup.add("button", undefined, "Import Images");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Event listeners
    limitCountCheck.onClick = function() {
        limitCountGroup.enabled = limitCountCheck.value;
    };

    customSizeRadio.onClick = function() {
        customSizeGroup.enabled = customSizeRadio.value;
    };

    gridRadio.onClick = function() {
        gridGroup.enabled = gridRadio.value;
        autoFillSizeRadio.enabled = gridRadio.value;
    };

    autoFillGridCheck.onClick = function() {
        gridColumnsGroup.enabled = gridRowsGroup.enabled = !autoFillGridCheck.value;
    };

    sequentialRadio.onClick = function() {
        durationGroup.enabled = sequentialRadio.value;
    };

    folderButton.onClick = function() {
        var folder = Folder.selectDialog("Select a folder with images");
        if (folder) {
            folderText.text = folder.fsName;
        }
    };

    function calculateOptimalGrid(imageCount, aspectRatio) {
        var columns = Math.ceil(Math.sqrt(imageCount * aspectRatio));
        var rows = Math.ceil(imageCount / columns);
        return { columns: columns, rows: rows };
    }

    importButton.onClick = function() {
        app.beginUndoGroup("Import Images as Layers");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var folder = new Folder(folderText.text);
            if (!folder.exists) {
                throw new Error("Please select a valid folder.");
            }

            var imageFiles = folder.getFiles(function(file) {
                return file instanceof File && /\.(png|jpe?g|tiff?|gif)$/i.test(file.name);
            });

            if (imageFiles.length === 0) {
                throw new Error("No image files found in the selected folder.");
            }

            // Limit count if option is checked
            if (limitCountCheck.value) {
                var maxCount = parseInt(limitCountInput.text);
                imageFiles = imageFiles.slice(0, maxCount);
            }

            var gridSpacing = parseInt(gridSpacingInput.text);
            var duration = parseInt(durationInput.text);
            var currentTime = 0;

            if (gridRadio.value && autoFillGridCheck.value) {
                var aspectRatio = comp.width / comp.height;
                var optimalGrid = calculateOptimalGrid(imageFiles.length, aspectRatio);
                gridColumnsInput.text = optimalGrid.columns;
                gridRowsInput.text = optimalGrid.rows;
            }

            var gridColumns = parseInt(gridColumnsInput.text);
            var gridRows = parseInt(gridRowsInput.text);

            var cellWidth = (comp.width - (gridColumns - 1) * gridSpacing) / gridColumns;
            var cellHeight = (comp.height - (gridRows - 1) * gridSpacing) / gridRows;

            for (var i = 0; i < imageFiles.length; i++) {
                var newFootage = app.project.importFile(new ImportOptions(imageFiles[i]));
                var newLayer = comp.layers.add(newFootage);

                // Apply size option
                if (fitCompRadio.value) {
                    var widthRatio = comp.width / newLayer.source.width;
                    var heightRatio = comp.height / newLayer.source.height;
                    var scale = Math.min(widthRatio, heightRatio) * 100;
                    newLayer.property("Transform").property("Scale").setValue([scale, scale]);
                } else if (customSizeRadio.value) {
                    var customWidth = parseInt(customWidthInput.text);
                    var customHeight = parseInt(customHeightInput.text);
                    newLayer.property("Transform").property("Scale").setValue([
                        (customWidth / newLayer.source.width) * 100,
                        (customHeight / newLayer.source.height) * 100
                    ]);
                } else if (autoFillSizeRadio.value && gridRadio.value) {
                    var widthRatio = cellWidth / newLayer.source.width;
                    var heightRatio = cellHeight / newLayer.source.height;
                    var scale = Math.min(widthRatio, heightRatio) * 100;
                    newLayer.property("Transform").property("Scale").setValue([scale, scale]);
                }

                // Apply position option
                if (centerRadio.value) {
                    newLayer.property("Transform").property("Position").setValue([comp.width/2, comp.height/2]);
                } else if (randomPositionRadio.value) {
                    newLayer.property("Transform").property("Position").setValue([
                        Math.random() * comp.width,
                        Math.random() * comp.height
                    ]);
                } else if (gridRadio.value) {
                    var col = i % gridColumns;
                    var row = Math.floor(i / gridColumns) % gridRows;
                    newLayer.property("Transform").property("Position").setValue([
                        cellWidth * (col + 0.5) + col * gridSpacing,
                        cellHeight * (row + 0.5) + row * gridSpacing
                    ]);
                }

                // Apply time option
                if (sequentialRadio.value) {
                    newLayer.startTime = currentTime;
                    newLayer.outPoint = currentTime + duration / comp.frameRate;
                    currentTime = newLayer.outPoint;
                }
            }

            alert("Images imported successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    };

    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();