(function() {
    // Create UI
    var window = new Window("palette", "Arrange Layers in Shape", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Masked Layer Selection
    var layerGroup = mainGroup.add("group");
    layerGroup.add("statictext", undefined, "Masked Layer:");
    var layerDropdown = layerGroup.add("dropdownlist", undefined, []);
    layerDropdown.preferredSize.width = 200;
    var refreshButton = layerGroup.add("button", undefined, "Refresh");

    // Size Option
    var sizeGroup = mainGroup.add("group");
    sizeGroup.add("statictext", undefined, "Size:");
    var sizeSlider = sizeGroup.add("slider", undefined, 100, 1, 200);
    var sizeText = sizeGroup.add("edittext", undefined, sizeSlider.value);
    sizeText.characters = 5;
    sizeGroup.add("statictext", undefined, "%");

    // Distribution Option
    var distributionGroup = mainGroup.add("group");
    distributionGroup.add("statictext", undefined, "Distribution:");
    var distributionDropdown = distributionGroup.add("dropdownlist", undefined, ["Even", "Layer Order"]);
    distributionDropdown.selection = 0;

    // Offset Option
    var offsetGroup = mainGroup.add("group");
    offsetGroup.add("statictext", undefined, "Offset:");
    var offsetSlider = offsetGroup.add("slider", undefined, 0, 0, 100);
    var offsetText = offsetGroup.add("edittext", undefined, offsetSlider.value);
    offsetText.characters = 5;
    offsetGroup.add("statictext", undefined, "%");

    // Reverse Order Option
    var reverseGroup = mainGroup.add("group");
    var reverseCheck = reverseGroup.add("checkbox", undefined, "Reverse Order");

    // Scale Layers Option
    var scaleGroup = mainGroup.add("group");
    var scaleCheck = scaleGroup.add("checkbox", undefined, "Scale Layers");
    var scaleText = scaleGroup.add("edittext", undefined, "100");
    scaleText.characters = 5;
    scaleGroup.add("statictext", undefined, "%");

    // Animation Options
    var animGroup = mainGroup.add("panel", undefined, "Animation");
    animGroup.orientation = "column";
    var animCheck = animGroup.add("checkbox", undefined, "Animate Position");
    var opacityCheck = animGroup.add("checkbox", undefined, "Animate Opacity");
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

    // Layer Order Option
    var orderGroup = mainGroup.add("group");
    orderGroup.add("statictext", undefined, "Layer Order:");
    var orderDropdown = orderGroup.add("dropdownlist", undefined, ["Front to Back", "Back to Front"]);
    orderDropdown.selection = 0;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var applyButton = buttonGroup.add("button", undefined, "Apply");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper Functions
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function updateMaskedLayers() {
        layerDropdown.removeAll();
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                if (layer.mask && layer.mask.numProperties > 0) {
                    layerDropdown.add("item", layer.name);
                }
            }
        }
        if (layerDropdown.items.length > 0) {
            layerDropdown.selection = 0;
        }
    }

    function getMaskPath(layer) {
        if (layer.mask && layer.mask.numProperties > 0) {
            return layer.mask(1).maskPath;
        }
        return null;
    }

    function getPointOnPath(vertices, inTangents, outTangents, closed, t) {
        var segmentCount = closed ? vertices.length : vertices.length - 1;
        var segment = Math.floor(t * segmentCount);
        var segmentT = (t * segmentCount) % 1;

        var p0 = vertices[segment];
        var p1 = vertices[(segment + 1) % vertices.length];
        var tan0 = outTangents[segment];
        var tan1 = inTangents[(segment + 1) % vertices.length];

        var c0 = [p0[0] + tan0[0], p0[1] + tan0[1]];
        var c1 = [p1[0] + tan1[0], p1[1] + tan1[1]];

        return bezierInterpolation(p0, c0, c1, p1, segmentT);
    }

    function bezierInterpolation(p0, p1, p2, p3, t) {
        var u = 1 - t;
        var tt = t * t;
        var uu = u * u;
        var uuu = uu * u;
        var ttt = tt * t;

        var x = uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0];
        var y = uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1];

        return [x, y];
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
                throw new Error("Please select at least one layer to arrange.");
            }

            if (!layerDropdown.selection) {
                throw new Error("Please select a masked layer.");
            }

            var maskedLayer = comp.layer(layerDropdown.selection.text);
            var maskPath = getMaskPath(maskedLayer);
            if (!maskPath) {
                throw new Error("No valid mask path found in the selected layer.");
            }

            var maskValue = maskPath.value;
            if (!maskValue || !maskValue.vertices || maskValue.vertices.length === 0) {
                throw new Error("The mask path is empty or invalid. Please check your mask.");
            }

            var size = sizeSlider.value / 100;
            var vertices = maskValue.vertices;
            var inTangents = maskValue.inTangents;
            var outTangents = maskValue.outTangents;
            var closed = maskValue.closed;

            // Calculate the bounding box of the mask
            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (var i = 0; i < vertices.length; i++) {
                minX = Math.min(minX, vertices[i][0]);
                minY = Math.min(minY, vertices[i][1]);
                maxX = Math.max(maxX, vertices[i][0]);
                maxY = Math.max(maxY, vertices[i][1]);
            }
            var maskWidth = maxX - minX;
            var maskHeight = maxY - minY;
            var maskCenterX = (minX + maxX) / 2;
            var maskCenterY = (minY + maxY) / 2;

            var centerX = comp.width / 2;
            var centerY = comp.height / 2;

            var rotation = parseFloat(rotationText.text) || 0;
            var rotationRad = degreesToRadians(rotation);

            var duration = parseFloat(durationText.text) || 2;
            var createKeyframes = keyframeCheck.value;
            var startTime = comp.time;

            var offset = offsetSlider.value / 100;
            var reverse = reverseCheck.value;
            var scaleLayersValue = scaleCheck.value ? parseFloat(scaleText.text) / 100 : 1;

            if (reverse) {
                selectedLayers.reverse();
            }

            if (orderDropdown.selection.index === 1) { // Back to Front
                selectedLayers.reverse();
            }

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var t;
                if (distributionDropdown.selection.index === 0) { // Even
                    t = (i / (selectedLayers.length - 1) + offset) % 1;
                } else { // Layer Order
                    t = ((i + 1) / selectedLayers.length + offset) % 1;
                }
                var point = getPointOnPath(vertices, inTangents, outTangents, closed, t);

                // Adjust the point relative to the mask's bounding box
                var adjustedX = (point[0] - minX) / maskWidth;
                var adjustedY = (point[1] - minY) / maskHeight;

                // Scale the point
                var scaledX = adjustedX * maskWidth * size;
                var scaledY = adjustedY * maskHeight * size;

                // Apply rotation to the point
                var rotatedX = scaledX * Math.cos(rotationRad) - scaledY * Math.sin(rotationRad);
                var rotatedY = scaledX * Math.sin(rotationRad) + scaledY * Math.cos(rotationRad);

                // Position the point relative to the composition center
                var newX = centerX + rotatedX - (maskWidth * size / 2);
                var newY = centerY + rotatedY - (maskHeight * size / 2);

                if (animCheck.value || createKeyframes) {
                    layer.position.setValueAtTime(startTime, layer.position.value);
                    layer.position.setValueAtTime(startTime + duration, [newX, newY]);
                } else {
                    layer.position.setValue([newX, newY]);
                }

                if (scaleCheck.value) {
                    layer.scale.setValue([scaleLayersValue * 100, scaleLayersValue * 100]);
                }

                if (opacityCheck.value) {
                    layer.opacity.setValueAtTime(startTime, 0);
                    layer.opacity.setValueAtTime(startTime + duration, 100);
                }

                layer.moveToBeginning();
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
    sizeText.onChange = function() { 
        var value = parseInt(sizeText.text);
        if (value < 1) value = 1;
        if (value > 200) value = 200;
        sizeSlider.value = value;
        sizeText.text = value;
    };

    offsetSlider.onChanging = function() { offsetText.text = Math.round(offsetSlider.value); };
    offsetText.onChange = function() {
        var value = parseInt(offsetText.text);
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        offsetSlider.value = value;
        offsetText.text = value;
    };

    refreshButton.onClick = updateMaskedLayers;

    // Button click events
    applyButton.onClick = applyShape;
    closeButton.onClick = function() { window.close(); };

    // Initialize masked layer dropdown
    updateMaskedLayers();

    // Show the window
    window.center();
    window.show();
})();