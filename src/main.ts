console.log("Loading...")

import { emitResourcePacks, generateStats } from "./builder.js"
import fixes from "./fixes.js"
import { MinecraftVersionSpecifier, VersionInfo } from "./minecraftHelpers.js"
import fetch from "node-fetch"
import { StartAndEnd } from "./util.js"

async function printStats() {
  const stats = await generateStats(fixes, { version: targetVersions })

  const { bugReports, translationKeys } = stats.count

  console.log(`Fixed bugs: ${bugReports}`)
  console.log(`Translation keys: ${translationKeys}`)
}

export const packDescription =
  "Fixes issues with text labels.\nSource: §9§nbit.ly/CapsFix"

console.log("Fetching Minecraft version information...")
export const versionsSummary = (await fetch(
  "https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.min.json"
).then((res) => res.json())) as VersionInfo[]

export const cache = new Map<string, any>()

const commandLineArg = process.argv[2]

const targetVersions: MinecraftVersionSpecifier = {
  type: "latest",
  branch: "snapshot",
}
// const targetVersions = "22w24a"
// const targetVersions: StartAndEnd<string> = ["1.19.1-pre1", null]
const targetLanguages = ["en_us", "en_gb"]

commandLineArg === "--stats"
  ? await printStats()
  : await emitResourcePacks(fixes, {
      targetVersions,
      targetLanguages,
      clearDirectory: true,
      packVersion: commandLineArg,
      // If no version was specified, just name the zip after the MC version it targets:
      filename: commandLineArg
        ? undefined
        : (minecraftVersion) => `${minecraftVersion}.zip`,
    })
