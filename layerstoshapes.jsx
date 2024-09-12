(function() {
    // Create UI
    var window = new Window("palette", "Arrange Layers in Shapes", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Shape Selection
    var shapeGroup = mainGroup.add("group");
    shapeGroup.add("statictext", undefined, "Shape:");
    var shapeDropdown = shapeGroup.add("dropdownlist", undefined, ["Circle", "Square", "Triangle", "Heart", "Star", "Hexagon", "Pentagon", "Diamond"]);
    shapeDropdown.selection = 0;

    // Size Option
    var sizeGroup = mainGroup.add("group");
    sizeGroup.add("statictext", undefined, "Size:");
    var sizeSlider = sizeGroup.add("slider", undefined, 500, 100, 1000);
    var sizeText = sizeGroup.add("edittext", undefined, sizeSlider.value);
    sizeText.characters = 5;

    // Animation Options
    var animGroup = mainGroup.add("panel", undefined, "Animation");
    animGroup.orientation = "column";
    var animCheck = animGroup.add("checkbox", undefined, "Animate");
    var durationGroup = animGroup.add("group");
    durationGroup.add("statictext", undefined, "Duration (sec):");
    var durationText = durationGroup.add("edittext", undefined, "2");
    durationText.characters = 5;

    // Keyframe Option
    var keyframeGroup = mainGroup.add("group");
    var keyframeCheck = keyframeGroup.add("checkbox", undefined, "Create keyframes for shape formation");

    // Rotation Option
    var rotationGroup = mainGroup.add("group");
    var rotationCheck = rotationGroup.add("checkbox", undefined, "Rotate Shape");
    var rotationText = rotationGroup.add("edittext", undefined, "0");
    rotationText.characters = 5;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var applyButton = buttonGroup.add("button", undefined, "Apply");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper Functions
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function getShapePoints(shape, size) {
        var points = [];
        var halfSize = size / 2;

        switch(shape) {
            case "Circle":
                for (var i = 0; i < 360; i += 10) {
                    var angle = degreesToRadians(i);
                    var x = Math.cos(angle) * halfSize;
                    var y = Math.sin(angle) * halfSize;
                    points.push([x, y]);
                }
                break;
            case "Square":
                var side = size / Math.sqrt(2);
                points = [[-side/2, -side/2], [side/2, -side/2], [side/2, side/2], [-side/2, side/2], [-side/2, -side/2]];
                break;
            case "Triangle":
                for (var i = 0; i <= 3; i++) {
                    var angle = (i / 3) * 2 * Math.PI + Math.PI / 2;
                    var x = Math.cos(angle) * halfSize;
                    var y = Math.sin(angle) * halfSize;
                    points.push([x, y]);
                }
                break;
            case "Heart":
                for (var i = 0; i <= 360; i += 10) {
                    var angle = degreesToRadians(i);
                    var x = 16 * Math.pow(Math.sin(angle), 3);
                    var y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
                    points.push([x * (size / 32), -y * (size / 32)]);
                }
                break;
            case "Star":
                for (var i = 0; i <= 10; i++) {
                    var angle = (i / 10) * Math.PI * 2 + Math.PI / 2;
                    var r = (i % 2 === 0) ? halfSize : halfSize / 2;
                    var x = Math.cos(angle) * r;
                    var y = Math.sin(angle) * r;
                    points.push([x, y]);
                }
                break;
            case "Hexagon":
                for (var i = 0; i <= 6; i++) {
                    var angle = (i / 6) * 2 * Math.PI + Math.PI / 2;
                    var x = Math.cos(angle) * halfSize;
                    var y = Math.sin(angle) * halfSize;
                    points.push([x, y]);
                }
                break;
            case "Pentagon":
                for (var i = 0; i <= 5; i++) {
                    var angle = (i / 5) * 2 * Math.PI + Math.PI / 2;
                    var x = Math.cos(angle) * halfSize;
                    var y = Math.sin(angle) * halfSize;
                    points.push([x, y]);
                }
                break;
            case "Diamond":
                points = [[0, -halfSize], [halfSize, 0], [0, halfSize], [-halfSize, 0], [0, -halfSize]];
                break;
        }

        return points;
    }

    function interpolatePoints(p1, p2, t) {
        return [
            p1[0] + (p2[0] - p1[0]) * t,
            p1[1] + (p2[1] - p1[1]) * t
        ];
    }

    // Apply Function
    function applyShape() {
        app.beginUndoGroup("Arrange Layers in Shape");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var shape = shapeDropdown.selection.text;
            var size = parseInt(sizeText.text);
            var points = getShapePoints(shape, size);

            var centerX = comp.width / 2;
            var centerY = comp.height / 2;

            var rotation = parseFloat(rotationText.text) || 0;
            var rotationRad = degreesToRadians(rotation);

            var duration = parseFloat(durationText.text) || 2;
            var createKeyframes = keyframeCheck.value;
            var startTime = comp.time; // Get the current time indicator position

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var t = i / (selectedLayers.length - 1);
                var segmentIndex = Math.floor(t * (points.length - 1));
                var segmentT = (t * (points.length - 1)) % 1;

                var p1 = points[segmentIndex];
                var p2 = points[segmentIndex + 1] || points[0];
                var point = interpolatePoints(p1, p2, segmentT);

                // Apply rotation to the point
                var rotatedX = point[0] * Math.cos(rotationRad) - point[1] * Math.sin(rotationRad);
                var rotatedY = point[0] * Math.sin(rotationRad) + point[1] * Math.cos(rotationRad);

                var newX = centerX + rotatedX;
                var newY = centerY + rotatedY;

                if (animCheck.value || createKeyframes) {
                    layer.position.setValueAtTime(startTime, layer.position.value);
                    layer.position.setValueAtTime(startTime + duration, [newX, newY]);
                } else {
                    layer.position.setValue([newX, newY]);
                }
            }

            alert("Layers arranged successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Event Listeners
    sizeSlider.onChanging = function() { sizeText.text = Math.round(sizeSlider.value); };
    sizeText.onChange = function() { sizeSlider.value = parseInt(sizeText.text); };

    // Button click events
    applyButton.onClick = applyShape;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();