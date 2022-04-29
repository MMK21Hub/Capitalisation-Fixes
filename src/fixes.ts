import { Fix } from "./Fix.js"
import {
  OverrideTransformer,
  // MultiTransformer,
  CustomTransformer,
  CapitaliseSegmentTransformer,
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
      new OverrideTransformer("Baked jacket Potato"),
      new CapitaliseSegmentTransformer(/Jacket/i),
    ],
    languages: ["en_gb"],
  }),
]

export default fixes
