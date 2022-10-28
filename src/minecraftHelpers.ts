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
export type MinecraftVersionFilter = {
  type?: MinecraftVersionType
}
/** Refers to a single version of minecraft, through a version number as a string or object, or a {@link MinecraftVersionTarget} */
export type SingleMinecraftVersionSpecifier =
  | MinecraftVersion
  | MinecraftVersionTarget
  | NumericMinecraftVersion
/** Used to refer to a group, range, or single version of Minecraft */
export type MinecraftVersionSpecifier =
  | Range<SingleMinecraftVersionSpecifier>
  | MinecraftVersionFancyRange
  | SingleMinecraftVersionSpecifier
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

export interface MinecraftVersionFancyRange
  extends FancyRange<SingleMinecraftVersionSpecifier> {
  /** Only include versions that also match a specified Minecraft version filter */
  filter?: MinecraftVersionFilter
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

export enum MinecraftVersionType {
  Release = "release",
  /** Any development version, i.e. snapshots, pre-releases or release candidates */
  Development = "development",
  /** A snapshot, i.e. an early development version named in the format 22w45a. If you want to include pre-releases and release candidates, use {@link MinecraftVersionType.Development}. */
  Snapshot = "snapshot",
  PreRelease = "pre-release",
  ReleaseCandidate = "release-candidate",
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

export function getVersion(target: MinecraftVersion | number): VersionInfo {
  const matchedVersion = versionsSummary.find((version) =>
    typeof target === "string"
      ? version.id === target
      : version.data_version === target
  )

  if (typeof target === "number")
    target.toString = () => `data version #${target}`

  if (!matchedVersion)
    throw new Error(
      `Could not find version information for ${target}. Only versions since 1.14 are available.`
    )

  return matchedVersion
}

export function findVersionInfo(targetVersion: string): VersionInfo {
  const matchedVersion = versionsSummary.find(
    (version) =>
      version.id === targetVersion ||
      version.name === targetVersion ||
      version.sha1 === targetVersion
  )

  if (!matchedVersion)
    throw new Error(
      `Could not find a matching version ID, name or hash: ${targetVersion}`
    )

  return matchedVersion
}

/** Normalises a version name, returning an ID */
export function toVersionID(targetVersion: string) {
  return findVersionInfo(targetVersion).id
}

/** Gets the data version ("index") of a version name/id/hash */
export function findVersionIndex(targetVersion: string) {
  return findVersionInfo(targetVersion).data_version
}

export function checkMinecraftVersionTypes(
  targetVersion: string,
  testType: MinecraftVersionType
) {
  const { type, id } = findVersionInfo(targetVersion)

  if (testType === MinecraftVersionType.Development) return type !== "release"
  if (testType === MinecraftVersionType.Release) return type === "release"

  if (testType === MinecraftVersionType.PreRelease) return /.*-pre\d+/.test(id)
  if (testType === MinecraftVersionType.ReleaseCandidate)
    return /.*-rc\d+/.test(id)
  if (testType === MinecraftVersionType.Snapshot)
    return /\d+w\d+[a-z]+/.test(id)

  return false
}

export function isSingleVersionSpecifier(
  specifier: MinecraftVersionSpecifier
): specifier is SingleMinecraftVersionSpecifier {
  return (
    typeof specifier === "string" || "type" in specifier || "main" in specifier
  )
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

export async function resolveSingleMinecraftVersionSpecifier(
  specifier: SingleMinecraftVersionSpecifier
): Promise<string> {
  if (typeof specifier === "string")
    return await resolveMinecraftVersionId(specifier)
  if ("type" in specifier) return await getLatestVersion(specifier.branch)
  if ("main" in specifier)
    return await resolveNumericMinecraftVersion(specifier)

  throw new Error(`Invalid version specifier!`)
}

export async function resolveMinecraftVersionSpecifier(
  specifier: MinecraftVersionSpecifier | undefined
): Promise<string[]> {
  if (!specifier) return []

  if (isSingleVersionSpecifier(specifier))
    return [await resolveSingleMinecraftVersionSpecifier(specifier)]

  const matchingVersions = isSimpleRange(specifier)
    ? await resolveMinecraftVersionSimpleRange(specifier)
    : await resolveMinecraftVersionFancyRange(specifier)

  return matchingVersions
}

export async function resolveMinecraftVersionSimpleRange(
  range: StartAndEnd<SingleMinecraftVersionSpecifier>,
  options: {
    removeStart?: boolean
    removeEnd?: boolean
  } = {}
) {
  const { removeStart = false, removeEnd = true } = options

  // Don't return any items if no range was provided
  if (!range) return []

  const versionManifest = await getVersionManifest()
  const versions: string[] = versionManifest.versions.map((v) => v.id).reverse()

  const [startSpecifier, endSpecifier] = range
  const start = startSpecifier
    ? await resolveSingleMinecraftVersionSpecifier(startSpecifier)
    : null
  const end = endSpecifier
    ? await resolveSingleMinecraftVersionSpecifier(endSpecifier)
    : null

  let startIndex = start ? versions.indexOf(start) : 0
  let endIndex = end ? versions.indexOf(end) : versions.length
  endIndex++

  if (removeStart) startIndex++
  if (removeEnd) endIndex--

  if (endIndex < startIndex)
    throw new Error(
      `Invalid version range! Range end (${end}) is newer than range start (${start}).`
    )

  return versions.slice(startIndex, endIndex)
}

export async function resolveMinecraftVersionFancyRange(
  range: MinecraftVersionFancyRange
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

  if (!range.filter) return filteredRange

  return filteredRange.filter((version) => {
    if (range.filter?.type)
      return checkMinecraftVersionTypes(version, range.filter.type)
    return true
  })
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

  // Get the language file from the mcmeta repository
  const url = `https://raw.githubusercontent.com/misode/mcmeta/${version}-assets-json/assets/minecraft/lang/${language}.json`
  const languageFile = await fetch(url).then((res) =>
    res.status === 404 ? null : res.json()
  )

  // Throw if the request 404'd
  if (!languageFile)
    throw new Error(
      `Could not find language file (${language}.json) in mcmeta repository. Does the language exist?\n` +
        `If the targeted version (${version}) is very new (<15m) the repository may not be updated yet.\n` +
        url
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

export function packFormat(version: MinecraftVersion) {
  const versionInfo = getVersion(version)
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

/**
 * This isn't an actual Minecraft version, but it represents an upcoming version that hasn't been released yet.
 * When bug reports are fixed, they are often marked as fixed on Mojira before the version containing that fix has been released,
 * so the fix version is set to "Future Update".
 */
export const FUTURE_VERSION = Symbol("futureVersion")

/**
 * Returns true if the provided version string is a future version
 * (see {@link FUTURE_VERSION} for more info) and not an actual version.
 */
export function isFutureVersion(version: string) {
  /**
   * Before 6 September 2022, future versions were named like "Future Version 1.15+"
   * (which would refer to a snapshot for 1.15). This regex matches those versions.
   */
  const oldFutureVersionFormat = /Future Version 1\.\d+\+/gm
  return version === "Future Update" || oldFutureVersionFormat.test(version)
}
