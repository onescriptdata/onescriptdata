(function() {
    var win = new Window("dialog", "Multi-Comp Generator");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];

    // Source panel
    var sourcePanel = win.add("panel", undefined, "Source");
    sourcePanel.orientation = "row";
    var sourceDropdown = sourcePanel.add("dropdownlist", undefined, ["Footage", "Folder"]);
    sourceDropdown.selection = 0;
    var sourceBtn = sourcePanel.add("button", undefined, "Choose");

    // Comp settings panel
    var settingsPanel = win.add("panel", undefined, "Comp Settings");
    settingsPanel.orientation = "column";
    settingsPanel.alignChildren = ["left", "top"];
    settingsPanel.spacing = 5;

    var numCompsGroup = settingsPanel.add("group");
    numCompsGroup.add("statictext", undefined, "Number of Comps:");
    var numCompsInput = numCompsGroup.add("edittext", undefined, "5");
    numCompsInput.characters = 5;

    var compSizeGroup = settingsPanel.add("group");
    compSizeGroup.add("statictext", undefined, "Comp Size:");
    var widthInput = compSizeGroup.add("edittext", undefined, "1920");
    widthInput.characters = 5;
    compSizeGroup.add("statictext", undefined, "x");
    var heightInput = compSizeGroup.add("edittext", undefined, "1080");
    heightInput.characters = 5;

    var fpsGroup = settingsPanel.add("group");
    fpsGroup.add("statictext", undefined, "Frame Rate:");
    var fpsInput = fpsGroup.add("edittext", undefined, "30");
    fpsInput.characters = 5;

    var durationGroup = settingsPanel.add("group");
    durationGroup.add("statictext", undefined, "Duration (sec):");
    var durationInput = durationGroup.add("edittext", undefined, "5");
    durationInput.characters = 5;

    var numClipsGroup = settingsPanel.add("group");
    numClipsGroup.add("statictext", undefined, "Clips per Comp:");
    var numClipsInput = numClipsGroup.add("edittext", undefined, "3");
    numClipsInput.characters = 5;

    var trimCheck = settingsPanel.add("checkbox", undefined, "Trim to Comp Duration");

    // Buttons
    var btnGroup = win.add("group");
    btnGroup.alignment = "center";
    var okBtn = btnGroup.add("button", undefined, "OK");
    var cancelBtn = btnGroup.add("button", undefined, "Cancel");

    var sourceItems = [];

    sourceBtn.onClick = function() {
        if (sourceDropdown.selection.text == "Footage") {
            sourceItems = app.project.importFileWithDialog();
        } else {
            var folder = Folder.selectDialog("Choose a folder with footage");
            if (folder) {
                var files = folder.getFiles(/\.(mp4|mov|avi|jpg|png)$/i);
                sourceItems = app.project.importFiles(files);
            }
        }
    };

    function randomTime(duration) {
        return Math.random() * duration;
    }

    function createRandomEdit(comp, sourceItems, numClips, trimToComp) {
        var totalDuration = 0;
        var layers = [];

        for (var i = 0; i < numClips; i++) {
            var item = sourceItems[Math.floor(Math.random() * sourceItems.length)];
            var layer = comp.layers.add(item);
            layers.push(layer);

            var clipDuration = Math.min(item.duration, comp.duration / numClips);
            layer.startTime = totalDuration;
            layer.inPoint = layer.startTime;
            layer.outPoint = layer.startTime + clipDuration;

            // Fit footage to comp
            var scale = Math.max(comp.width / item.width, comp.height / item.height) * 100;
            layer.property("Scale").setValue([scale, scale]);

            // Random position
            var xOffset = (Math.random() - 0.5) * comp.width * 0.2;
            var yOffset = (Math.random() - 0.5) * comp.height * 0.2;
            layer.property("Position").setValue([comp.width/2 + xOffset, comp.height/2 + yOffset]);

            totalDuration += clipDuration;
        }

        if (trimToComp) {
            comp.duration = Math.min(totalDuration, parseFloat(durationInput.text));
        } else {
            comp.duration = Math.max(totalDuration, parseFloat(durationInput.text));
        }

        return layers;
    }

    okBtn.onClick = function() {
        if (sourceItems.length == 0) {
            alert("Please select source footage or folder.");
            return;
        }

        app.beginUndoGroup("Create Multiple Comps");

        var numComps = parseInt(numCompsInput.text);
        var width = parseInt(widthInput.text);
        var height = parseInt(heightInput.text);
        var fps = parseFloat(fpsInput.text);
        var duration = parseFloat(durationInput.text);
        var numClips = parseInt(numClipsInput.text);

        for (var i = 0; i < numComps; i++) {
            var comp = app.project.items.addComp("Comp " + (i + 1), width, height, 1, duration, fps);
            createRandomEdit(comp, sourceItems, numClips, trimCheck.value);
        }

        app.endUndoGroup();
        win.close();
    };

    cancelBtn.onClick = function() {
        win.close();
    };

    win.show();
})();