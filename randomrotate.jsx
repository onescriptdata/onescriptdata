// Random Rotation Script for Selected Layers

function randomRotationUI() {
    var scriptUI = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Random Rotation", undefined, {resizeable:true});
    
    scriptUI.orientation = "column";
    scriptUI.alignChildren = ["fill", "top"];
    
    // Minimum Rotation Angle
    scriptUI.add("statictext", undefined, "Minimum Rotation Angle (degrees):");
    var minAngleInput = scriptUI.add("edittext", undefined, "0");
    minAngleInput.characters = 10;

    // Maximum Rotation Angle
    scriptUI.add("statictext", undefined, "Maximum Rotation Angle (degrees):");
    var maxAngleInput = scriptUI.add("edittext", undefined, "360");
    maxAngleInput.characters = 10;

    // Duration
    scriptUI.add("statictext", undefined, "Duration (seconds):");
    var durationInput = scriptUI.add("edittext", undefined, "1");
    durationInput.characters = 10;

    // Apply Button
    var applyButton = scriptUI.add("button", undefined, "Apply Rotation");
    
    applyButton.onClick = function() {
        var minAngle = parseFloat(minAngleInput.text);
        var maxAngle = parseFloat(maxAngleInput.text);
        var duration = parseFloat(durationInput.text);

        if (isNaN(minAngle) || isNaN(maxAngle) || isNaN(duration)) {
            alert("Please enter valid numbers.");
            return;
        }

        randomRotateSelectedLayers(minAngle, maxAngle, duration);
        scriptUI.close();
    };

    scriptUI.center();
    scriptUI.show();
}

function randomRotateSelectedLayers(minAngle, maxAngle, duration) {
    var comp = app.project.activeItem;

    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length === 0) {
        alert("Please select at least one layer.");
        return;
    }

    app.beginUndoGroup("Random Rotation");

    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        
        var randomStartAngle = minAngle + Math.random() * (maxAngle - minAngle);
        var randomEndAngle = minAngle + Math.random() * (maxAngle - minAngle);
        
        layer.rotation.setValueAtTime(0, randomStartAngle);
        layer.rotation.setValueAtTime(duration, randomEndAngle);
        
        layer.rotation.setInterpolationTypeAtKey(1, KeyframeInterpolationType.LINEAR);
        layer.rotation.setInterpolationTypeAtKey(2, KeyframeInterpolationType.LINEAR);
    }

    app.endUndoGroup();
}

// Run the UI script
randomRotationUI();
