import { emitResourcePacks } from "./builder"
import fixes from "./fixes"

console.log("Building resource packs...")

export const cache = new Map<string, any>()

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
