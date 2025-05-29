import { DebugReport } from "./classes/DebugReport.js"
import { emitResourcePacks, generateStats } from "./builder.js"
import fixes from "./fixes.js"
import {
  MinecraftVersionBranch,
  MinecraftVersionSpecifier,
  fetchVersionsSummary,
} from "./helpers/minecraftHelpers.js"
import { MinecraftVersionRange } from "./classes/minecraftVersions.js"

export async function printStats(limitToLatest?: MinecraftVersionBranch) {
  const versions: MinecraftVersionSpecifier = limitToLatest
    ? {
        type: "latest",
        branch: limitToLatest,
      }
    : targetVersions

  const stats = await generateStats(fixes, {
    version: versions,
  })

  const { bugReports, translationKeys } = stats.count

  const versionString = limitToLatest
    ? `the latest ${limitToLatest}`
    : `all versions`

  console.log(`Statistics for ${versionString}:`)
  console.log(`  Fixed bugs: ${bugReports}`)
  console.log(`  Translation keys: ${translationKeys}`)
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

function getStatsFilter(): MinecraftVersionBranch | undefined {
  if (process.argv[3] === "--latest-snapshot") return "snapshot"
  if (process.argv[3] === "--latest-release") return "release"
  return undefined
}

export const packDescription =
  "Fixes issues with text labels.\nSource: §9§nbit.ly/CapsFix"

export const debugReport = new DebugReport()

console.log("Fetching Minecraft version information...")
export const versionsSummary = await fetchVersionsSummary()

export const cache = new Map<string, any>()

const commandLineArg = process.argv[2]

const targetVersions = new MinecraftVersionRange({
  include: [
    // Versions to build for published releases
    // are the latest minor release for each major update or game drop
    // new MinecraftVersionRange({ only: "1.19.4" }),
    // new MinecraftVersionRange({ only: "1.20.2" }),
    // new MinecraftVersionRange({ only: "1.20.6" }),
    // new MinecraftVersionRange({ only: "1.21.1" }),
    // new MinecraftVersionRange({ only: "1.21.3" }),
    // new MinecraftVersionRange({ only: "1.21.4" }),
    // new MinecraftVersionRange({ only: "1.21.5" }),
    new MinecraftVersionRange({ only: "1.21.6-pre1" }),
  ],
})

const targetLanguages = ["en_us", "en_gb"]

try {
  commandLineArg === "--stats"
    ? await printStats(getStatsFilter())
    : await buildPack()
} catch (error) {
  console.error(error)
  debugger
} finally {
  // Save the debug report
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  debugReport.end()
  await debugReport.exportToFile("debug", `${date} ${time}.json`)
}
