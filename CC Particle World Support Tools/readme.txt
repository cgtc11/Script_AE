--------------------------------------
CCParticleWorldBirthRate-en.jsx
--------------------------------------

Have you ever used CCParticleWorld and thought, “There are too many particles” or “I want to work with fewer particles”?
This “CCParticleWorldBirthRate-en” script might be useful in such situations.

First, let's launch CCParticleWorld.
For now, let's explain using “Line”.
In this case, the minimum “BirthRate value” is 0.0039. Entering a value lower than this will cause particles to disappear.
Playing at this barely-generating value... produces quite a few particles.
To generate fewer than this:
Set “BirthRate 0” at frame 0, “BirthRate 0.004” at frame 1, and “BirthRate 0” at frame 3.
This allows you to release just one particle. (Using different frames might cause random failures to generate.)
Using this method:
“BirthRate 0”, “BirthRate 0.004” on frames 1-3, “BirthRate 0” on frame 4, then repeat after a few frames.
This should allow for small-scale spawning.
However, manually typing keys is tedious, so I created this script to handle the keystrokes.

Particle Amount (BirthRate):
Keys per Loop:
Repeat Count:
Interval Frames:

Enter these values and run the script to skip this tedious key input.
At the minimum setting, particles may not always appear, so some frames might be empty.
Adjust the BirthRate to find a good particle amount and test it.

This script can be used anywhere that accepts key inputs, not just for “BirthRate”.

--------------------------------------
CCParticleWorldPresets-en.jsx
--------------------------------------

When using this script, since it writes to files,
go to Menu > Edit > Preferences > Scripts and Expressions > Check “Allow scripts to write to files and access the network” before using it.

A settings file named “CCParticleWorldPresets.txt” will be created in the same location.
If the folder requires administrator permissions (e.g., within Program Files), it will be created on the desktop instead.
Please load it from a writable location whenever possible.

Apply: Execute
Save Current: Save modified values
Delete: Remove settings
Rename: Change the name
Export (.TXT): Export settings. Only one is exported.
Import (.TXT): Import settings. Loads all settings listed inside.
Change Save Location: Change the save location for settings

“Presets.txt”: Loading this file adds Spark and bullet effects.
Double-click to test the effects.
By changing the values and saving, you can recall them whenever you like.

--------------------------------------