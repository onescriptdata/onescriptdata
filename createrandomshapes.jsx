(function() {
    // Create UI
    var window = new Window("palette", "Create Random Abstract Shapes", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Number of shapes
    var countGroup = mainGroup.add("group");
    countGroup.add("statictext", undefined, "Number of shapes:");
    var countInput = countGroup.add("edittext", undefined, "5");
    countInput.characters = 5;

    // Size options
    var sizeGroup = mainGroup.add("panel", undefined, "Size");
    sizeGroup.orientation = "column";
    var minSizeGroup = sizeGroup.add("group");
    minSizeGroup.add("statictext", undefined, "Min Size:");
    var minSizeInput = minSizeGroup.add("edittext", undefined, "50");
    minSizeInput.characters = 5;
    var maxSizeGroup = sizeGroup.add("group");
    maxSizeGroup.add("statictext", undefined, "Max Size:");
    var maxSizeInput = maxSizeGroup.add("edittext", undefined, "200");
    maxSizeInput.characters = 5;

    // Shape complexity
    var complexityGroup = mainGroup.add("group");
    complexityGroup.add("statictext", undefined, "Complexity (3-12):");
    var complexityInput = complexityGroup.add("edittext", undefined, "3-8");
    complexityInput.characters = 5;

    // Smoothness
    var smoothnessGroup = mainGroup.add("group");
    smoothnessGroup.add("statictext", undefined, "Smoothness:");
    var smoothnessSlider = smoothnessGroup.add("slider", undefined, 50, 0, 100);
    var smoothnessValue = smoothnessGroup.add("statictext", undefined, "50%");
    smoothnessSlider.onChanging = function() { smoothnessValue.text = Math.round(smoothnessSlider.value) + "%"; };

    // Color options
    var colorGroup = mainGroup.add("panel", undefined, "Color");
    colorGroup.orientation = "column";
    var randomColorCheck = colorGroup.add("checkbox", undefined, "Random Colors");
    randomColorCheck.value = true;
    var colorWellGroup = colorGroup.add("group");
    colorWellGroup.add("statictext", undefined, "Base Color:");
    var colorWell = colorWellGroup.add("button", undefined, "");
    colorWell.size = [60, 20];
    colorWell.fillBrush = colorWell.graphics.newBrush(colorWell.graphics.BrushType.SOLID_COLOR, [1, 0, 0]);

    // Stroke options
    var strokeGroup = mainGroup.add("panel", undefined, "Stroke");
    var addStrokeCheck = strokeGroup.add("checkbox", undefined, "Add Stroke");
    var strokeWidthGroup = strokeGroup.add("group");
    strokeWidthGroup.add("statictext", undefined, "Stroke Width:");
    var strokeWidthInput = strokeWidthGroup.add("edittext", undefined, "2");
    strokeWidthInput.characters = 5;

    // Position options
    var positionGroup = mainGroup.add("panel", undefined, "Position");
    var randomPositionCheck = positionGroup.add("checkbox", undefined, "Random Position");
    randomPositionCheck.value = true;

    // Rotation option
    var rotationGroup = mainGroup.add("panel", undefined, "Rotation");
    var randomRotationCheck = rotationGroup.add("checkbox", undefined, "Random Rotation");
    randomRotationCheck.value = true;

    // Opacity option
    var opacityGroup = mainGroup.add("panel", undefined, "Opacity");
    var randomOpacityCheck = opacityGroup.add("checkbox", undefined, "Random Opacity");
    randomOpacityCheck.value = true;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var createButton = buttonGroup.add("button", undefined, "Create Shapes");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper Functions
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomColor() {
        return [Math.random(), Math.random(), Math.random(), 1];
    }

    function createAbstractShape(size, complexity, smoothness) {
        var numPoints = randomInt(complexity[0], complexity[1]);
        var points = [];
        var inTangents = [];
        var outTangents = [];

        for (var i = 0; i < numPoints; i++) {
            var angle = (i / numPoints) * 2 * Math.PI;
            var radius = size * (0.5 + Math.random() * 0.5);
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            points.push([x, y]);

            var tangentLength = size * smoothness * 0.01;
            var inAngle = angle + randomFloat(-Math.PI/2, Math.PI/2);
            var outAngle = angle + randomFloat(-Math.PI/2, Math.PI/2);
            inTangents.push([Math.cos(inAngle) * tangentLength, Math.sin(inAngle) * tangentLength]);
            outTangents.push([Math.cos(outAngle) * tangentLength, Math.sin(outAngle) * tangentLength]);
        }

        var shape = new Shape();
        shape.vertices = points;
        shape.inTangents = inTangents;
        shape.outTangents = outTangents;
        shape.closed = true;
        return shape;
    }

    // Create Shapes Function
    function createShapes() {
        app.beginUndoGroup("Create Random Abstract Shapes");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var count = parseInt(countInput.text);
            var minSize = parseInt(minSizeInput.text);
            var maxSize = parseInt(maxSizeInput.text);
            var complexityRange = complexityInput.text.split('-').map(Number);
            var smoothness = smoothnessSlider.value;

            for (var i = 0; i < count; i++) {
                var shapeLayer = comp.layers.addShape();
                if (!shapeLayer) throw new Error("Failed to create shape layer.");

                var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Group");
                if (!shapeGroup) throw new Error("Failed to add shape group.");

                var shapePath = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Group");
                if (!shapePath) throw new Error("Failed to add shape path.");

                var size = randomInt(minSize, maxSize);
                var abstractShape = createAbstractShape(size, complexityRange, smoothness);
                shapePath.property("Path").setValue(abstractShape);

                // Set position
                if (randomPositionCheck.value) {
                    shapeLayer.position.setValue([randomInt(0, comp.width), randomInt(0, comp.height)]);
                }

                // Set color
                var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                if (fill) {
                    fill.property("Color").setValue(randomColorCheck.value ? randomColor() : colorWell.fillBrush.color);
                }

                // Add stroke if checked
                if (addStrokeCheck.value) {
                    var stroke = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
                    if (stroke) {
                        stroke.property("Color").setValue([0, 0, 0, 1]);
                        stroke.property("Stroke Width").setValue(parseFloat(strokeWidthInput.text));
                    }
                }

                // Set rotation
                if (randomRotationCheck.value) {
                    shapeLayer.rotation.setValue(randomFloat(0, 360));
                }

                // Set opacity
                if (randomOpacityCheck.value) {
                    shapeLayer.opacity.setValue(randomInt(20, 100));
                }
            }

            alert("Random abstract shapes created successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Color well click event
    colorWell.onClick = function() {
        var newColor = $.colorPicker();
        if (newColor !== -1) {
            var r = (newColor >> 16) & 0xff;
            var g = (newColor >> 8) & 0xff;
            var b = newColor & 0xff;
            this.fillBrush = this.graphics.newBrush(this.graphics.BrushType.SOLID_COLOR, [r/255, g/255, b/255]);
            this.graphics.backgroundColor = this.fillBrush;
        }
    };

    // Button click events
    createButton.onClick = createShapes;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();