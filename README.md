# Capitalisation Fixes

Capitalisation Fixes is a resource pack that fixes various bugs related to in-game and UI text, such as labels being improperly capitalised.

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

|                                                                                | 22w11a    | 22w12a    | 22w13a    | 22w14a    |
| ------------------------------------------------------------------------------ | --------- | --------- | --------- | --------- |
| **[v2.0](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0)** | &#127775; | &#9989;   | &#9989;   | &#9989;   |
| **[v2.1](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.1)** | &#9989;   | &#127775; | &#127775; | &#9989;   |
| **[v2.2](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.2)** | &#9989;   | &#9989;   | &#9989;   | &#9989;   |
| **[v2.3](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.3)** | &#9989;   | &#9989;   | &#9989;   | &#127775; |

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

37 modified translation strings are included in the resource pack, which fix a total of 17 bugs:

- [Several 1.17 advancement strings](https://bugs.mojang.com/browse/MC-226430)
- ["Feels like home" advancement title](https://bugs.mojang.com/browse/MC-237920)
- ["You Got a Friend in Me" advancement title](https://bugs.mojang.com/browse/MC-250025)
- [Sound of Music advancement description](https://bugs.mojang.com/browse/MC-237922)
- [Star Trader advancement description](https://bugs.mojang.com/browse/MC-237924)
- [Serious Dedication advancement description](https://bugs.mojang.com/browse/MC-231458)
- [Birthday Song advancement description](https://bugs.mojang.com/browse/MC-249980)
- [Render/Simulation distance sliders](https://bugs.mojang.com/browse/MC-237590)
- [Hide Lightning Flashes option description](https://bugs.mojang.com/browse/MC-236606)
- ["Buffet world customization" title](https://bugs.mojang.com/browse/MC-222876)
- [Graphics warning buttons](https://bugs.mojang.com/browse/MC-220096)
- ["Erase cached data" button](https://bugs.mojang.com/browse/MC-244721)
- ["Include entities" button in the structure block interface](https://bugs.mojang.com/browse/MC-195781)
- ["Data mode" and "Load mode" buttons in the structure block interface](https://bugs.mojang.com/browse/MC-195780)
- [Target selector argument descriptions](https://bugs.mojang.com/browse/MC-128972) (These fixes are slightly opinionated, as there are multiple ways to fix the grammar issues and inconsistencies.)
- ["Horse armor equips" subtitle](https://bugs.mojang.com/browse/MC-219541)
- ["Sliding down a honey block" subtitle](https://bugs.mojang.com/browse/MC-206779)
- ["Wandering Trader drinks milk/potion" subtitle](https://bugs.mojang.com/browse/MC-219533)
- ~~[Subtitles for Warden body parts](https://bugs.mojang.com/browse/MC-249422)~~ Fixed in 22w14a
- [Leash Knot subtitles](https://bugs.mojang.com/browse/MC-206548)

## `new-version.sh`

This is a utility script that automates part of the process of releasing a new version of Capitalisation Fixes. You should provide a name for the new version as the first (and only) argument, e.g. `./new-version.sh v2.1`. It does two main jobs:

- Create a `.zip` file that can be distributed with the GitHub release, with a name such as `Capitalisation-Fixes-v2.1.zip`
- Push any commits that only exist locally, to make sure that the tag on GitHub is based on the most recent commit.
- Create a new git tag to mark the version. It then pushes the tag to GitHub.

For detailed information, check [the file itself](new-version.sh) - it's only four commands!

## See also

- There is [a resource pack](https://bugs.mojang.com/browse/MC-186148?focusedCommentId=714784&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-714784) (not by me) which fixes [MC-186148](https://bugs.mojang.com/browse/MC-186148 "\"death.attack.witherSkull.item\" displays raw translation string \(is untranslated\)") and [MC-186851](https://bugs.mojang.com/browse/MC-186851 "\"death.attack.sting.item\" displays raw translation string \(is untranslated\)")
- [Debugify](https://modrinth.com/mod/debugify) is a Fabric mod for 1.18.2 that fixes [a whole load of vanilla bugs](https://github.com/W-OVERFLOW/Debugify/blob/1.18/PATCHED.md): it currently contains 61 bugfixes! It also has a config screen that lets you independently toggle all the bugfixes.
