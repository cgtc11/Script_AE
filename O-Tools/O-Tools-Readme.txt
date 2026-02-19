AfterEffects script.
O_Tools_en_v1.5.8d
-------------------------------------
□□□How to install□□□
-------------------------------------
C:\Program Files\Adobe\Adobe After Effects <each version No>\Support Files\Scripts\ScriptUI Panels
Put it in the window > Launch O_Tools_en.jsx
Place it wherever you like.
-------------------------------------
□□□Description□□□
-------------------------------------
■■■NameED■■■
-------------------------------------
★NameED (convert name or comment)

Select either “Name” or “Comment” and click “Get” to get the information in the text box.
Click “Get” button to get the information in the text box.
Click the “Update” button to rewrite the information in the text box to the name or comment.

Click the “Replace” button to replace the text in the text box with
The “Replace” button replaces the text in the text box with the text from the left text box to the right text box.
The “Replace” button replaces the text in the left text box with the text in the right text box.

----------------------------------
■■■TReMap■■■
----------------------------------
★Limited animation

Create a frame-by-frame animation with a specified number of frames.
Key all the frames, convert to stop key, and repeatedly delete the specified number of frames, leaving the key in place.

★Offset

Shift the selected key's value by the entered amount.

★Interval

Re-positions multiple selected keys at specified numerical intervals from the current indicator.

----------------------------------
★"■-------"　Display the first frame initially.

★"-------■"　After playback, keep displaying the last frame.

★"◆----◆◆"　Loop playback for the entire sequence.

★"◆--L-◆◆"　L,l,LOOP,Loop If there is a marker, LOOP playback from there to the end.

----------------------------------
■■■Tools1■■■
----------------------------------
★Reverse Selected Layers

Reverse the order of selected layers.
It is like changing ABCD to DCBA.

----------------------------------
★Assign Comments to Text

If it is a text layer
The text in the comment is given as it is.
The name is also initialized, so if you change the letters, the name will also change.

----------------------------------
★Adjust Duration

If you enter a number and run it.
A character is treated as its numeric frame.
If the number of letters in ABCD is 5 frames, the length will be 20 frames.

----------------------------------
★Component time adjustment

If the working layer extends beyond the compo
Reduce excess compo size to just the right size.

----------------------------------
★Move inside the work area

Place the selected item at the beginning of the work area.
Items that have been trimmed will be initialized and then adjusted to fit the composition size.
This is also useful when repositioning items that extend beyond the timeline.

----------------------------------
■■■Tools2■■■
----------------------------------
★Clear Layer Names

If you manually change the name of the Text layer, 
the name will not automatically change when you change the Text,
so it initializes everything you have selected.
It is the same as pressing the Enter key without typing anything when changing the name.

It is inconvenient to use Maya if Camera, Light, Shape, and Null are in Japanese.
If you want them to be in English, select them using the checkboxes.

----------------------------------
★Add/Update _Size at the End of Name

Adds the _size information to the end of the name of the selected item in the project panel.
If the item already has a number, it will be changed.

----------------------------------
★Center the Composition View

Center the screen you're viewing for your work.

----------------------------------
★Change the plane to a composite

Automatically adjust selected layers to fit the composition size.
You can choose to scale plane, shape, and adjustment layers to fit the composition size,
or keep the scale at 100% and adjust the size instead.
To keep shared elements unchanged when resizing to fit at 100% scale,
you can choose whether to create new layers and replace them.

After resizing, position them to cover the entire screen.

-------------------------------------
■■■RemoveD■■■
-------------------------------------
★RemoveD (Remove duplicates)

Search through the folders in the project panel and replace duplicates that match the criteria, then delete those that are not needed.

Click the “Start searching in the folder” button to search the folders in the project panel for duplicates that match the criteria.
Click the “Deleted after summarizing the same” button to replace duplicates that match the duplicate condition and then delete them.

----------------------------------
■■■Shake■■■
----------------------------------
★Shake Direction

This effect applies horizontal, vertical, or both types of shake more easily than a wiggle expression.
You can specify the shake amplitude and the duration (in frames) of the effect.

----------------------------------
★Number Formatting

Any decimal places will be truncated.

----------------------------------
★Batch Initialization

Deletes all keys within the selected scope
Removes expressions and various keys
Useful for starting over

----------------------------------
★Disable all error expressions

Remove all expressions causing errors across the entire project

----------------------------------
