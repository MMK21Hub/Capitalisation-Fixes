import Fix from "./Fix.js"
import { ReplaceTransformer } from "./transformers/index.js"

const fixes: Fix[] = [
  new Fix({
    bug: "MC-226454",
    key: "advancements.adventure.avoid_vibration.description",
    // Adds a serial comma to the list of blocks/mobs that can detect player vibrations
    transformer: new ReplaceTransformer(" or", ", or"),
  }),
]

export default fixes
