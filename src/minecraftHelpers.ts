import fetch from "node-fetch"
import path from "path"
import { cache, versionsSummary } from "./main.js"
import {
  FancyRange,
  StartAndEnd,
  Range,
  addToCache,
  ensureDir,
  getCachedFile,
  ResolvableAsync,
  SearchValue,
  ResolvableSync,
  isSimpleRange,
} from "./util.js"

/** A single Minecraft language ID */
export type MinecraftLanguage = string
/** A single Minecraft version ID */
export type MinecraftVersion = string
/** Specifies a "target" MC version that may change over time, e.g. the latest version */
export type MinecraftVersionTarget = {
  type: "latest"
  branch?: "snapshot" | "release"
}
/** Represents a single MC version as a set of numbers, instead of a string */
export type NumericMinecraftVersion = {
  /** The first part of the version number. This is always 1. */
  main: 1
  /** The second part of the version number; corresponds with "major" named releases (e.g. the "14" in "1.14.2") */
  major: number
  /** The third part of the version number; corresponds with "minor" releases (e.g. the "2" in "1.14.2") */
  minor: number
  /** Extra information "attached" to the version number by a hyphen, for development releases. */
  attachment?: {
    type: "pre" | "rc"
    number: number
  }
}
/** Represents a single MC snapshot as a set of numbers, instead of a string. For pre-releases or release candidates, use a {@link NumericMinecraftVersion} */
export type NumericMinecraftSnapshot = {
  /** A two-digit number that corresponds with the year that the snapshot is from (e.g. the "22" in "22w11a") */
  year: number
  /** A two-digit number that corresponds with the week number of the week that the snapshot was released in (e.g. the "11" in "22w11a") */
  week: number
  /** A lowercase letter (a-z) that separates snapshots within the same week (e.g. the "a" in "22w11a") */
  letter: string
}
/** Used to refer to a group, range, or single version of Minecraft */
export type MinecraftVersionSpecifier =
  | Range<MinecraftVersion>
  | MinecraftVersion
  | MinecraftVersionTarget
  | NumericMinecraftVersion
export type LanguageFileData = Record<string, string>
/** Used to match parts of a translation string content (or anything really), but the search string can change based on the language/version being targeted. */
export type ContextSensitiveSearchValue = ResolvableAsync<
  SearchValue,
  [MinecraftLanguage, MinecraftVersion]
>
/** A variant of {@link ContextSensitiveSearchValue}, where the language file data is directly provided to the resolver instead of the resolver having to fetch the data itself. */
export type ContextSensitiveSearchValueSync = ResolvableSync<
  SearchValue,
  [LanguageFileData]
>
/** A search value that may or may not be be context-sensitive, and may or may not have a synchronous resolver. */
export type FlexibleSearchValue =
  | ContextSensitiveSearchValue
  | ContextSensitiveSearchValueSync
  | SearchValue
export type ResourcePackMetadata = {
  pack: {
    pack_format: number
    description: string
  }
}
/** Metadata about a specific Minecraft version, as sourced from https://github.com/misode/mcmeta/tree/summary/versions */
export interface VersionInfo {
  id: MinecraftVersion
  name: string
  release_target: MinecraftVersion
  type: "release" | "snapshot"
  stable: boolean
  data_version: number
  protocol_version: number
  data_pack_version: number
  resource_pack_version: number
  build_time: string
  release_time: string
  sha1: string
}
export interface PackMetaGenOptions {
  format: number
  description: string
}

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

export type ResolvableFromLangFile = {
  resolve(language: string, version: string): Promise<string>
}
export type ResolvableFromLangFileSync = {
  resolve(languageFileData: Record<string, string>): string
  sync: true
}

