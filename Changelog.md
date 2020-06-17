

# Unreleased
## v1.3
 - Updated folder name to `Capitalisation-Fixes-v1.3`
 - Reverted the capitalisition of `I Know what I'm Doing!`
 - Partially fixed [MC-190102](https://bugs.mojang.com/browse/MC-190102) (28/39). This is what the strings look line in v1.3 (with the changes in bold, and the reason in square brackets):
   - Spectate **W**orld [Action button]
   - You **D**ied! [Title/Heading]
   - Title **S**creen [Action button]
   - Game **O**ver! [Title/Heading]
   - F3 + F = Cycle render distance (**s**hift to invert) [Brackets do not restart capitalisation]
   - When on **H**ead/**B**ody/**L**egs/**F**eet: [Confirmed by Mojang]
   - When in **M**ain/**O**ff **H**and: [Confirmed by Mojang] <!-- #10-11 -->
   - Joint **T**ype: [Field name]
   - Target **N**ame/**P**ool: [Field name]
   - World **U**pdates [Title/Heading]
   - Right Click for **M**ore ['Click' is capitalised]
   - Back to **S**erver **L**ist [Action button]
   - Back to **T**itle **S**creen [Action button]
   - Press Shift to **D**ismount ['Shift' is capitalised]
   - Continue **W**ithout **S**upport [Action Button] \[1.16 pre5 and above only]
   - Take me **B**ack [Action Button] \[1.16 pre5 and above only] <!-- #20 -->
   - Include **E**ntities: [Field name]
   - Save **M**ode - write to file [Field name]
   - Load **M**ode - load from file [Field name]
   - Data **M**ode - game logic marker [Field name]
   - Corner **M**ode - placement and size marker [Field name]
   - Show **I**nvisible **B**locks: [Field name]
   - Show **B**ounding **B**ox: [Field name]
   - Turtle **S**hell thunks [Consistant with item name] <!-- #28 -->
 - Partially fixed [MC-116857](https://bugs.mojang.com/browse/MC-116857) (2/9). This is what the strings look line in v1.3 (with the changes in bold):
   - Find **E**lytra
   - Use a **c**ompass on a **l**odestone
 - Fixed [MC-188389](https://bugs.mojang.com/browse/MC-188389)
   - Errors in currently selected datapacks prevented **the** world from loading. You can either try to load **it** with **only the** vanilla **data pack** ("safe mode") or go back to **the** title screen and fix it manually.
 -  Fixed [MC-188392](https://bugs.mojang.com/browse/MC-188392)
    - `%1$s was shot by a %2$s's skull` → `%1$s was shot by a wither skull from %2$s` (Note: This could have been fixed multiple ways.)
   
[**Roadmap**](https://github.com/MMK21Hub/Capitalisation-Fixes/issues/2)

# Released
## [v1.2 (2020-06-10)](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v1.2)
 - Updated folder name: `Capitalisation Fixes v1.1` → `Capitalisation Fixes v1.2`
 - Updated pack.mcmeta
 - Fixed 7 bugs
    - `Do you want to add following packs to Minecraft?` → `Do you want to add the following packs to Minecraft?` (MC-187380)
    - Minor grammar fixes: `This pack was made for a newer version of Minecraft and may no longer work correctly.` → `This pack was made for a newer version of Minecraft and may not work correctly.` and `This pack was made for an older version of Minecraft and may no longer work correctly.` → `This pack was made for an older version of Minecraft and may not work correctly.` (MC-187379)
    - Minor grammar fix: `"Fast" graphics reduces the amount of visible rain and snow. Transparency effects are disabled for various blocks such as tree-leaves.` → `"Fast" graphics reduces the amount of visible rain and snow. Transparency effects are disabled for various blocks such as tree leaves.` (MC-187344)
    - `Cover Me With Diamonds` → `Cover Me with Diamonds` (MC-187544)
    - `Reset to default` → `Reset to Default` (MC-187676) Note that this bug has been assigned to Grum and marked as 'In Progress', so is likely to be fixed in 1.16 pre-3.
    - `Go back` → `Go Back` (MC-187677) Note that this bug has been marked as fixed for a 'Future Version - 1.16+', so is very likely to be fixed in the 1.16 pre-3.
    - `"Fabulous" graphics enables screen shaders to draw translucent objects per-pixel.\nThis may severely impact performance for portable devices and 4k displays.` → `"Fabulous" graphics enables screen shaders to draw translucent objects per-pixel.\nThis may severely impact performance for portable devices and 4K displays.` (MC-188393)
 - Simplified the installation process.

[**Roadmap**](https://github.com/MMK21Hub/Capitalisation-Fixes/issues/1)

## [v1.1 (2020-05-31)] ​
2​3# Unreleased4## v1.35 - Updated folder name to `Capitalisation-Fixes-v1.3`6 - Reverted the capitalisition of `I Know what I'm Doing!`7 - Partially fixed [MC-190102](https://bugs.mojang.com/browse/MC-190102) (28/39). This is what the strings look line in v1.3 (with the changes in bold, and the reason in square brackets):8   - Spectate **W**orld [Action button]9   - You **D**ied! [Title/Heading]10   - Title **S**creen [Action button]11   - Game **O**ver! [Title/Heading]12   - F3 + F = Cycle render distance (**s**hift to invert) [Brackets do not restart capitalisation]13   - When on **H**ead/**B**ody/**L**egs/**F**eet: [Confirmed by Mojang]14   - When in **M**ain/**O**ff **H**and: [Confirmed by Mojang] <!-- #10-11 -->15   - Joint **T**ype: [Field name]16   - Target **N**ame/**P**ool: [Field name]17   - World **U**pdates [Title/Heading]18   - Right Click for **M**ore ['Click' is capitalised]19   - Back to **S**erver **L**ist [Action button]20   - Back to **T**itle **S**creen [Action button]21   - Press Shift to **D**ismount ['Shift' is capitalised]22   - Continue **W**ithout **S**upport [Action Button] \[1.16 pre5 and above only]23   - Take me **B**ack [Action Button] \[1.16 pre5 and above only] <!-- #20 -->24   - Include **E**ntities: [Field name]25   - Save **M**ode - write to file [Field name]26   - Load **M**ode - load from file [Field name]27   - Data **M**ode - game logic marker [Field name]28   - Corner **M**ode - placement and size marker [Field name]29   - Show **I**nvisible **B**locks: [Field name]30   - Show **B**ounding **B**ox: [Field name]31   - Turtle **S**hell thunks [Consistant with item name] <!-- #28 -->32 - Partially fixed [MC-116857](https://bugs.mojang.com/browse/MC-116857) (2/9). This is what the strings look line in v1.3 (with the changes in bold):33   - Find **E**lytra34   - Use a **c**ompass on a **l**odestone35   36[**Roadmap**](https://github.com/MMK21Hub/Capitalisation-Fixes/issues/2)37​38# Released39## [v1.2 (2020-06-10)](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v1.2)40 - Updated folder name: `Capitalisation Fixes v1.1` → `Capitalisation Fixes v1.2`41 - Updated pack.mcmeta42 - Fixed 7 bugs43    - `Do you want to add following packs to Minecraft?` → `Do you want to add the following packs to Minecraft?` (MC-187380)44    - Minor grammar fixes: `This pack was made for a newer version of Minecraft and may no longer work correctly.` → `This pack was made for a newer version of Minecraft and may not work correctly.` and `This pack was made for an older version of Minecraft and may no longer work correctly.` → `This pack was made for an older version of Minecraft and may not work correctly.` (MC-187379)45    - Minor grammar fix: `"Fast" graphics reduces the amount of visible rain and snow. Transparency effects are disabled for various blocks such as tree-leaves.` → `"Fast" graphics reduces the amount of visible rain and snow. Transparency effects are disabled for various blocks such as tree leaves.` (MC-187344)46    - `Cover Me With Diamonds` → `Cover Me with Diamonds` (MC-187544)47    - `Reset to default` → `Reset to Default` (MC-187676) Note that this bug has been assigned to Grum and marked as 'In Progress', so is likely to be fixed in 1.16 pre-3.48    - `Go back` → `Go Back` (MC-187677) Note that this bug has been marked as fixed for a 'Future Version - 1.16+', so is very likely to be fixed in the 1.16 pre-3.49    - `"Fabulous" graphics enables screen shaders to draw translucent objects per-pixel.\nThis may severely impact performance for portable devices and 4k displays.` → `"Fabulous" graphics enables screen shaders to draw translucent objects per-pixel.\nThis may severely impact performance for portable devices and 4K displays.` (MC-188393)50 - Simplified the installation process.51​52[**Roadmap**](https://github.com/MMK21Hub/Capitalisation-Fixes/issues/1)53(https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v1.1)
 - Changed name of resource pack from 'MC-184723 Fix' to 'Capitalisation Fixes'.
 - Fixed four more capitalisation bugs
 - Improved pack description.

## [v1.0 (2020-05-21)](https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/v1.0)
 - Fixed MC-184723 by adjusting the translation string for the Floating Islands world type.
