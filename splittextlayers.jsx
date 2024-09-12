(function() {
    // Create UI
    var window = new Window("palette", "Split Text Layers", undefined);
    var splitGroup = window.add("group", undefined, "");
    splitGroup.add("statictext", undefined, "Split By:");
    
    var splitByCharacters = splitGroup.add("radiobutton", undefined, "Characters");
    var splitByWords = splitGroup.add("radiobutton", undefined, "Words");
    
    splitByCharacters.value = true; // Default to characters

    var splitButton = window.add("button", undefined, "Split");
    var closeButton = window.add("button", undefined, "Close");

    // Split text function
    function splitTextLayers() {
        app.beginUndoGroup("Split Text Layers");
        
        try {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                throw new Error("Please select a composition.");
            }

            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                throw new Error("Please select at least one text layer.");
            }

            for (var i = 0; i < selectedLayers.length; i++) {
                var textLayer = selectedLayers[i];
                if (!(textLayer instanceof TextLayer)) {
                    throw new Error("Selected layer is not a text layer: " + textLayer.name);
                }

                var textProp = textLayer.property("Source Text");
                var textDocument = textProp.value;
                var text = textDocument.text;

                // Split the text based on the selected option
                var splitText;
                if (splitByCharacters.value) {
                    splitText = text.split("");
                } else if (splitByWords.value) {
                    splitText = text.split(/\s+/);
                }

                // Get the original layer's bounds
                var originalBounds = textLayer.sourceRectAtTime(0, false);
                var originalAnchor = textLayer.anchorPoint.value;

                // Calculate the offset from the layer's anchor point to its top-left corner
                var anchorOffset = [
                    originalAnchor[0] - originalBounds.left,
                    originalAnchor[1] - originalBounds.top
                ];

                // Create new text layers for each split part
                var currentX = originalBounds.left;
                for (var j = 0; j < splitText.length; j++) {
                    var newLayer = comp.layers.addText(splitText[j]);
                    var newTextProp = newLayer.property("Source Text");
                    var newTextDocument = newTextProp.value;

                    // Copy properties from the original text layer
                    newTextDocument.font = textDocument.font;
                    newTextDocument.fontSize = textDocument.fontSize;
                    newTextDocument.fillColor = textDocument.fillColor;
                    newTextDocument.applyFill = textDocument.applyFill;
                    newTextDocument.applyStroke = textDocument.applyStroke;
                    newTextDocument.justification = textDocument.justification;

                    newTextProp.setValue(newTextDocument);

                    // Get the bounds of the new layer
                    var newBounds = newLayer.sourceRectAtTime(0, false);

                    // Calculate the new position
                    var newX = currentX + newBounds.width / 2;
                    var newY = originalBounds.top + newBounds.height / 2;

                    // Set the position of the new layer
                    newLayer.position.setValue([newX, newY]);

                    // Set the anchor point to match the original layer's relative anchor point
                    newLayer.anchorPoint.setValue([
                        newBounds.width / 2 + anchorOffset[0],
                        newBounds.height / 2 + anchorOffset[1]
                    ]);

                    // Update currentX for the next character/word
                    currentX += newBounds.width;
                }

                // Disable the original text layer
                textLayer.enabled = false;
            }

            alert("Text layers split successfully.");
        } catch (error) {
            alert("Error: " + error.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // Button click events
    splitButton.onClick = splitTextLayers;
    closeButton.onClick = function() { window.close(); };

    // Show the window
    window.center();
    window.show();
})();