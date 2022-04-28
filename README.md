# Capitalisation Fixes

Capitalisation Fixes is a resource pack that fixes various bugs related to in-game and UI text, such as labels being improperly capitalised.

In Minecraft, all in-game names should be capitalised as proper nouns (e.g. "Oak Boat", "Bottle of Enchanting", "Golden Apple") and all 'action' button labels should also be in title case (e.g. "Import Settings", "Create Backup & Load", "Erase Cached Data"). In addition all titles should be in title case, including the titles of UI screens ("Video Settings") and the titles of advancements ("Monster Hunter").

- It currently targets the 1.19 snapshots, but there is a "[compatibility release](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0-compat)" that supports 1.18.x versions, including the `22w13oneBlockAtATime` April Fools snapshot.
- It works for the `en_uk` and `en_us` languages
- If you have feedback, you can DM `MMK21Games#2121` on Discord
- You can also submit bug reports under the ['Issues' tab](https://github.com/MMK21Hub/Capitalisation-Fixes/issues).

To download, go to the ['Versions' section](https://github.com/MMK21Hub/Capitalisation-Fixes/releases), choose the latest stable release and download the zip file. Install it just like any other resource pack. You can find the changelog [in a separate file](Changelog.md).

## Compatibility table

Not all versions of the resource pack are compatible with all versions of MC, so check the table before deciding on the version of ~~Minecraft~~ the resource pack to use.

To benefit from the most newest bugfixes, you should keep up-to-date with the newest version of the resource pack.

&#127775; - Denotes the recommend version of the pack for each Minecraft version.

### Capitalisation Fixes v2

|                                                                                | 22w11a    | 22w12a    | 22w13a    | 22w14a    | 22w15a    | 22w16a    |
| ------------------------------------------------------------------------------ | --------- | --------- | --------- | --------- | --------- | --------- |
| **[v2.0](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0)** | &#127775; | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;   |
| **[v2.1](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.1)** | &#9989;   | &#127775; | &#127775; | &#9989;   | &#9989;   | &#9989;   |
| **[v2.2](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.2)** | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;   |
| **[v2.3](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.3)** | &#9989;   | &#9989;   | &#9989;   | &#127775; | &#9989;   | &#9989;   |
| **[v2.4](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.3)** | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#127775; | &#127775; |

|                                                                                                                           | 1.17.x   | 1.18.x  | 1.19.x   |
| ------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | -------- |
| **[v2.0-compat](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0-compat)** (1.18 Compatibility Release) | &#10060; | &#9989; | &#10060; |

### Capitalisation Fixes v1

Capitalisation Fixes v1 (previously just "Capitalisation Fixes") was a resource pack that fixed some bugs in 20w21a+ where UI labels were incorrectly capitalised, and some minor grammar issues.

Unfortunately, Capitalisation Fixes v1 is not supported in versions newer than 1.16.2. It was discontinued because of a variety of reasons, e.g. the merger of many capitalisation bugs fixed by this pack into a single bug report on the bugtracker (making it harder to track which specific strings are fixed by this pack). Also, a large part of the pack was made obsolete by the release of 1.16 Pre-release 3, which added many of these fixes into the vanilla game.
|                                                                                                          | 20w21a to 20w22a | 1.16 Pre-releases | 1.16 to 1.16.1 | 20w27a to 20w29a |
| -------------------------------------------------------------------------------------------------------- | ---------------- | ----------------- | -------------- | ---------------- |
| **[v1.0](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v10-2020-05-21)** | &#9989;          | &#9989;           | &#9989;        | &#9989;          |
| **[v1.1](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v11-2020-05-31)** | &#9989;          | &#9989;           | &#9989;        | &#9989;          |
| **[v1.2](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v12-2020-06-10)** | &#9989;          | &#9989;           | &#9989;        | &#9989;          |

## Fixed strings

33 modified translation strings are included in the resource pack, which fix a total of 16 bugs. A lot of the issues are uncapitalised in-game names (which I've just referred to as "capitalisation"), but there are also other capitalisation and grammar issues in there.

- [Several 1.17 advancement strings](https://bugs.mojang.com/browse/MC-226430) (capitalisation)
  - [Light as a Rabbit advancement description](https://bugs.mojang.com/browse/MC-226454) (missing space after ellipsis)
- [Birthday Song advancement description](https://bugs.mojang.com/browse/MC-249980) (capitalisation)
- [Sneak 100 advancement description](https://bugs.mojang.com/browse/MC-250158) (missing serial comma)
- [Render/Simulation distance sliders](https://bugs.mojang.com/browse/MC-237590) (capitalisation of UI widget labels)
- [Hide Lightning Flashes option description](https://bugs.mojang.com/browse/MC-236606) (capitalisation)
- ["Buffet world customization" title](https://bugs.mojang.com/browse/MC-222876) (capitalisation of screen titles)
- [Graphics warning buttons](https://bugs.mojang.com/browse/MC-220096) (capitalisation of action button labels)
- ["Erase cached data" button](https://bugs.mojang.com/browse/MC-244721) (capitalisation of action button labels)
- ["Include entities" button in the structure block interface](https://bugs.mojang.com/browse/MC-195781) (capitalisation of action button labels)
- ["Data mode" and "Load mode" buttons in the structure block interface](https://bugs.mojang.com/browse/MC-195780) (capitalisation of action button labels)
- [Target selector argument descriptions](https://bugs.mojang.com/browse/MC-128972) (Multiple grammar issues and inconsistencies. Their fixes are slightly opinionated, as there are multiple ways to fix the issues.)
- ["Horse armor equips" subtitle](https://bugs.mojang.com/browse/MC-219541) (capitalisation)
- ["Sliding down a honey block" subtitle](https://bugs.mojang.com/browse/MC-206779) (capitalisation)
- ["Wandering Trader drinks milk/potion" subtitle](https://bugs.mojang.com/browse/MC-219533) (capitalisation)
- [Leash Knot subtitles](https://bugs.mojang.com/browse/MC-206548) (capitalisation)
- [Goat Horn subtitles](https://bugs.mojang.com/browse/MC-250932) (capitalisation)
- [Subtitles for Goat body parts](https://bugs.mojang.com/browse/MC-250968) (possessive apostrophes)

### Previously-fixed strings

These fixes used to be included in the pack but have since been fixed in the vanilla game, so they're longer necessary.

- [Subtitles for Warden body parts](https://bugs.mojang.com/browse/MC-249422) Fixed in 22w14a
- ["You Got a Friend in Me" advancement title](https://bugs.mojang.com/browse/MC-250025) Fixed in 22w15a
- ["Feels like home" advancement title](https://bugs.mojang.com/browse/MC-237920) Fixed in 22w15a
- [Sound of Music advancement description](https://bugs.mojang.com/browse/MC-237922) Fixed in 22w15a
- [Star Trader advancement description](https://bugs.mojang.com/browse/MC-237924) Fixed in 22w15a
- [Serious Dedication advancement description](https://bugs.mojang.com/browse/MC-231458) Fixed in 22w15a

## `new-version.sh`

This is a utility script that automates part of the process of releasing a new version of Capitalisation Fixes. You should provide a name for the new version as the first (and only) argument, e.g. `./new-version.sh v2.1`. It does two main jobs:

- Create a `.zip` file that can be distributed with the GitHub release, with a name such as `Capitalisation-Fixes-v2.1.zip`
- Push any commits that only exist locally, to make sure that the tag on GitHub is based on the most recent commit.
- Create a new git tag to mark the version. It then pushes the tag to GitHub.

For detailed information, check [the file itself](new-version.sh) - it's only four commands!

## Related projects

### Resource Packs

| Name                                                                                                                                                                           | Version(s) | Fixed bug(s)                                                                                                    | Notes         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------- |
| **Capitalisation Fixes**                                                                                                                                                       | 1.19       | [16](#fixed-strings)                                                                                            | You are here! |
| [Wither Skull Messages](https://bugs.mojang.com/browse/MC-186148?focusedCommentId=714784&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-714784) | 1.16       | [MC-186148](https://bugs.mojang.com/browse/MC-186148) and [MC-186851](https://bugs.mojang.com/browse/MC-186851) |               |

#### [Vanilla Tweaks](https://vanillatweaks.net/picker/resource-packs/)

| Name                | Version(s) | Fixed bug(s)                                          | Notes                                                               |
| ------------------- | ---------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Item Stitching Fix  | 1.14–1.18  | [MC-73186](https://bugs.mojang.com/browse/MC-73186)   | Only contains fixes for commonly-held items, such as food and tools |
| Blaze's Rods Fix    | 1.14–1.18  | [MC-144327](https://bugs.mojang.com/browse/MC-144327) |                                                                     |
| Cactus Bottom Fix   | 1.16–1.18  | [MC-150572](https://bugs.mojang.com/browse/MC-150572) |                                                                     |
| Consistent Oars     | 1.17–1.18  | [MC-94161](https://bugs.mojang.com/browse/MC-94161)   | MC-94161 has been fixed in 22w12a                                   |
| Cocoa Beans Top Fix | 1.17–1.18  | [MC-109055](https://bugs.mojang.com/browse/MC-109055) | MC-109055 has been fixed in 22w11a                                  |
| Iron Bars Fix       | 1.14–1.18  | [MC-192420](https://bugs.mojang.com/browse/MC-192420) |                                                                     |
| Hopper Bottom Fix   | 1.14–1.18  | [MC-203399](https://bugs.mojang.com/browse/MC-203399) |                                                                     |

### Fabric Mods

| Name                                                            | Version(s) | Fixed bug(s)                                                            | Side   | Notes                                                                                |
| --------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| [Carpet-Fixes](https://modrinth.com/mod/carpet-fixes)           | 1.18, 1.19 | [200+](https://github.com/fxmorin/carpet-fixes/wiki/Available-Settings) | Server | Requires [Carpet Mod](https://github.com/gnembon/fabric-carpet) to also be installed |
| [Debugify](https://modrinth.com/mod/debugify)                   | 1.18.2     | [70+](https://github.com/W-OVERFLOW/Debugify/blob/1.18/PATCHED.md)      | Both   | ⚠️ Falls into the trap of "fixing" behaviour that isn't considered a bug by Mojang    |
| [Blanket client-tweaks](https://modrinth.com/mod/blanket)       | 1.18.2     | [9](https://github.com/BlanketMC/blanket-client-tweaks)                 | Client | Also includes "QoL improvements and tweaks" (disabled by default)                    |
| [Mc122477Fix](https://modrinth.com/mod/mc122477fix)             | 1.15–1.17  | [MC-122477](https://bugs.mojang.com/browse/MC-122477)                   | Client |
| [Item Model Fix](https://github.com/PepperCode1/Item-Model-Fix) | 1.16–1.18  | [MC-73186](https://bugs.mojang.com/browse/MC-73186)                     | Client |
| [Subspace Train](https://modrinth.com/mod/subspace-train)       | 1.17.1     | [MC-67](https://bugs.mojang.com/browse/MC-67)                           | Server |
| [Raised](https://modrinth.com/mod/raised)                       | 1.18, 1.19 | [MC-67532](https://bugs.mojang.com/browse/MC-67532)                     | Client |
