(function() {
    // Create UI
    var window = new Window("palette", "Add Expressions", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Expression Type
    var exprTypeGroup = mainGroup.add("group");
    exprTypeGroup.add("statictext", undefined, "Expression Type:");
    var exprType = exprTypeGroup.add("dropdownlist", undefined, ["Wiggle", "Smooth", "Loop", "Bounce", "Oscillate", "Random"]);
    exprType.selection = 0;

    // Property Type
    var propTypeGroup = mainGroup.add("group");
    propTypeGroup.add("statictext", undefined, "Property:");
    var propType = propTypeGroup.add("dropdownlist", undefined, ["Position", "Scale", "Rotation", "Opacity"]);
    propType.selection = 0;

    // Wiggle Options
    var wiggleGroup = mainGroup.add("group");
    wiggleGroup.add("statictext", undefined, "Frequency:");
    var wiggleFreq = wiggleGroup.add("edittext", undefined, "2");
    wiggleFreq.characters = 5;
    wiggleGroup.add("statictext", undefined, "Amplitude:");
    var wiggleAmp = wiggleGroup.add("edittext", undefined, "50");
    wiggleAmp.characters = 5;

    // Smooth Options
    var smoothGroup = mainGroup.add("group");
    smoothGroup.add("statictext", undefined, "Width:");
    var smoothWidth = smoothGroup.add("edittext", undefined, "0.2");
    smoothWidth.characters = 5;
    smoothGroup.add("statictext", undefined, "Samples:");
    var smoothSamples = smoothGroup.add("edittext", undefined, "5");
    smoothSamples.characters = 5;

    // Loop Options
    var loopGroup = mainGroup.add("group");
    loopGroup.add("statictext", undefined, "Loop Type:");
    var loopType = loopGroup.add("dropdownlist", undefined, ["Cycle", "Ping Pong", "Offset", "Continue"]);
    loopType.selection = 0;

    // Bounce Options
    var bounceGroup = mainGroup.add("group");
    bounceGroup.add("statictext", undefined, "Bounce Height:");
    var bounceHeight = bounceGroup.add("edittext", undefined, "50");
    bounceHeight.characters = 5;
    bounceGroup.add("statictext", undefined, "Bounce Frequency:");
    var bounceFreq = bounceGroup.add("edittext", undefined, "2");
    bounceFreq.characters = 5;

    // Oscillate Options
    var oscillateGroup = mainGroup.add("group");
    oscillateGroup.add("statictext", undefined, "Amplitude:");
    var oscillateAmp = oscillateGroup.add("edittext", undefined, "50");
    oscillateAmp.characters = 5;
    oscillateGroup.add("statictext", undefined, "Frequency:");
    var oscillateFreq = oscillateGroup.add("edittext", undefined, "2");
    oscillateFreq.characters = 5;

    // Random Options
    var randomGroup = mainGroup.add("group");
    randomGroup.add("statictext", undefined, "Min Value:");
    var randomMin = randomGroup.add("edittext", undefined, "0");
    randomMin.characters = 5;
    randomGroup.add("statictext", undefined, "Max Value:");
    var randomMax = randomGroup.add("edittext", undefined, "100");
    randomMax.characters = 5;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var applyButton = buttonGroup.add("button", undefined, "Apply Expression");
    var removeButton = buttonGroup.add("button", undefined, "Remove Expressions");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Show/Hide Options Based on Expression Type
    function updateUI() {
        wiggleGroup.visible = (exprType.selection.index === 0);
        smoothGroup.visible = (exprType.selection.index === 1);
        loopGroup.visible = (exprType.selection.index === 2);
        bounceGroup.visible = (exprType.selection.index === 3);
        oscillateGroup.visible = (exprType.selection.index === 4);
        randomGroup.visible = (exprType.selection.index === 5);
    }
    exprType.onChange = updateUI;
    updateUI();

    // Apply Expression Function
    function applyExpression() {
        app.beginUndoGroup("Apply Expression");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var expression = "";
            switch (exprType.selection.index) {
                case 0: // Wiggle
                    var freq = parseFloat(wiggleFreq.text);
                    var amp = parseFloat(wiggleAmp.text);
                    if (isNaN(freq) || isNaN(amp)) {
                        throw new Error("Please enter valid wiggle parameters.");
                    }
                    expression = "wiggle(" + freq + ", " + amp + ")";
                    break;
                case 1: // Smooth
                    var width = parseFloat(smoothWidth.text);
                    var samples = parseInt(smoothSamples.text);
                    if (isNaN(width) || isNaN(samples)) {
                        throw new Error("Please enter valid smooth parameters.");
                    }
                    expression = "smooth(" + width + ", " + samples + ")";
                    break;
                case 2: // Loop
                    var type = loopType.selection.text.toLowerCase().replace(" ", "");
                    expression = "loopOut('" + type + "')";
                    break;
                case 3: // Bounce
                    var height = parseFloat(bounceHeight.text);
                    var frequency = parseFloat(bounceFreq.text);
                    if (isNaN(height) || isNaN(frequency)) {
                        throw new Error("Please enter valid bounce parameters.");
                    }
                    expression = "freq = " + frequency + ";\n" +
                                 "amp = " + height + ";\n" +
                                 "decay = 5;\n" +
                                 "n = 0;\n" +
                                 "if (numKeys > 0){\n" +
                                 "n = nearestKey(time).index;\n" +
                                 "if (key(n).time > time){n--}\n" +
                                 "}\n" +
                                 "if (n == 0){\n" +
                                 "t = 0;\n" +
                                 "}else{\n" +
                                 "t = time - key(n).time;\n" +
                                 "}\n" +
                                 "if (n > 0){\n" +
                                 "v = velocityAtTime(key(n).time - thisComp.frameDuration/10);\n" +
                                 "value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);\n" +
                                 "}else{\n" +
                                 "value;\n" +
                                 "}";
                    break;
                case 4: // Oscillate
                    var amp = parseFloat(oscillateAmp.text);
                    var freq = parseFloat(oscillateFreq.text);
                    if (isNaN(amp) || isNaN(freq)) {
                        throw new Error("Please enter valid oscillate parameters.");
                    }
                    expression = "amp = " + amp + ";\n" +
                                 "freq = " + freq + ";\n" +
                                 "decay = 5;\n" +
                                 "t = time;\n" +
                                 "value + amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);";
                    break;
                case 5: // Random
                    var minValue = parseFloat(randomMin.text);
                    var maxValue = parseFloat(randomMax.text);
                    if (isNaN(minValue) || isNaN(maxValue)) {
                        throw new Error("Please enter valid random parameters.");
                    }
                    expression = "random(" + minValue + ", " + maxValue + ")";
                    break;
            }

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var property;
                switch (propType.selection.index) {
                    case 0: property = layer.property("Position"); break;
                    case 1: property = layer.property("Scale"); break;
                    case 2: property = layer.property("Rotation"); break;
                    case 3: property = layer.property("Opacity"); break;
                }
                if (property) {
                    property.expression = expression;
                }
            }

            alert("Expression applied successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Remove Expressions Function
    function removeExpressions() {
        app.beginUndoGroup("Remove Expressions");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var property;
                switch (propType.selection.index) {
                    case 0: property = layer.property("Position"); break;
                    case 1: property = layer.property("Scale"); break;
                    case 2: property = layer.property("Rotation"); break;
                    case 3: property = layer.property("Opacity"); break;
                }
                if (property) {
                    property.expression = "";
                }
            }

            alert("Expressions removed successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    applyButton.onClick = applyExpression;
    removeButton.onClick = removeExpressions;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();