import { emitResourcePacks } from "./builder.js"
import fixes from "./fixes.js"

console.log("Building resource packs...")

export const cache = new Map<string, any>()

const versionString = process.argv[2]

await emitResourcePacks(fixes, {
  targetVersions: {
    type: "latest",
    branch: "snapshot",
  },
  targetLanguages: ["en_us", "en_gb"],
  clearDirectory: true,
  packVersion: versionString,
  // If no version was specified, just name the zip after the MC version it targets:
  filename: versionString
    ? undefined
    : (minecraftVersion) => `${minecraftVersion}.zip`,
})
