# Capitalisation Fixes

<center>

[![Modrinth Downloads](https://img.shields.io/modrinth/dt/JdXoJZy7?color=%23ff&label=Modrinth%20downloads&logo=download)](https://modrinth.com/resourcepack/capitalisation-fixes)
[![GitHub last commit](https://img.shields.io/github/last-commit/MMK21Hub/capitalisation-fixes)](https://github.com/MMK21Hub/Capitalisation-Fixes/commits)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/MMK21Hub/Capitalisation-Fixes/build-each-commit.yml)](https://github.com/MMK21Hub/Capitalisation-Fixes/actions/workflows/build-each-commit.yml)

</center>
<p><b>Capitalisation Fixes</b> is a Minecraft resource pack that fixes various bugs related to in-game and UI text, such as labels being improperly capitalised.</p>
<p>What does proper capitalisation mean in the context of Minecraft?
All in-game names should be capitalised as proper nouns (e.g. <em>Oak Boat</em>, <em>Bottle of Enchanting</em>, <em>Golden Apple</em>)
and all action buttons should be in title case (e.g. <em>Import Settings</em>, <em>Create Backup & Load</em>, <em>Erase Cached Data</em>).
Naturally, all titles should be in title case, including the titles of UI screens (<em>Video Settings</em>) and the titles of advancements (<em>Monster Hunter</em>).</p>

## Download

- **[Capitalisation Fixes for Minecraft 1.20.4](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/download/v2.19/Capitalisation-Fixes-v2.19-1.20.4.zip)** (Recommended)
- **[Capitalisation Fixes for Minecraft 1.19.4](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/download/v2.19/Capitalisation-Fixes-v2.19-1.19.4.zip)**
- [Download it from Modrinth](https://modrinth.com/resourcepack/capitalisation-fixes)

## Information

- The pack is currently maintained for Minecraft 1.19.1 to 1.20.4, and there are older versions available for [1.18](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0-compat) and [1.16](#capitalisation-fixes-v1-minecraft-116)
- The fixes are available when using British English or American English
- You can submit feedback and bug reports under the [Issues tab](https://github.com/MMK21Hub/Capitalisation-Fixes/issues)

## Features

38 modified translation strings are included in the resource pack, fixing a total of 12 bugs. A lot of the issues are uncapitalised in-game names (which I've just referred to as "capitalisation"), but there are also other capitalisation and grammar issues in there.

Here's a summary of the statistics for different Minecraft versions supported by the pack. Some bugs aren't present in all versions, so each version may have different numbers of included fixes.

| Minecraft version         | Fixed bugs | Translation strings |
| ------------------------- | ---------- | ------------------- |
| Latest version (1.20.4)   | 12         | 41                  |
| Any version (1.18–1.20.4) | 33         | 66                  |

<details> <summary><strong>List of translation strings that have been fixed</strong></summary>

- [Sneak 100 advancement description](https://bugs.mojang.com/browse/MC-250158) (missing serial comma)
- [Wax On & Wax Off advancement descriptions](https://bugs.mojang.com/browse/MC-226484) (misleading terminology)
- [Render/Simulation distance sliders](https://bugs.mojang.com/browse/MC-237590) (capitalisation of UI widget labels)
- ["Buffet world customization" title](https://bugs.mojang.com/browse/MC-222876) (capitalisation of screen titles)
- [Target selector argument descriptions](https://bugs.mojang.com/browse/MC-128972) (Multiple grammar issues and inconsistencies. Their fixes are slightly opinionated, as there are multiple ways to fix the issues.)
- [Armour equipping subtitles](https://bugs.mojang.com/browse/MC-219541) (capitalisation)
- ["Sliding down a honey block" subtitle](https://bugs.mojang.com/browse/MC-206779) (capitalisation)
- ["Wandering Trader drinks milk/potion" subtitle](https://bugs.mojang.com/browse/MC-219533) (capitalisation)
- [Subtitles for Goat body parts](https://bugs.mojang.com/browse/MC-250968) (possessive apostrophes)
- ["Chat not allowed" message](https://bugs.mojang.com/browse/MC-252408) (missing full stop)
- [`/xp` output messages](https://bugs.mojang.com/browse/MC-203095) (always uses plural nouns)
- [Strings that use the right-quote-mark character](https://bugs.mojang.com/browse/MC-256422) (apostrophes should be used)

</details>

Some bugs have been fixed in the latest version of Minecraft. However, their fixes are still available in releases of the pack targeted at older versions.
You can view them below.

<details> <summary><strong>List of older translation strings</strong></summary>

- [Birthday Song advancement description](https://bugs.mojang.com/browse/MC-249980) Fixed in 1.18-pre1
- [Goat Horn subtitles](https://bugs.mojang.com/browse/MC-250932) Fixed in 1.18-pre1
- [Report Chat message selection button](https://bugs.mojang.com/browse/MC-253102) Fixed in 1.19.1-pre1
- [Placeholder for unrelated messages in the Chat Reporting interface](https://bugs.mojang.com/browse/MC-253183) Fixed in 1.19.1-pre1
- [Terrorism or violent extremism chat report reason description](https://bugs.mojang.com/browse/MC-253223) Fixed in 1.19.1-pre5
- ["Erase cached data" button](https://bugs.mojang.com/browse/MC-244721) Fixed in 22w44a
- ["Data mode" and "Load mode" buttons in the Structure Block interface](https://bugs.mojang.com/browse/MC-195780) Fixed in 22w44a
- [Telemetry Data option menu button](https://bugs.mojang.com/browse/MC-258246) Fixed in 23w03a
- [Light as a Rabbit advancement description](https://bugs.mojang.com/browse/MC-226454) Fixed in 1.20-pre1
- [Hide Lightning Flashes option description](https://bugs.mojang.com/browse/MC-236606) Fixed in 1.20-pre1
- ["Include entities" button in the Structure Block interface](https://bugs.mojang.com/browse/MC-195781) Fixed in 1.20-pre1
- [Leash Knot subtitles](https://bugs.mojang.com/browse/MC-206548) Fixed in 1.20-pre1
- [Strings that contain the word "gamemode"](https://bugs.mojang.com/browse/MC-256424) Fixed in 1.20-pre1
- [World Loaded telemetry event description](https://bugs.mojang.com/browse/MC-257618) Fixed in 1.20-pre1
- [Bee Our Guest advancement description](https://bugs.mojang.com/browse/MC-250197) Fixed in 1.20-pre2
- [Graphics warning buttons](https://bugs.mojang.com/browse/MC-220096) Fixed in 1.20-pre2
- ["Chat not allowed" message](https://bugs.mojang.com/browse/MC-252408) Fixed in 1.20-pre2

</details>

## Variants

The pack's variant system lets it support a wide range of Minecraft versions, even though capitalisation bugs vary between Minecraft versions.
Each release of the pack has multiple files (called variants) available to download, depending on which Minecraft version you use.
![4 different .zip files listed in the Assets section of a GitHub release](https://user-images.githubusercontent.com/50421330/216786826-4d984348-6a5f-46ad-ba9f-c53b519573e6.png)

Each variant includes the specific fixes that are required for its Minecraft version — nothing more and nothing less.

If there isn't an officially-provided variant for your Minecraft version, you can compile one yourself using [the pack's build tool](#build-tool). This also works for snapshots!

## Compatibility tables

Old releases of the pack don't use the variant system, so they only target a single version (denoted by the &#127775; symbol in the tables below).
Information on these old releases is kept here so that you can find one that matches an old Minecraft version.
Note that downloading an old release of the pack means that you won't have the latest bugfixes.

To benefit from the newest bugfixes for old versions, you can [build a custom version of the pack](#build-tool).

### Releases for Minecraft 1.19

|                                                                                  | 22w11a    | 22w12a–13a | 22w14a    | 22w15a–16a | 22w17a–19a | 1.19-pre1+ | 1.19-pre5 | 1.19-rc1+ | 1.19      | 22w24a    | 1.19.1-pre1 | 1.19.1-rc1 | 1.19.1-pre2 | 1.19.1    | 1.19.2    |
| -------------------------------------------------------------------------------- | --------- | ---------- | --------- | ---------- | ---------- | ---------- | --------- | --------- | --------- | --------- | ----------- | ---------- | ----------- | --------- | --------- |
| **[v2.0](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0)**   | &#127775; | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.1](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.1)**   | &#9989;   | &#127775;  | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.2](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.2)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.3](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.3)**   | &#9989;   | &#9989;    | &#127775; | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.4](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.4)**   | &#9989;   | &#9989;    | &#9989;   | &#127775;  | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.5](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.5)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#127775;  | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.6](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.6)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#127775;  | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.7](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.7)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#127775; | &#127775; | &#127775; | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.8](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.8)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#127775; | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.9](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.9)**   | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#127775;   | &#127775;  | &#9989;     | &#9989;   | &#9989;   |
| **[v2.10](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.10)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.11](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.11)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#127775;   | &#9989;   | &#9989;   |
| **[v2.12](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.12)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.13](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.13)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.14](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.14)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#127775; | &#9989;   |
| **[v2.15](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.15)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.16](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.16)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.17](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.17)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#9989;   |
| **[v2.18](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.18)** | &#9989;   | &#9989;    | &#9989;   | &#9989;    | &#9989;    | &#9989;    | &#9989;   | &#9989;   | &#9989;   | &#9989;   | &#9989;     | &#9989;    | &#9989;     | &#9989;   | &#127775; |

### Compatibility release for Minecraft 1.18

During development of Capitalisation Fixes for the 1.19 snapshots, a special release was created to backport some of the fixes to 1.18.
It is based on the v2.0 release and contains 17 bugfixes.

- **[Download the v2.0 compatibility release](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v2.0-compat)** for Minecraft 1.18.x

### Capitalisation Fixes v1 (Minecraft 1.16)

Capitalisation Fixes v1 was a resource pack that fixed some bugs in 20w21a+ where UI labels were incorrectly capitalised, and some minor grammar issues.

Unfortunately, Capitalisation Fixes v1 is not supported in versions newer than 1.16.2. It was discontinued for a few reasons,
e.g. many of Minecraft's capitalisation bugs were merged into a single bug report on the bugtracker (making it harder to track which specific strings are fixed by this pack). Also, a large part of the pack was made obsolete by the release of 1.16 Pre-release 3, which added many of these fixes into the vanilla game.
| | 20w21a to 20w22a | 1.16 Pre-releases | 1.16 to 1.16.1 | 20w27a to 20w29a |
| -------------------------------------------------------------------------------------------------------- | ---------------- | ----------------- | -------------- | ---------------- |
| **[v1.0](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v10-2020-05-21)** | &#9989; | &#9989; | &#9989; | &#9989; |
| **[v1.1](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v11-2020-05-31)** | &#9989; | &#9989; | &#9989; | &#9989; |
| **[v1.2](https://github.com/MMK21Hub/Capitalisation-Fixes/blob/master/old_changelog.md#v12-2020-06-10)** | &#9989; | &#9989; | &#9989; | &#9989; |

## Build tool

The language files that end up in the resource pack aren't created by hand. Instead, a Javascript tool applies a list of "fixes" to the vanilla translation strings, then packages all of its changes into a resource pack that can be distributed. The source code for all the fixes is in the [`src/fixes.ts`](src/fixes.ts) file, and [all the other `.ts` files](https://github.com/MMK21Hub/Capitalisation-Fixes/search?l=typescript) are the source code for the build tool.

If you want to build the pack yourself, the setup is similar to any other Node.js project:

```yaml
# Clone this repository
git clone https://github.com/MMK21Hub/Capitalisation-Fixes.git

# Move into the folder containing the cloned repository
cd Capitalisation-Fixes

# Resolve and install dependencies
yarn install

# Compile the code into executable JavaScript
yarn build
```

Then, you can actually run the build script. Here are some usage examples:

```yaml
# Build the resource pack. The output will be in the `out` folder,
# and the zip file will be named after the targeted Minecraft version.
# If multiple versions are targeted, there will be one zip file for each.
node dist/main.js

# Specify a version number to use in the outputted zip filename
node dist/main.js v2.6

# Print some statistics instead of building the pack
# By default, it counts any fixes that are relevant to any of the target versions
node dist/main.js --stats

# Print the statistics, but only include fixes that are relevant to the latest snapshot
node dist/main.js --stats --latest-snapshot

# Print the statistics for the latest stable release of Minecraft
node dist/main.js --stats --latest-release
```

At the moment, you can't configure the output using command line arguments. To change the targeted Minecraft version (for example) you can instead edit the build configuration in the [`src/main.ts`](src/main.ts) file.
(Make sure that you run `yarn build` after editing any source files, or alternatively use `yarn watch` to automatically compile the code whenever you make changes.)

## `new-version.sh`

This is a utility script for Linux systems that automates part of the process of publishing a new release of Capitalisation Fixes. You should provide a name for the new version as the first (and only) argument, e.g. `./new-version.sh v2.1`.

It performs three main jobs:

- Run the build tool to create the `.zip` files that can be distributed with the release.
- Bump the version in the project's [package.json file](package.json).
- Push any commits that only exist locally, to make sure that the tag on GitHub is based on the most recent commit.
- Create a new git tag to mark the version. It then pushes the tag to GitHub.

For detailed information, check [the file itself](new-version.sh).

## Related projects

### Resource packs

| Name                     | Version(s)  | Fixed bug(s)    | Notes         |
| ------------------------ | ----------- | --------------- | ------------- |
| **Capitalisation Fixes** | 1.19–1.20.4 | [12](#features) | You are here! |

#### [Vanilla Tweaks](https://vanillatweaks.net/picker/resource-packs)

| Name               | Version(s) | Fixed bug(s)                                          | Notes                                                               |
| ------------------ | ---------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Item Stitching Fix | 1.14–1.21  | [MC-73186](https://bugs.mojang.com/browse/MC-73186)   | Only contains fixes for commonly-held items, such as food and tools |
| Blaze's Rods Fix   | 1.14–1.21  | [MC-144327](https://bugs.mojang.com/browse/MC-144327) |                                                                     |
| Cactus Bottom Fix  | 1.16–1.21  | [MC-150572](https://bugs.mojang.com/browse/MC-150572) |                                                                     |
| Iron Bars Fix      | 1.14–1.21  | [MC-192420](https://bugs.mojang.com/browse/MC-192420) |                                                                     |

### Fabric mods

| Name                                                            | Version(s)  | Fixed bug(s)                                                                 | Side   | Notes                                                                                |
| --------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| [Carpet-Fixes](https://modrinth.com/mod/carpet-fixes)           | 1.17–1.20.4 | [260+ bugs](https://github.com/fxmorin/carpet-fixes/wiki/Available-Settings) | Server | Requires [Carpet Mod](https://github.com/gnembon/fabric-carpet) to also be installed |
| [More Culling](https://modrinth.com/mod/moreculling)            | 1.18–1.21.5 | [5 bugs](https://github.com/fxmorin/MoreCulling#current-bugs-fixed)          | Client |                                                                                      |
| [Head Name Fix](https://modrinth.com/mod/headfix)               | 1.16–1.21.4 | [MC-174496](https://bugs.mojang.com/browse/MC-174496)                        | Server |                                                                                      |
| [Raised](https://modrinth.com/mod/raised)                       | 1.16–1.21.5 | [MC-67532](https://bugs.mojang.com/browse/MC-67532)                          | Client |                                                                                      |
| [Title Fix Mod](https://modrinth.com/mod/title-fix-mod)         | 1.15–1.20.6 | [MC-55347](https://bugs.mojang.com/browse/MC-55347)                          | Client |                                                                                      |
| [Title Fixer](https://modrinth.com/mod/title-fixer)             | 1.16–1.21.5 | [MC-238712](https://bugs.mojang.com/browse/MC-238712)                        | Client |                                                                                      |
| [Blanket client-tweaks](https://modrinth.com/mod/blanket)       | 1.18–1.20.1 | [8 bugs](https://github.com/BlanketMC/blanket-client-tweaks)                 | Client | Also includes "QoL improvements and tweaks" (disabled by default)                    |
| [MC-237017 Fix](https://modrinth.com/mod/mc-237017-fix)         | 1.18–1.19.2 | [MC-237017](https://bugs.mojang.com/browse/MC-237017)                        | Server |
| [Item Model Fix](https://github.com/PepperCode1/Item-Model-Fix) | 1.16–1.19   | [MC-73186](https://bugs.mojang.com/browse/MC-73186)                          | Client | [Issue for 1.19.3 support](https://github.com/PepperCode1/Item-Model-Fix/issues/20)  |
| [Mc122477Fix](https://modrinth.com/mod/mc122477fix)             | 1.16–1.17   | [MC-122477](https://bugs.mojang.com/browse/MC-122477)                        | Client |
| [Subspace Train](https://modrinth.com/mod/subspace-train)       | 1.17.1      | [MC-67](https://bugs.mojang.com/browse/MC-67)                                | Server |                                                                                      |

### Other projects

If there's a project I've missed out that fixes a bug in Minecraft (without changing intended features or adding content), please let me know through an issue or a pull request!
