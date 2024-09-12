(function createOrganicImageMosaic() {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var allLayers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        allLayers.push(comp.layer(i));
    }

    if (allLayers.length < 2) {
        alert("Please ensure your composition has at least 2 layers: 1 for the base image and 1 or more for mosaic tiles.");
        return;
    }

    // UI
    var dialog = new Window("dialog", "Create Organic Image Mosaic");
    dialog.orientation = "column";
    dialog.alignChildren = ["center", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    var baseImageGroup = dialog.add("group");
    baseImageGroup.add("statictext", undefined, "Base Image Layer:");
    var baseImageDropdown = baseImageGroup.add("dropdownlist", undefined, allLayers.map(function(layer) { return layer.name; }));
    baseImageDropdown.selection = 0;

    var tileCountGroup = dialog.add("group");
    tileCountGroup.add("statictext", undefined, "Approximate Tile Count:");
    var tileCountInput = tileCountGroup.add("edittext", undefined, "500");
    tileCountInput.characters = 5;

    var colorMatchCheck = dialog.add("checkbox", undefined, "Match Colors");
    colorMatchCheck.value = true;

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");

    var result = false;
    okButton.onClick = function() {
        result = true;
        dialog.close();
    };
    cancelButton.onClick = function() {
        dialog.close();
    };
    dialog.show();

    if (!result) return;

    var baseImageLayer = allLayers[baseImageDropdown.selection.index];
    var tileLayers = allLayers.filter(function(layer) { return layer !== baseImageLayer; });
    var tileCount = parseInt(tileCountInput.text);
    var matchColors = colorMatchCheck.value;

    if (tileLayers.length === 0) {
        alert("There must be at least one layer other than the base image to create the mosaic.");
        return;
    }

    app.beginUndoGroup("Create Organic Image Mosaic");

    // Create a new null object to hold the mosaic
    var mosaicLayer = comp.layers.addNull();
    mosaicLayer.name = "Mosaic of " + baseImageLayer.name;
    mosaicLayer.moveBefore(baseImageLayer);

    // Match mosaic layer properties to base image layer
    mosaicLayer.property("Position").setValue(baseImageLayer.property("Position").value);
    mosaicLayer.property("Scale").setValue(baseImageLayer.property("Scale").value);
    mosaicLayer.property("Rotation").setValue(baseImageLayer.property("Rotation").value);

    var baseWidth = baseImageLayer.sourceRectAtTime(0, false).width;
    var baseHeight = baseImageLayer.sourceRectAtTime(0, false).height;

    // Create a point control effect on the mosaic layer for color sampling
    var samplePointEffect = mosaicLayer.property("Effects").addProperty("ADBE Point Control");
    samplePointEffect.name = "Color Sample Point";

    for (var i = 0; i < tileCount; i++) {
        var xPos = (Math.random() - 0.5) * baseWidth;
        var yPos = (Math.random() - 0.5) * baseHeight;
        var samplePoint = [(xPos / baseWidth) + 0.5, (yPos / baseHeight) + 0.5];
        
        var sourceLayer = tileLayers[Math.floor(Math.random() * tileLayers.length)];
        var layer = comp.layers.add(sourceLayer.source);
        layer.parent = mosaicLayer;
        layer.property("Position").setValue([xPos, yPos]);

        var scale = Math.random() * 50 + 25; // Random scale between 25% and 75%
        layer.property("Scale").setValue([scale, scale]);

        layer.property("Rotation").setValue(Math.random() * 360);

        if (matchColors) {
            var effect = layer.property("Effects").addProperty("ADBE Tint");
            effect.property("Map Black To").setValue([0, 0, 0]);
            samplePointEffect.property("Point").setValue(samplePoint);
            
            var expression = "var baseLayer = thisComp.layer('" + baseImageLayer.name + "');\n" +
                             "var samplePoint = thisComp.layer('" + mosaicLayer.name + "').effect('Color Sample Point')('Point');\n" +
                             "baseLayer.sampleImage(samplePoint, [1, 1], true)";
            
            effect.property("Map White To").expression = expression;
            effect.property("Amount to Tint").setValue(100);
        }
    }

    // Add a mask to the mosaic layer to match the base image shape
    var mask = mosaicLayer.Masks.addProperty("Mask");
    mask.inverted = false;
    var maskShape = mask.property("Mask Path");
    var baseLayerRect = [
        [-baseWidth/2, -baseHeight/2],
        [baseWidth/2, -baseHeight/2],
        [baseWidth/2, baseHeight/2],
        [-baseWidth/2, baseHeight/2]
    ];
    maskShape.setValue(new Shape().createFillBetween(baseLayerRect, baseLayerRect, false));

    app.endUndoGroup();

    alert("Organic image mosaic created successfully!");
})();