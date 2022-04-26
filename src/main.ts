import {
  OverrideTransformer,
  MultiTransformer,
  CustomTransformer,
  Fix,
  emitResourcePacks,
} from "./builder"

console.log("Building resource packs...")

export const cache = new Map<string, any>()

const fixes = [
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

const versionString = process.argv[2]

await emitResourcePacks(fixes, {
  targetVersions: ["22w14a", "22w15a"],
  targetLanguages: ["en_us", "en_gb"],
  clearDirectory: true,
  packVersion: versionString,
  // If no version was specified, just name the zip after the MC version it targets:
  filename: versionString
    ? undefined
    : (minecraftVersion) => `${minecraftVersion}.zip`,
})
