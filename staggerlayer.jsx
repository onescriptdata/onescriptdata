(function() {
    // Create UI
    var window = new Window("palette", "Stagger Layers", undefined);
    var offsetGroup = window.add("group", undefined, "");
    offsetGroup.add("statictext", undefined, "Offset:");
    var offsetInput = offsetGroup.add("edittext", undefined, "1"); // Default offset value
    offsetInput.characters = 5;

    var timeUnitGroup = window.add("group", undefined, "");
    var framesRadio = timeUnitGroup.add("radiobutton", undefined, "Frames");
    var secondsRadio = timeUnitGroup.add("radiobutton", undefined, "Seconds");
    framesRadio.value = true; // Default to frames

    var startFromMarkerCheckbox = window.add("checkbox", undefined, "Start from Current Time Marker");
    var staggerButton = window.add("button", undefined, "Stagger");
    var closeButton = window.add("button", undefined, "Close");

    // Stagger layers function
    function staggerLayers() {
        app.beginUndoGroup("Stagger Layers");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                throw new Error("Please select at least one layer.");
            }

            var offset = parseFloat(offsetInput.text);
            if (isNaN(offset) || offset <= 0) {
                throw new Error("Invalid offset value.");
            }

            var isFrames = framesRadio.value;
            var currentTime = comp.time;

            // Start staggering from the current time marker or the layer's current time
            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var newTime;

                if (startFromMarkerCheckbox.value) {
                    newTime = currentTime + (i * (isFrames ? comp.frameDuration * offset : offset));
                } else {
                    newTime = layer.startTime + (i * (isFrames ? comp.frameDuration * offset : offset));
                }

                layer.startTime = newTime;
            }

            alert("Layers staggered successfully.");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    staggerButton.onClick = staggerLayers;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();