export function lang(translationString: string): ResolvableFromLangFile
export function lang(
  textFragments: TemplateStringsArray,
  ...substitutions: string[]
): ResolvableFromLangFile
export function lang(
  providedText: TemplateStringsArray | string,
  ...substitutions: string[]
): ResolvableFromLangFile {
  return {
    async resolve(language: MinecraftLanguage, version: MinecraftVersion) {
      const langFile = await getVanillaLanguageFile(language, version)

      if (typeof providedText === "string") return langFile[providedText]

      let result = ""
      providedText.forEach((text, i) => {
        const nextTranslationKey = substitutions?.at(i)
        result += text
        result += nextTranslationKey ? langFile[nextTranslationKey] : ""
      })
      return result
    },
  }
}

export async function getLatestVersion(
  type: "release" | "snapshot" = "snapshot"
): Promise<MinecraftVersion> {
  const versionManifest = await getVersionManifest()
  return versionManifest.latest[type]
}

export async function resolveFlexibleSearchValue(
  searchValue: FlexibleSearchValue,
  languageFileData: LanguageFileData,
  language: MinecraftLanguage,
  version: MinecraftVersion
): Promise<SearchValue> {
  if (typeof searchValue === "object" && "resolve" in searchValue)
    return searchValue.sync
      ? searchValue.resolve(languageFileData)
      : await searchValue.resolve(language, version)
  return searchValue
}

export async function resolveMinecraftVersionId<F = never>(
  version: string,
  fallback?: F
): Promise<string | F> {
  const manifest = await getVersionManifest()
  const versionMatch = manifest.versions.find((v) => v.id === version)
  if (versionMatch) return versionMatch.id
  if (fallback) return fallback
  throw new Error(`Invalid version identifier: ${version}`)
}

export function stringifyNumericMinecraftVersion({
  main,
  major,
  minor,
  attachment,
}: NumericMinecraftVersion): string {
  return attachment
    ? `${main}.${major}.${minor}-${attachment.type}${attachment.number}`
    : `${main}.${major}.${minor}`
}

export async function resolveNumericMinecraftVersion(
  version: NumericMinecraftVersion
) {
  const versionString = stringifyNumericMinecraftVersion(version)
  return resolveMinecraftVersionId(versionString)
}

export async function resolveMinecraftVersionSpecifier(
  specifier: MinecraftVersionSpecifier | undefined
): Promise<string[]> {
  if (!specifier) return []
  if (typeof specifier === "string")
    return [await resolveMinecraftVersionId(specifier)]
  if ("type" in specifier) return [await getLatestVersion(specifier.branch)]
  if ("main" in specifier)
    return [await resolveNumericMinecraftVersion(specifier)]

  const matchingVersions = isSimpleRange(specifier)
    ? await resolveMinecraftVersionSimpleRange(specifier)
    : await resolveMinecraftVersionFancyRange(specifier)

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

export async function getTranslationString(
  key: string,
  options: {
    language: MinecraftLanguage
    version: MinecraftVersion
    fallbackLanguage?: MinecraftLanguage | null
  }
) {
  const { language, version, fallbackLanguage = "en_us" } = options
  const langFile = await getVanillaLanguageFile(language, version)

  if (key in langFile) return langFile[key]

  if (!fallbackLanguage) return null
  if (language === fallbackLanguage) return null

  const fallbackLangFile = await getVanillaLanguageFile(
    fallbackLanguage,
    version
  )

  return fallbackLangFile[key] || null
}

export function getVersionInfo(version: MinecraftVersion): VersionInfo {
  const matchedVersion = versionsSummary.find((v) => v.id === version)
  if (!matchedVersion)
    throw new Error(
      `Could not find version information for ${version}. Only versions since 1.14 are available.`
    )
  return matchedVersion
}

export function packFormat(version: MinecraftVersion) {
  const versionInfo = getVersionInfo(version)
  return versionInfo["resource_pack_version"]
}

/** Generates the contents for a Minecraft-compatible `pack.mcmeta` file */
export function packMetadata(
  options: PackMetaGenOptions
): ResourcePackMetadata {
  const { format, description } = options
  return {
    pack: {
      pack_format: format,
      description,
    },
  }
}
