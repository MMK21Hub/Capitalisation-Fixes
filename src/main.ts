import { emitResourcePacks, generateStats } from "./builder.js"
import fixes from "./fixes.js"
import {
  MinecraftVersionFancyRange,
  MinecraftVersionSpecifier,
  VersionInfo,
} from "./minecraftHelpers.js"
import fetch from "node-fetch"

export async function printStats() {
  const stats = await generateStats(fixes, { version: targetVersions })

  const { bugReports, translationKeys } = stats.count

  console.log(`Fixed bugs: ${bugReports}`)
  console.log(`Translation keys: ${translationKeys}`)
}

export async function buildPack() {
  return await emitResourcePacks(fixes, {
    targetVersions,
    targetLanguages,
    clearDirectory: true,
    packVersion: commandLineArg,
    // If no version was specified, just name the zip after the MC version it targets:
    filename: commandLineArg
      ? undefined
      : (minecraftVersion) => `${minecraftVersion}.zip`,
  })
}

export const packDescription =
  "Fixes issues with text labels.\nSource: §9§nbit.ly/CapsFix"

console.log("Fetching Minecraft version information...")
export const versionsSummary = (await fetch(
  "https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.min.json"
).then((res) => res.json())) as VersionInfo[]

export const cache = new Map<string, any>()

const commandLineArg = process.argv[2]

const targetVersions: MinecraftVersionFancyRange = {
  start: "1.19.2",
}
// const targetVersions = "1.19.2"
// const targetVersions: StartAndEnd<string> = ["1.19.1-pre1", null]
const targetLanguages = ["en_us", "en_gb"]

try {
  commandLineArg === "--stats" ? await printStats() : await buildPack()
} catch (error) {
  console.error(error)
  debugger
}
