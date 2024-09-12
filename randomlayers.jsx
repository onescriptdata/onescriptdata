// Function to create the UI
function createLayerUI() {
    var win = new Window("palette", "Create Random Sized Layers", undefined, {resizeable: true});
    win.orientation = "column";
    
    // Number of layers
    win.add("statictext", undefined, "Number of Layers:");
    var numLayersSlider = win.add("slider", undefined, 5, 1, 100);  // Slider for number of layers
    var numLayersText = win.add("edittext", undefined, "5");
    numLayersText.characters = 5;
    numLayersSlider.onChanging = function() {
        numLayersText.text = Math.round(numLayersSlider.value);
    };

    // Minimum size
    win.add("statictext", undefined, "Minimum Layer Size (px):");
    var minSizeInput = win.add("edittext", undefined, "50");
    minSizeInput.characters = 5;

    // Maximum size
    win.add("statictext", undefined, "Maximum Layer Size (px):");
    var maxSizeInput = win.add("edittext", undefined, "200");
    maxSizeInput.characters = 5;

    // Create layers button
    var createButton = win.add("button", undefined, "Create Layers");

    // Button click event
    createButton.onClick = function() {
        var numLayers = parseInt(numLayersText.text);
        var minSize = parseInt(minSizeInput.text);
        var maxSize = parseInt(maxSizeInput.text);

        if (isNaN(numLayers) || isNaN(minSize) || isNaN(maxSize)) {
            alert("Please enter valid numbers for all fields.");
            return;
        }
        
        createRandomSizedLayers(numLayers, minSize, maxSize);
    };

    win.center();
    win.show();
}

// Function to create random sized layers
function createRandomSizedLayers(numLayers, minSize, maxSize) {
    // Get the active composition
    var comp = app.project.activeItem;

    // Check if there is an active composition
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    // Start undo group
    app.beginUndoGroup("Create Random Sized Layers");

    for (var i = 0; i < numLayers; i++) {
        // Generate random width and height between minSize and maxSize
        var width = Math.round(minSize + Math.random() * (maxSize - minSize));
        var height = Math.round(minSize + Math.random() * (maxSize - minSize));

        // Create a random color for the layer
        var randomColor = [Math.random(), Math.random(), Math.random()];

        // Create the solid layer
        var newLayer = comp.layers.addSolid(randomColor, "Layer " + (i + 1), width, height, 1);

        // Position the layer randomly within the composition's boundaries
        var randomX = Math.random() * (comp.width - width);
        var randomY = Math.random() * (comp.height - height);
        newLayer.position.setValue([randomX + width / 2, randomY + height / 2]);
    }

    // End undo group
    app.endUndoGroup();
}

// Run the UI function
createLayerUI();
