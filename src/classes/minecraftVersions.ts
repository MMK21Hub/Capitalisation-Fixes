import {
  MinecraftVersion,
  SingleMinecraftVersionSpecifier,
  getVersionManifest,
  resolveSingleMinecraftVersionSpecifier,
} from "../helpers/minecraftHelpers.js"
import { StartAndEnd } from "../helpers/util.js"

export type MinecraftVersionFancyRangeTemplate = {
  start?: MinecraftVersion
  end?: MinecraftVersion
  exclude?: MinecraftVersionRange
  include?: MinecraftVersionRange
  exclusiveStart?: boolean
  exclusiveEnd?: boolean
}

export type MinecraftVersionSimpleRangeTemplate = StartAndEnd<MinecraftVersion>

export type MinecraftVersionRangeTemplate =
  | MinecraftVersionSimpleRangeTemplate
  | MinecraftVersionFancyRangeTemplate

export const DEFAULT_EXCLUSIVE_START = false
export const DEFAULT_EXCLUSIVE_END = true

export function templateIsSimple(
  specifier: MinecraftVersionRangeTemplate
): specifier is MinecraftVersionSimpleRangeTemplate {
  if (!Array.isArray(specifier)) return false
  return typeof specifier[0] !== "object" || specifier[0] === null
}

export function toFancyTemplate(
  template:
    | MinecraftVersionSimpleRangeTemplate
    | MinecraftVersionFancyRangeTemplate
): MinecraftVersionFancyRangeTemplate {
  if (!templateIsSimple(template)) return template

  const [startSpecifier, endSpecifier] = template
  return {
    start: startSpecifier || undefined,
    end: endSpecifier || undefined,
    exclusiveStart: DEFAULT_EXCLUSIVE_START,
    exclusiveEnd: DEFAULT_EXCLUSIVE_END,
  }
}

/**
 * Takes a pair of Minecraft version specifiers and returns an array of Minecraft version IDs,
 * which includes all versions that are chronologically between the first and second specifier
 * provided.
 * @param startSpecifier The version to start the resulting array at, see {@link DEFAULT_EXCLUSIVE_START}
 * @param endSpecifier The version to end the resulting array at, see {@link DEFAULT_EXCLUSIVE_END}
 * @param options Allows you to specify if the start and end versions should be included or excluded
 * @returns An array of Minecraft version IDs
 */
async function getVersionsInBetween(
  startSpecifier: SingleMinecraftVersionSpecifier | undefined,
  endSpecifier: SingleMinecraftVersionSpecifier | undefined,
  options: {
    excludeStart?: boolean
    excludeEnd?: boolean
  } = {}
): Promise<MinecraftVersion[]> {
  const {
    excludeStart = DEFAULT_EXCLUSIVE_START,
    excludeEnd = DEFAULT_EXCLUSIVE_END,
  } = options

  // Don't return any items if no range was provided
  if (!startSpecifier && !endSpecifier) return []

  // Don't include April Fools updates
  const jokeVersions = ["23w13a_or_b"]

  // Get all version IDs, in chronological order, from the launcher meta
  const versionManifest = await getVersionManifest()
  const versions: string[] = versionManifest.versions.map((v) => v.id).reverse()

  // Turn the version specifier pair into actual version IDs
  const start = startSpecifier
    ? await resolveSingleMinecraftVersionSpecifier(startSpecifier)
    : null
  const end = endSpecifier
    ? await resolveSingleMinecraftVersionSpecifier(endSpecifier)
    : null

  // Calculate the indexes of the subarray that we need to grab
  let startIndex = start ? versions.indexOf(start) : 0
  let endIndex = end ? versions.indexOf(end) : versions.length
  endIndex++

  if (excludeStart) startIndex++
  if (excludeEnd) endIndex--

  if (endIndex < startIndex)
    throw new Error(
      `Invalid version range! Range end (${end}) is newer than range start (${start}).`
    )

  return versions
    .slice(startIndex, endIndex)
    .filter((version) => !jokeVersions.includes(version))
}

export class MinecraftVersionRange {
  start
  end
  includeRanges
  excludeRanges
  exclusiveStart
  exclusiveEnd

  async getVersionIds(): Promise<MinecraftVersion[]> {
    const baseRange = await getVersionsInBetween(this.start, this.end, {
      excludeStart: this.exclusiveStart,
      excludeEnd: this.exclusiveEnd,
    })

    // Both of these are arrays of arrays of version IDs, i.e. version IDs grouped by the
    // exclusion or inclusion range that they came from. May contain duplicates.
    const versionsToInclude = await Promise.all(
      this.includeRanges.map((range) => range.getVersionIds())
    )
    const versionsToExclude = await Promise.all(
      this.excludeRanges.map((range) => range.getVersionIds())
    )

    // Add any items that need to be included, then exclude any items that need to be excluded
    const processedRange = baseRange
      .concat(versionsToInclude.flat())
      .filter((version) => !versionsToExclude.flat().includes(version))

    return processedRange
  }

  constructor(template: MinecraftVersionRangeTemplate) {
    template = toFancyTemplate(template)
    this.start = template.start
    this.end = template.end
    this.includeRanges = template.include ? [template.include] : []
    this.excludeRanges = template.exclude ? [template.exclude] : []
    this.exclusiveStart = template.exclusiveStart
    this.exclusiveEnd = template.exclusiveEnd
  }
}

// const range = new MinecraftVersionRange(["1.19.3", "1.19.4"])
// const allVersions = await range.getVersionIds()
// debugger
