// Function to create the UI
function createWiggleUI() {
    var win = new Window("palette", "Wiggle Layers Control", undefined, {resizeable: true});
    win.orientation = "column";
    
    // Frequency slider
    win.add("statictext", undefined, "Wiggle Frequency (times per second):");
    var freqSlider = win.add("slider", undefined, 1, 0.1, 10);  // Slider for wiggle frequency
    var freqText = win.add("edittext", undefined, "1");
    freqText.characters = 5;
    freqSlider.onChanging = function() {
        freqText.text = freqSlider.value.toFixed(1);
    };

    // Amplitude slider
    win.add("statictext", undefined, "Wiggle Amplitude (amount of movement):");
    var ampSlider = win.add("slider", undefined, 50, 1, 500);  // Slider for wiggle amplitude
    var ampText = win.add("edittext", undefined, "50");
    ampText.characters = 5;
    ampSlider.onChanging = function() {
        ampText.text = Math.round(ampSlider.value);
    };

    // Minimum wiggle slider
    win.add("statictext", undefined, "Minimum Wiggle Amplitude:");
    var minAmpInput = win.add("edittext", undefined, "10");
    minAmpInput.characters = 5;

    // Maximum wiggle slider
    win.add("statictext", undefined, "Maximum Wiggle Amplitude:");
    var maxAmpInput = win.add("edittext", undefined, "100");
    maxAmpInput.characters = 5;

    // Apply wiggle button
    var applyButton = win.add("button", undefined, "Apply Wiggle to All Layers");

    // Apply button action
    applyButton.onClick = function() {
        var freq = parseFloat(freqText.text);
        var amp = parseInt(ampText.text);
        var minAmp = parseInt(minAmpInput.text);
        var maxAmp = parseInt(maxAmpInput.text);

        if (isNaN(freq) || isNaN(amp) || isNaN(minAmp) || isNaN(maxAmp)) {
            alert("Please enter valid numbers for all fields.");
            return;
        }
        
        if (minAmp >= maxAmp) {
            alert("Minimum amplitude should be less than the maximum amplitude.");
            return;
        }

        // Apply the wiggle to all layers
        applyWiggleToAllLayers(freq, amp, minAmp, maxAmp);
    };

    win.center();
    win.show();
}

// Function to apply wiggle to all layers in the active composition
function applyWiggleToAllLayers(freq, amp, minAmp, maxAmp) {
    // Get the active composition
    var comp = app.project.activeItem;

    // Check if there is an active composition
    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    // Start undo group
    app.beginUndoGroup("Apply Wiggle to All Layers");

    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);

        // Calculate random wiggle amplitude within the user-specified range
        var randomAmp = minAmp + Math.random() * (maxAmp - minAmp);

        // Add wiggle expression to position
        layer.property("Position").expression = "wiggle(" + freq + "," + randomAmp + ");";

        // Optionally, you can also add wiggle to other properties like rotation, scale, or opacity
        // Uncomment to wiggle these properties:
        // layer.property("Rotation").expression = "wiggle(" + freq + ", " + randomAmp + ");";
        // layer.property("Scale").expression = "wiggle(" + freq + ", " + randomAmp + ");";
        // layer.property("Opacity").expression = "wiggle(" + freq + ", " + randomAmp + ");";
    }

    // End undo group
    app.endUndoGroup();
}

// Run the UI function
createWiggleUI();
