// Function to create UI
function createAppearDisappearUI() {
    var win = new Window("palette", "Random Layer Intervals", undefined, {resizeable: true});
    win.orientation = "column";

    // Min Interval
    win.add("statictext", undefined, "Minimum Interval (seconds):");
    var minIntervalSlider = win.add("slider", undefined, 1, 0.5, 10); // Min 0.5, Max 10 seconds
    var minIntervalText = win.add("edittext", undefined, "1");
    minIntervalText.characters = 5;
    minIntervalSlider.onChanging = function() {
        minIntervalText.text = minIntervalSlider.value.toFixed(2);
    };

    // Max Interval
    win.add("statictext", undefined, "Maximum Interval (seconds):");
    var maxIntervalSlider = win.add("slider", undefined, 5, 1, 20); // Min 1, Max 20 seconds
    var maxIntervalText = win.add("edittext", undefined, "5");
    maxIntervalText.characters = 5;
    maxIntervalSlider.onChanging = function() {
        maxIntervalText.text = maxIntervalSlider.value.toFixed(2);
    };

    // Apply button
    var applyButton = win.add("button", undefined, "Apply Random Intervals");

    // Apply button action
    applyButton.onClick = function() {
        var minInterval = parseFloat(minIntervalText.text);
        var maxInterval = parseFloat(maxIntervalText.text);

        if (minInterval >= maxInterval || minInterval <= 0 || maxInterval <= 0) {
            alert("Please enter valid interval values.");
            return;
        }

        // Apply random intervals to all layers in the active composition
        applyRandomIntervals(minInterval, maxInterval);
    };

    win.center();
    win.show();
}

// Function to apply random intervals to layers
function applyRandomIntervals(minInterval, maxInterval) {
    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    // Start undo group
    app.beginUndoGroup("Random Layer Intervals");

    // Loop through all layers
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);

        // Random start time for the layer to appear
        var appearTime = Math.random() * (maxInterval - minInterval) + minInterval;

        // Random duration for the layer to stay visible
        var disappearTime = appearTime + Math.random() * (maxInterval - minInterval);

        // Animate opacity: fade in at appearTime, fade out at disappearTime
        var opacity = layer.property("Opacity");
        opacity.setValueAtTime(appearTime, 0); // Fully invisible
        opacity.setValueAtTime(appearTime + 0.5, 100); // Fade in to full opacity
        opacity.setValueAtTime(disappearTime, 100); // Stay at full opacity
        opacity.setValueAtTime(disappearTime + 0.5, 0); // Fade out to fully invisible
    }

    // End undo group
    app.endUndoGroup();
}

// Run the UI
createAppearDisappearUI();

