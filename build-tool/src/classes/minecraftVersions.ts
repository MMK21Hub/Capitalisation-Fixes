import {
  MinecraftVersionId,
  MinecraftVersionTarget,
  NumericMinecraftVersion,
  SingleMinecraftVersionSpecifier,
  getLatestVersion,
  getVersionManifest,
  resolveMinecraftVersionId,
  resolveSingleMinecraftVersionSpecifier,
} from "../helpers/minecraftHelpers.js"
import { PromiseMaybe, StartAndEnd, fromPromiseMaybe } from "../helpers/util.js"

export type MinecraftVersionFancyRangeTemplate = {
  start?: MinecraftVersionId
  end?: MinecraftVersionId
  only?: MinecraftVersionId
  exclude?: MinecraftVersionRange[]
  include?: MinecraftVersionRange[]
  exclusiveStart?: boolean
  exclusiveEnd?: boolean
}

export type MinecraftVersionSimpleRangeTemplate =
  StartAndEnd<MinecraftVersionId>

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
): Promise<MinecraftVersionId[]> {
  const {
    excludeStart = DEFAULT_EXCLUSIVE_START,
    excludeEnd = DEFAULT_EXCLUSIVE_END,
  } = options
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
  only
  includeRanges
  excludeRanges
  exclusiveStart
  exclusiveEnd

  async getVersionIds(): Promise<MinecraftVersionId[]> {
    if (this.only) return [this.only]

    const baseRange = this.isConstrained()
      ? this.start || this.end
        ? await getVersionsInBetween(this.start, this.end, {
            excludeStart: this.exclusiveStart,
            excludeEnd: this.exclusiveEnd,
          })
        : [] // Start with no versions if there isn't a `start` or `end`, but we do have other versions to include
      : await getVersionsInBetween(undefined, undefined, {
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

  isConstrained(): boolean {
    if (this.end || this.start || this.includeRanges.length !== 0) return true
    return false
  }

  isUnconstrained(): boolean {
    return !this.isConstrained()
  }

  constructor(template: MinecraftVersionRangeTemplate) {
    template = toFancyTemplate(template)
    this.start = template.start
    this.end = template.end
    this.only = template.only
    this.includeRanges = template.include || []
    this.excludeRanges = template.exclude || []
    this.exclusiveStart = template.exclusiveStart
    this.exclusiveEnd = template.exclusiveEnd
  }
}

export type MinecraftVersionTemplate =
  | MinecraftVersionId
  | MinecraftVersionTarget
  | NumericMinecraftVersion

abstract class MinecraftVersionResolvable {
  abstract getPossiblyValidId: () => PromiseMaybe<string>

  async getId() {
    const possiblyValidId = await fromPromiseMaybe(this.getPossiblyValidId())

    // We use resolveMinecraftVersionId() to throw if the version ID is invalid
    return resolveMinecraftVersionId(possiblyValidId)
  }
}

// This class is WIP. In the future it will replace raw version IDs.
class MinecraftVersion extends MinecraftVersionResolvable {
  id

  // @ts-ignore just so that it compiles
  getPossiblyValidId() {
    //
    return resolveMinecraftVersionId(this.id)
  }

  constructor(id: MinecraftVersionId) {
    super()
    this.id = id
  }
}
