(function() {
    // Create UI
    var window = new Window("palette", "Add Ease", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Ease Type
    var easeTypeGroup = mainGroup.add("group");
    easeTypeGroup.add("statictext", undefined, "Ease Type:");
    var easeType = easeTypeGroup.add("dropdownlist", undefined, ["Ease In", "Ease Out", "Ease In-Out"]);
    easeType.selection = 0;

    // Property Type
    var propTypeGroup = mainGroup.add("group");
    propTypeGroup.add("statictext", undefined, "Property:");
    var propType = propTypeGroup.add("dropdownlist", undefined, ["Position", "Scale", "Rotation", "Opacity"]);
    propType.selection = 0;

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var applyButton = buttonGroup.add("button", undefined, "Apply Ease");
    var removeButton = buttonGroup.add("button", undefined, "Remove Ease");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Apply Ease Function
    function applyEase() {
        app.beginUndoGroup("Apply Ease");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                throw new Error("Please select at least one layer.");
            }

            var easeIn = new KeyframeEase(0, 33);
            var easeOut = new KeyframeEase(0, 33);

            for (var i = 0; i < selectedLayers.length; i++) {
                var layer = selectedLayers[i];
                var property;
                switch (propType.selection.index) {
                    case 0: property = layer.property("Position"); break;
                    case 1: property = layer.property("Scale"); break;
                    case 2: property = layer.property("Rotation"); break;
                    case 3: property = layer.property("Opacity"); break;
                }
                if (property && property.numKeys > 0) {
                    for (var j = 1; j <= property.numKeys; j++) {
                        switch (easeType.selection.index) {
                            case 0: // Ease In
                                property.setTemporalEaseAtKey(j, [easeIn], [easeOut]);
                                break;
                            case 1: // Ease Out
                                property.setTemporalEaseAtKey(j, [easeOut], [easeIn]);
                                break;
                            case 2: // Ease In-Out
                                property.setTemporalEaseAtKey(j, [easeIn], [easeIn]);
                                break;
                        }
                    }
                }
            }

            alert("Ease applied successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Remove Ease Function
    function removeEase() {
        app.beginUndoGroup("Remove Ease");
        
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
                if (property && property.numKeys > 0) {
                    for (var j = 1; j <= property.numKeys; j++) {
                        property.setTemporalEaseAtKey(j, [new KeyframeEase(0, 0)], [new KeyframeEase(0, 0)]);
                    }
                }
            }

            alert("Ease removed successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    applyButton.onClick = applyEase;
    removeButton.onClick = removeEase;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();