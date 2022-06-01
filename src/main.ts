console.log("Loading...")

import { emitResourcePacks } from "./builder.js"
import fixes from "./fixes.js"
import { VersionInfo } from "./minecraftHelpers.js"
import fetch from "node-fetch"

export const packDescription =
  "Fixes issues with text labels.\nSource: §9§nbit.ly/CapsFix"

console.log("Fetching Minecraft version information...")
export const versionsSummary = (await fetch(
  "https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.min.json"
).then((res) => res.json())) as VersionInfo[]

export const cache = new Map<string, any>()

console.log("Building resource packs...")
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
