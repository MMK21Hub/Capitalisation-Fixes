import Fix from "./Fix.js"
import {
  CapitaliseFromTranslationStringsTransformer,
  CapitaliseSegmentTransformer,
  ReplaceTransformer,
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
]

export default fixes
