import Fix from "./Fix.js"
import { fixGroup, autoCapitaliseGroup } from "./fixGroups.js"
import { lang } from "./minecraftHelpers.js"
import {
  CapitaliseFromTranslationStringsTransformer,
  CapitaliseSegmentTransformer,
  ReplaceTransformer,
  TitleCaseTransformer,
} from "./transformers/index.js"

const autoCapitaliser = new CapitaliseFromTranslationStringsTransformer({
  vanillaStrings: ["block.**", "item.**", "entity.**"],
})

const fixes: Fix[] = [
  new Fix({
    bug: "MC-226454",
    key: "advancements.adventure.avoid_vibration.description",
    // Adds a serial comma to the list of blocks/mobs that can detect player vibrations
    transformer: new ReplaceTransformer(" or", ", or"),
  }),
  new Fix({
    bug: "MC-236606",
    key: "options.hideLightningFlashes.tooltip",
    transformer: autoCapitaliser,
  }),
  new Fix({
    bug: "MC-219541",
    key: "subtitles.entity.horse.armor",
    transformer: new CapitaliseSegmentTransformer(
      lang`${"entity.minecraft.horse"} ${"attribute.name.generic.armor"}`
    ),
  }),
  new Fix({
    bug: "MC-195781",
    key: "structure_block.include_entities",
    transformer: new TitleCaseTransformer(),
  }),
  new Fix({
    bug: "MC-195780",
    key: "structure_block.mode_info.load",
    transformer: new TitleCaseTransformer(),
  }),
  new Fix({
    bug: "MC-195780",
    key: "structure_block.mode_info.data",
    transformer: new TitleCaseTransformer(),
  }),
  new Fix({
    bug: "MC-220096",
    key: "options.graphics.warning.cancel",
    transformer: new TitleCaseTransformer(),
  }),
  new Fix({
    bug: "MC-220096",
    key: "options.graphics.warning.accept",
    transformer: new TitleCaseTransformer(),
  }),
  ...fixGroup(
    "MC-128972",
    {
      "distance.description": "Distance to entities",
      "level.description": "Players with experience level",
      "gamemode.description": "Players in gamemode",
      "name.description": "Entities with name",
      "x.description": "X coordinate",
      "y.description": "Y coordinate",
      "z.description": "Z coordinate",
    },
    { keyPrefix: "argument.entity.options" }
  ),
  new Fix({
    bug: "MC-206779",
    key: "subtitles.block.honey_block.slide",
    transformer: autoCapitaliser,
  }),
  new Fix({
    bug: "MC-237590",
    key: "options.chunks",
    transformer: new TitleCaseTransformer(),
  }),
  ...autoCapitaliseGroup("MC-206548", [
    "subtitles.entity.leash_knot.break",
    "subtitles.entity.leash_knot.place",
  ]),
  new Fix({
    bug: "MC-244721",
    key: "selectWorld.backupEraseCache",
    transformer: new TitleCaseTransformer(),
  }),
]

export default fixes
