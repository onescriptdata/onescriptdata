// Create UI panel
var myPanel = (this instanceof Panel) ? this : new Window("palette", "Random Layer Movement", undefined, {resizeable:true});

// Create UI elements
myPanel.add("statictext", undefined, "X Position Range:");
var xMinInput = myPanel.add("edittext", undefined, "-500");
xMinInput.characters = 5;
var xMaxInput = myPanel.add("edittext", undefined, "500");
xMaxInput.characters = 5;

myPanel.add("statictext", undefined, "Y Position Range:");
var yMinInput = myPanel.add("edittext", undefined, "-500");
yMinInput.characters = 5;
var yMaxInput = myPanel.add("edittext", undefined, "500");
yMaxInput.characters = 5;

myPanel.add("statictext", undefined, "Animate over frames:");
var frameCountInput = myPanel.add("edittext", undefined, "20");
frameCountInput.characters = 5;

var moveButton = myPanel.add("button", undefined, "Move Layers Randomly");

// Function to move layers randomly
function moveLayersRandomly() {
    var xMin = parseFloat(xMinInput.text);
    var xMax = parseFloat(xMaxInput.text);
    var yMin = parseFloat(yMinInput.text);
    var yMax = parseFloat(yMaxInput.text);
    var frameCount = parseInt(frameCountInput.text, 10);

    if (isNaN(xMin) || isNaN(xMax) || isNaN(yMin) || isNaN(yMax) || isNaN(frameCount)) {
        alert("Please enter valid numbers.");
        return;
    }

    var comp = app.project.activeItem;
    if (comp == null || !(comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var layers = comp.selectedLayers;
    if (layers.length === 0) {
        alert("Please select at least one layer.");
        return;
    }

    app.beginUndoGroup("Random Layer Movement");

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var randomX = Math.random() * (xMax - xMin) + xMin;
        var randomY = Math.random() * (yMax - yMin) + yMin;

        if (frameCount > 0) {
            // Animate over time
            var currentPos = layer.property("Position").value;
            var startFrame = comp.time;
            var endFrame = startFrame + (frameCount / comp.frameRate);

            layer.property("Position").setValueAtTime(startFrame, currentPos);
            layer.property("Position").setValueAtTime(endFrame, [randomX, randomY]);
        } else {
            // Just set the position instantly
            layer.property("Position").setValue([randomX, randomY]);
        }
    }

    app.endUndoGroup();
}

// Add event listener to button
moveButton.onClick = moveLayersRandomly;

// Show the panel
if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
} else {
    myPanel.layout.layout(true);
}
