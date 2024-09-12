// Function to create the UI
function createImageLayerUI() {
    var win = new Window("palette", "Import Images and Create Layers", undefined, {resizeable: true});
    win.orientation = "column";
    
    // Image Folder selection
    win.add("statictext", undefined, "Select Folder with Images:");
    var folderPathText = win.add("edittext", undefined, "");
    folderPathText.characters = 40;
    var browseButton = win.add("button", undefined, "Browse Folder...");
    
    // Browse button action
    browseButton.onClick = function() {
        var folder = Folder.selectDialog("Select the folder containing your images.");
        if (folder) {
            folderPathText.text = folder.fsName;
        }
    };
    
    // Minimum size slider
    win.add("statictext", undefined, "Minimum Size (percentage of original size):");
    var minSizeSlider = win.add("slider", undefined, 50, 1, 100);  // Slider for minimum size
    var minSizeText = win.add("edittext", undefined, "50");
    minSizeText.characters = 5;
    minSizeSlider.onChanging = function() {
        minSizeText.text = Math.round(minSizeSlider.value);
    };

    // Maximum size slider
    win.add("statictext", undefined, "Maximum Size (percentage of original size):");
    var maxSizeSlider = win.add("slider", undefined, 100, 50, 300);  // Slider for maximum size
    var maxSizeText = win.add("edittext", undefined, "100");
    maxSizeText.characters = 5;
    maxSizeSlider.onChanging = function() {
        maxSizeText.text = Math.round(maxSizeSlider.value);
    };

    // Create Layers button
    var createLayersButton = win.add("button", undefined, "Create Layers");

    // Create Layers button action
    createLayersButton.onClick = function() {
        var folderPath = folderPathText.text;
        var minSize = parseInt(minSizeText.text);
        var maxSize = parseInt(maxSizeText.text);

        if (folderPath === "") {
            alert("Please select a folder with images.");
            return;
        }

        if (isNaN(minSize) || isNaN(maxSize) || minSize < 1 || maxSize > 300 || minSize >= maxSize) {
            alert("Please enter valid minimum and maximum sizes.");
            return;
        }

        // Import the images and create layers
        createImageLayers(folderPath, minSize, maxSize);
    };

    win.center();
    win.show();
}

// Function to import images from a folder and create layers
function createImageLayers(folderPath, minSize, maxSize) {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    // Get the folder and image files
    var folder = new Folder(folderPath);
    var imageFiles = folder.getFiles(function(file) {
        return file instanceof File && (file.name.match(/\.(jpg|jpeg|png|tif|tiff|bmp)$/i));
    });

    if (imageFiles.length === 0) {
        alert("No image files found in the selected folder.");
        return;
    }

    // Start undo group
    app.beginUndoGroup("Create Image Layers");

    for (var i = 0; i < imageFiles.length; i++) {
        var imageFile = imageFiles[i];

        // Import the image
        var importOptions = new ImportOptions(imageFile);
        var imageItem = app.project.importFile(importOptions);

        // Add the image as a layer to the composition
        var layer = comp.layers.add(imageItem);

        // Randomly set the size of the image between the min and max percentage values
        var randomSize = minSize + Math.random() * (maxSize - minSize);
        layer.property("Scale").setValue([randomSize, randomSize]);

        // Position layers randomly within the composition bounds
        var compWidth = comp.width;
        var compHeight = comp.height;
        var randomX = Math.random() * compWidth;
        var randomY = Math.random() * compHeight;
        layer.property("Position").setValue([randomX, randomY]);
    }

    // End undo group
    app.endUndoGroup();
}

// Run the UI function
createImageLayerUI();
