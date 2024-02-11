# pf2e-bardic-inspiration

NOTICE: If you are using a version of the Pathfinder 2e system with remastered spell changes, use at least version 1.4.0. Versions 1.3.0 and earlier are incompatible with remaster changes.

Adds a new sub-menu to the token HUD for bardic inspiration.

![Bardic Inspiration Menu Option](artwork/base-menu-option.png)

Selecting the sub-menu will open a menu similar to the status effects screen. Mousing over the effect options will cause a title to appear with the effect name.

![Selecting An Inspiration Option](artwork/selecting-an-inspiration-menu-option.png)

The currently supported effects are:
- Inspire Courage
- Inspire Defense
- Inspire Heroics (Courage, success and critical success)
- Inspire Heroics (Defense, success and critical success)

Selecting an effect option that is inactive (has no yellow border) will attempt to apply it to the character. It will also attempt to cancel out other similar effects. For example, selecting `Inspire Courage` will attempt to deactivate `Inspire Courage +2` and `Inspire Courage +3`. <b>The effects will be applied for an unlimited duration, so they must be manually turned off during combat.</b>

Selecting an effect option that is active (has a yellow border) will attempt to cancel the effect if it is active.