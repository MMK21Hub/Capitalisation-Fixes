import { DebugReport } from "./classes/DebugReport.js"
import { runCLI } from "./cli.js"
import { fetchVersionsSummary } from "./helpers/minecraftHelpers.js"
import { isNode } from "./helpers/util.js"

export const packDescription =
  "Fixes issues with text labels.\nSource: §9§nbit.ly/CapsFix"

export const debugReport = new DebugReport()
export const cache = new Map<string, any>()
console.log("Fetching Minecraft version information...")
export const versionsSummary = await fetchVersionsSummary()

if (isNode()) {
  // We're being executed as a Node.js script, so run the CLI function
  await runCLI()
}
