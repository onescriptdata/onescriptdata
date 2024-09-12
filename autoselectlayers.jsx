(function() {
    // Create UI
    var window = new Window("palette", "Auto Select Layers", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Selection Criteria
    var criteriaGroup = mainGroup.add("panel", undefined, "Selection Criteria");
    criteriaGroup.orientation = "column";
    criteriaGroup.alignChildren = ["left", "top"];
    criteriaGroup.spacing = 5;

    var startTimeCheck = criteriaGroup.add("checkbox", undefined, "Start Time");
    var endTimeCheck = criteriaGroup.add("checkbox", undefined, "End Time");
    var durationCheck = criteriaGroup.add("checkbox", undefined, "Duration");
    var nameCheck = criteriaGroup.add("checkbox", undefined, "Layer Name");
    var typeCheck = criteriaGroup.add("checkbox", undefined, "Layer Type");

    // Time Input
    var timeGroup = mainGroup.add("group");
    timeGroup.add("statictext", undefined, "Time (seconds):");
    var timeInput = timeGroup.add("edittext", undefined, "0");
    timeInput.characters = 5;

    // Tolerance Input
    var toleranceGroup = mainGroup.add("group");
    toleranceGroup.add("statictext", undefined, "Tolerance (seconds):");
    var toleranceInput = toleranceGroup.add("edittext", undefined, "0");
    toleranceInput.characters = 5;

    // Duration Input
    var durationGroup = mainGroup.add("group");
    durationGroup.add("statictext", undefined, "Duration (seconds):");
    var durationInput = durationGroup.add("edittext", undefined, "0");
    durationInput.characters = 5;

    // Name Input
    var nameGroup = mainGroup.add("group");
    nameGroup.add("statictext", undefined, "Layer Name Contains:");
    var nameInput = nameGroup.add("edittext", undefined, "");
    nameInput.characters = 15;

    // Layer Type Dropdown
    var typeGroup = mainGroup.add("group");
    typeGroup.add("statictext", undefined, "Layer Type:");
    var typeDropdown = typeGroup.add("dropdownlist", undefined, ["All", "Solid", "Text", "Shape", "Image", "Video", "Audio", "Adjustment", "Null"]);
    typeDropdown.selection = 0;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var selectButton = buttonGroup.add("button", undefined, "Select Layers");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Helper Functions
    function isTimeWithinTolerance(time1, time2, tolerance) {
        return Math.abs(time1 - time2) <= tolerance;
    }

    function getLayerType(layer) {
        if (layer instanceof AVLayer) {
            if (layer.source instanceof CompItem) return "Comp";
            if (layer.source instanceof FootageItem) {
                if (layer.source.mainSource instanceof SolidSource) return "Solid";
                if (layer.source.mainSource instanceof FileSource) {
                    var fileExt = layer.source.file.name.split('.').pop().toLowerCase();
                    if (["jpg", "jpeg", "png", "gif", "tif", "tiff"].indexOf(fileExt) !== -1) return "Image";
                    if (["mov", "mp4", "avi", "wmv"].indexOf(fileExt) !== -1) return "Video";
                    if (["wav", "mp3", "aac", "m4a"].indexOf(fileExt) !== -1) return "Audio";
                }
            }
        }
        if (layer instanceof TextLayer) return "Text";
        if (layer instanceof ShapeLayer) return "Shape";
        if (layer instanceof CameraLayer) return "Camera";
        if (layer instanceof LightLayer) return "Light";
        if (layer.adjustmentLayer) return "Adjustment";
        if (layer.nullLayer) return "Null";
        return "Unknown";
    }

    // Select Layers Function
    function selectLayers() {
        app.beginUndoGroup("Auto Select Layers");

        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var time = parseFloat(timeInput.text);
            var tolerance = parseFloat(toleranceInput.text);
            var duration = parseFloat(durationInput.text);
            var nameFilter = nameInput.text.toLowerCase();
            var typeFilter = typeDropdown.selection.text;

            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                var shouldSelect = true;

                if (startTimeCheck.value && !isTimeWithinTolerance(layer.inPoint, time, tolerance)) {
                    shouldSelect = false;
                }

                if (endTimeCheck.value && !isTimeWithinTolerance(layer.outPoint, time, tolerance)) {
                    shouldSelect = false;
                }

                if (durationCheck.value && !isTimeWithinTolerance(layer.outPoint - layer.inPoint, duration, tolerance)) {
                    shouldSelect = false;
                }

                if (nameCheck.value && layer.name.toLowerCase().indexOf(nameFilter) === -1) {
                    shouldSelect = false;
                }

                if (typeCheck.value && typeFilter !== "All" && getLayerType(layer) !== typeFilter) {
                    shouldSelect = false;
                }

                layer.selected = shouldSelect;
            }

            alert("Layers selected based on criteria!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    selectButton.onClick = selectLayers;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();