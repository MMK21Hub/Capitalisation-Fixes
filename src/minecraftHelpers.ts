import fetch from "node-fetch"
import path from "path"
import { cache } from "./main.js"
import {
  FancyRange,
  StartAndEnd,
  Range,
  addToCache,
  ensureDir,
  getCachedFile,
  Resolvable,
  SearchValue,
} from "./util.js"

/** A single Minecraft language ID */
export type MinecraftLanguage = string
/** A single Minecraft version ID */
export type MinecraftVersion = string
/** Used to refer to a group, range, or single version of Minecraft */
export type MinecraftVersionSpecifier =
  | Range<MinecraftVersion>
  | MinecraftVersion
// Language files are a map of translation keys to string values
export type LanguageFileData = Record<string, string>
/** Used to match parts of a translation string content (or anything really), but the search string can change based on the language/version being targeted. */
export type ContextSensitiveSearchValue = Resolvable<
  SearchValue,
  [MinecraftLanguage, MinecraftVersion]
>

export class UseTranslationString {
  readonly string

  async resolve(language: MinecraftLanguage, version: MinecraftVersion) {
    const langFile = await getVanillaLanguageFile(language, version)
    return langFile[this.string]
  }

  constructor(string: string) {
    this.string = string
  }
}

export function lang(
  textFragments: TemplateStringsArray,
  ...substitutions: string[]
) {
  return {
    async resolve(language: MinecraftLanguage, version: MinecraftVersion) {
      const langFile = await getVanillaLanguageFile(language, version)
      let result = ""

      textFragments.forEach((text, i) => {
        const nextTranslationKey = substitutions?.at(i)
        result += text
        result += nextTranslationKey ? langFile[nextTranslationKey] : ""
      })

      return result
    },
  }
}

export async function resolveMinecraftVersionSpecifier(
  specifier: MinecraftVersionSpecifier | undefined
) {
  if (!specifier) return []
  if (typeof specifier === "string") return [specifier]

  const isSimpleRange =
    Array.isArray(specifier) && typeof specifier[0] !== "object"

  const matchingVersions = isSimpleRange
    ? await resolveMinecraftVersionSimpleRange(specifier)
    : await resolveMinecraftVersionFancyRange(specifier as FancyRange<string>)

  return matchingVersions
}

export async function resolveMinecraftVersionSimpleRange(
  range: StartAndEnd<string>,
  options: {
    removeStart?: boolean
    removeEnd?: boolean
  } = {}
) {
  // Don't return any items if no range was provided
  if (!range) return []

  const [start, end] = range
  const versionManifest = await getVersionManifest()
  const versions: string[] = versionManifest.versions.map((v) => v.id).reverse()

  const startIndex = start ? versions.indexOf(start) : 0
  const endIndex = end ? versions.indexOf(end) : versions.length

  return versions.slice(startIndex, endIndex + 1)
}

export async function resolveMinecraftVersionFancyRange(
  range: FancyRange<string>
): Promise<string[]> {
  // Local function shorthands:
  const resolveRange = resolveMinecraftVersionSimpleRange

  const fullRange = await resolveRange([range.start, range.end], {
    removeStart: range.exclusiveStart,
    removeEnd: range.exclusiveEnd,
  })

  const exclusionRange = await resolveMinecraftVersionSpecifier(range.exclude)
  const inclusionRange = await resolveMinecraftVersionSpecifier(range.include)

  // Remove any items that need to be excluded
  const filteredRange = fullRange.filter((el) => !exclusionRange.includes(el))
  // Add any items that need to be included
  filteredRange.push(...inclusionRange)

  return filteredRange
}

export async function getVanillaLanguageFile(
  language: MinecraftLanguage,
  version: MinecraftVersion
): Promise<Record<string, string>> {
  // If there is a file in the cache that matches the language and the version, use it
  const cacheResult = await getCachedFile(`${version}/${language}.json`)
  if (cacheResult) return JSON.parse(cacheResult)

  // Get the specified version from the version manifest
  const versionManifest = await getVersionManifest()
  const versionMetadata = versionManifest.versions.find((v) => v.id === version)
  if (!versionMetadata)
    throw new Error(
      `Version does not exist: ${version}` +
        ` (${versionManifest.versions.length} versions available)`
    )

  // Get the language file from the minecraft-assets repository
  const languageFile = await fetch(
    `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${version}/assets/minecraft/lang/${language}.json`
  ).then((res) => (res.status === 404 ? null : res.json()))

  // Throw if the request 404'd
  if (!languageFile)
    throw new Error(
      `Could not find language file (${language}.json) in minecraft-assets repository. Does the language exist?`
    )

  // Asynchronously cache the language file
  ensureDir(path.join(".cache", version)).then(() => {
    const filePath = path.join(version, `${language}.json`)
    addToCache(filePath, JSON.stringify(languageFile))
  })

  return languageFile as any
}

function getVersionManifest(): Promise<{
  latest: { snapshot: string; release: string }
  versions: any[]
}> {
  // If it's available in the cache, immediately return that
  if (cache.has("versionManifest")) return cache.get("versionManifest")

  const result = fetch(
    "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"
  ).then((res) => res.json()) as any

  // Store the result in the cache for future calls of the function
  cache.set("versionManifest", result)

  return result
}
