(function() {
    // Create UI
    var window = new Window("palette", "Layer Repeater", undefined);
    var mainGroup = window.add("group");
    mainGroup.orientation = "column";
    mainGroup.alignChildren = ["left", "top"];
    mainGroup.spacing = 10;
    mainGroup.margins = 16;

    // Number of Copies
    var copiesGroup = mainGroup.add("group");
    copiesGroup.add("statictext", undefined, "Number of Copies:");
    var numCopies = copiesGroup.add("edittext", undefined, "5");
    numCopies.characters = 5;

    // Direction
    var directionGroup = mainGroup.add("group");
    directionGroup.add("statictext", undefined, "Direction:");
    var direction = directionGroup.add("dropdownlist", undefined, ["Right", "Left", "Up", "Down"]);
    direction.selection = 0;

    // Offset
    var offsetGroup = mainGroup.add("group");
    offsetGroup.add("statictext", undefined, "Offset (px):");
    var offset = offsetGroup.add("edittext", undefined, "100");
    offset.characters = 5;

    // Mirror Mode
    var mirrorGroup = mainGroup.add("group");
    var mirrorMode = mirrorGroup.add("checkbox", undefined, "Mirror Mode");

    // Buttons
    var buttonGroup = mainGroup.add("group");
    var createButton = buttonGroup.add("button", undefined, "Generate Copies");
    var closeButton = buttonGroup.add("button", undefined, "Close");

    // Generate Copies Function
    function generateCopies() {
        app.beginUndoGroup("Generate Copies");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length !== 1) {
                throw new Error("Please select a single layer.");
            }

            var layer = selectedLayers[0];
            var numCopiesVal = parseInt(numCopies.text);
            var offsetVal = parseFloat(offset.text);
            if (isNaN(numCopiesVal) || numCopiesVal <= 0) {
                throw new Error("Please enter a valid number of copies.");
            }
            if (isNaN(offsetVal)) {
                throw new Error("Please enter a valid offset value.");
            }

            var directionVector;
            switch (direction.selection.index) {
                case 0: directionVector = [offsetVal, 0]; break; // Right
                case 1: directionVector = [-offsetVal, 0]; break; // Left
                case 2: directionVector = [0, -offsetVal]; break; // Up
                case 3: directionVector = [0, offsetVal]; break; // Down
            }

            for (var i = 1; i <= numCopiesVal; i++) {
                var newLayer = layer.duplicate();
                var position = newLayer.property("Position").value;
                var newPosition = [
                    position[0] + directionVector[0] * i,
                    position[1] + directionVector[1] * i
                ];

                if (mirrorMode.value) {
                    if (direction.selection.index === 0 || direction.selection.index === 1) {
                        newLayer.property("Scale").setValue([-100, 100]);
                    } else {
                        newLayer.property("Scale").setValue([100, -100]);
                    }
                }

                newLayer.property("Position").setValue(newPosition);
            }

            alert("Copies generated successfully!");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    createButton.onClick = generateCopies;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();