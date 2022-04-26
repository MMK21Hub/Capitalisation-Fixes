import { Fix } from "./builder"
import {
  OverrideTransformer,
  MultiTransformer,
  CustomTransformer,
} from "./transformers"

const fixes: Fix[] = [
  new Fix({
    key: "test",
    transformer: new OverrideTransformer("test"),
    versions: ["22w12a", "22w14a"],
  }),
  new Fix({
    key: "gui.yes",
    transformer: new MultiTransformer([
      // Adds an exclamation mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}!`),
      // Adds a question mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}?`),
    ]),
  }),
  new Fix({
    key: "item.minecraft.baked_potato",
    transformer: new OverrideTransformer("Baked Jacket Potato"),
    languages: ["en_gb"],
  }),
]

export default fixes
