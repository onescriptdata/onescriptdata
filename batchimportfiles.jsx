// Batch Import Files Script

var myPanel = (this instanceof Panel) ? this : new Window("palette", "Batch Import Files", undefined, {resizeable:true});

myPanel.add("statictext", undefined, "Select Folder:");
var folderInput = myPanel.add("edittext", undefined, "Choose Folder", {readonly: true});
var folderButton = myPanel.add("button", undefined, "Browse...");

var organizeCheckbox = myPanel.add("checkbox", undefined, "Organize by file type");
organizeCheckbox.value = true;

var importButton = myPanel.add("button", undefined, "Import Files");

folderButton.onClick = function() {
    var folder = Folder.selectDialog("Select a folder to import");
    if (folder) {
        folderInput.text = folder.fsName;
    }
};

importButton.onClick = function() {
    var folder = new Folder(folderInput.text);
    if (!folder.exists) {
        alert("Please select a valid folder.");
        return;
    }

    var files = folder.getFiles();
    app.beginUndoGroup("Batch Import Files");

    if (organizeCheckbox.value) {
        var imageFolder = app.project.items.addFolder("Images");
        var videoFolder = app.project.items.addFolder("Videos");
        var othersFolder = app.project.items.addFolder("Others");
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file instanceof File) {
            var importOptions = new ImportOptions(file);
            if (importOptions.canImportAs(ImportAsType.FOOTAGE)) {
                var importedItem = app.project.importFile(importOptions);
                if (organizeCheckbox.value) {
                    if (importedItem.mainSource.isStill) {
                        importedItem.parentFolder = imageFolder;
                    } else if (importedItem.mainSource.hasVideo) {
                        importedItem.parentFolder = videoFolder;
                    } else {
                        importedItem.parentFolder = othersFolder;
                    }
                }
            }
        }
    }

    app.endUndoGroup();
    alert("Files imported successfully.");
};

if (myPanel instanceof Window) {
    myPanel.center();
    myPanel.show();
} else {
    myPanel.layout.layout(true);
}
