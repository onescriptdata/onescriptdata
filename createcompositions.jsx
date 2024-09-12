// Compact UI for Creating Compositions with Custom Options

var myPanel = (this instanceof Panel) ? this : new Window("palette", "Create Compositions", undefined, {resizeable:true});

// Naming Section
var namingGroup = myPanel.add("group", undefined);
namingGroup.orientation = "row";
namingGroup.add("statictext", undefined, "Prefix:");
var prefixInput = namingGroup.add("edittext", undefined, "Comp_");
prefixInput.characters = 10;

namingGroup.add("statictext", undefined, "Suffix:");
var suffixInput = namingGroup.add("edittext", undefined, "");
suffixInput.characters = 10;

namingGroup.add("statictext", undefined, "Number of Compositions:");
var numCompsInput = namingGroup.add("edittext", undefined, "1");
numCompsInput.characters = 5;

// Width and Height Section
var sizeGroup = myPanel.add("group", undefined);
sizeGroup.orientation = "row";
sizeGroup.add("statictext", undefined, "Width/Height Mode:");
var fixedOrRandomDropdown = sizeGroup.add("dropdownlist", undefined, ["Fixed", "Random"]);
fixedOrRandomDropdown.selection = 0;

sizeGroup.add("statictext", undefined, "Fixed Width:");
var fixedWidthInput = sizeGroup.add("edittext", undefined, "1920");
fixedWidthInput.characters = 5;

sizeGroup.add("statictext", undefined, "Fixed Height:");
var fixedHeightInput = sizeGroup.add("edittext", undefined, "1080");
fixedHeightInput.characters = 5;

// Min/Max Width/Height for Random Mode
var randomSizeGroup = myPanel.add("group", undefined);
randomSizeGroup.orientation = "row";
randomSizeGroup.add("statictext", undefined, "Min Width:");
var minWidthInput = randomSizeGroup.add("edittext", undefined, "500");
minWidthInput.characters = 5;

randomSizeGroup.add("statictext", undefined, "Max Width:");
var maxWidthInput = randomSizeGroup.add("edittext", undefined, "1920");
maxWidthInput.characters = 5;

randomSizeGroup.add("statictext", undefined, "Min Height:");
var minHeightInput = randomSizeGroup.add("edittext", undefined, "500");
minHeightInput.characters = 5;

randomSizeGroup.add("statictext", undefined, "Max Height:");
var maxHeightInput = randomSizeGroup.add("edittext", undefined, "1080");
maxHeightInput.characters = 5;

// Duration Section (Fixed or Random)
var durationGroup = myPanel.add("group", undefined);
durationGroup.orientation = "row";
durationGroup.add("statictext", undefined, "Fixed Duration (sec):");
var fixedDurationInput = durationGroup.add("edittext", undefined, "10");
fixedDurationInput.characters = 5;

var randomDurationGroup = myPanel.add("group", undefined);
randomDurationGroup.orientation = "row";
randomDurationGroup.add("statictext", undefined, "Min Duration (sec):");
var minDurationInput = randomDurationGroup.add("edittext", undefined, "5");
minDurationInput.characters = 5;

randomDurationGroup.add("statictext", undefined, "Max Duration (sec):");
var maxDurationInput = randomDurationGroup.add("edittext", undefined, "20");
maxDurationInput.characters = 5;

// Frame Rate Section
var frameRateGroup = myPanel.add("group", undefined);
frameRateGroup.orientation = "row";
frameRateGroup.add("statictext", undefined, "Frame Rate:");
var frameRateInput = frameRateGroup.add("edittext", undefined, "24");
frameRateInput.characters = 5;

// Create Button
var createButton = myPanel.add("button", undefined, "Create Compositions");

// Function to Create Compositions
createButton.onClick = function() {
    var numComps = parseInt(numCompsInput.text);
    if (isNaN(numComps) || numComps < 1) {
        alert("Please enter a valid number of compositions.");
        return;
    }

    var prefix = prefixInput.text;
    var suffix = suffixInput.text;

    var frameRate = parseFloat(frameRateInput.text);
    if (isNaN(frameRate) || frameRate <= 0) {
        alert("Please enter a valid frame rate.");
        return;
    }

    var fixedOrRandom = fixedOrRandomDropdown.selection.text;
    
    var fixedWidth = parseInt(fixedWidthInput.text);
    var fixedHeight = parseInt(fixedHeightInput.text);

    var minWidth = parseInt(minWidthInput.text);
    var maxWidth = parseInt(maxWidthInput.text);
    var minHeight = parseInt(minHeightInput.text);
    var maxHeight = parseInt(maxHeightInput.text);

    // Validate inputs for width/height
    if (fixedOrRandom === "Fixed") {
        if (isNaN(fixedWidth) || isNaN(fixedHeight)) {
            alert("Please enter valid fixed width and height.");
            return;
        }
    } else {
        if (isNaN(minWidth) || isNaN(maxWidth) || isNaN(minHeight) || isNaN(maxHeight) || minWidth > maxWidth || minHeight > maxHeight) {
            alert("Please enter valid random width and height ranges.");
            return;
        }
    }

    // Duration (Fixed or Random)
    var fixedDuration = parseFloat(fixedDurationInput.text);
    var minDuration = parseFloat(minDurationInput.text);
    var maxDuration = parseFloat(maxDurationInput.text);

    if (isNaN(fixedDuration) || isNaN(minDuration) || isNaN(maxDuration) || minDuration > maxDuration) {
        alert("Please enter valid duration values.");
        return;
    }

    app.beginUndoGroup("Create Compositions");

    for (var i = 0; i < numComps; i++) {
        var compWidth, compHeight, compDuration;

        if (fixedOrRandom === "Fixed") {
            compWidth = fixedWidth;
            compHeight = fixedHeight;
        } else {
            compWidth = Math.round(Math.random() * (maxWidth - minWidth) + minWidth);
            compHeight = Math.round(Math.random() * (maxHeight - minHeight) + minHeight);
        }

        compDuration = Math.random() * (maxDuration - minDuration) + minDuration;

        var compName = prefix + (i + 1) + suffix;
        app.project.items.addComp(compName, compWidth, compHeight, 1, compDuration, frameRate);
    }

    app.endUndoGroup();
    alert(numComps + " compositions created successfully.");
};

// Display UI
if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
} else {
    myPanel.layout.layout(true);
}
