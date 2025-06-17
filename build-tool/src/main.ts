import { isNode } from "./helpers/util.js"

if (isNode()) {
  const { runCLI } = await import("./cli.js")
  await runCLI()
}

// Export the things that are most useful for building packs in the browser
export {
  generateResourcePacks,
  generateStats,
  validateFixes,
} from "./builder.js"
export { MinecraftVersionRange } from "./classes/minecraftVersions.js"
