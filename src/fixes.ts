import Fix from "./Fix.js"
import {
  OverrideTransformer,
  CustomTransformer,
  CapitaliseSectionTransformer,
  CapitaliseFromTranslationStringsTransformer,
} from "./transformers/index.js"

const fixes: Fix[] = [
  new Fix({
    key: "test",
    transformer: new OverrideTransformer("Testing"),
    versions: ["22w12a", "22w14a"],
  }),
  new Fix({
    key: "gui.yes",
    transformer: [
      // Adds an exclamation mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}!`),
      // Adds a question mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}?`),
    ],
  }),
  new Fix({
    key: "item.minecraft.baked_potato",
    transformer: [
      new OverrideTransformer("baked jacket potato"),
      new CapitaliseSectionTransformer(/bake/i, "11"),
    ],
    languages: ["en_gb"],
  }),
  new Fix({
    key: "test.place_grass",
    transformer: [
      new OverrideTransformer("Place a grass block"),
      new CapitaliseFromTranslationStringsTransformer({
        vanillaStrings: ["block.minecraft.*"],
      }),
    ],
  }),
]

export default fixes
