import fetch from "node-fetch"
import path from "path"
import { cache, debugReport, versionsSummary } from "./main.js"
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
import { DebugTask } from "./DebugReport.js"

/** A single Minecraft language ID */
export type MinecraftLanguage = string
/** A single Minecraft version ID */
export type MinecraftVersion = string
/** The two update policies that can be selected in the official launcher */
export type MinecraftVersionBranch = "snapshot" | "release"
/** Specifies a "target" MC version that may change over time, e.g. the latest version */
export type MinecraftVersionTarget = {
  type: "latest"
  branch?: MinecraftVersionBranch
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

/** A value that can be resolved (asynchronously) to a value with type T, when provided a Minecraft version and a language. */
export type ContextSensitive<T> = ResolvableAsync<
  T,
  [MinecraftLanguage, MinecraftVersion]
>
/** A value that can be synchronously resolved to a value with type T, when provided with language file data. */
export type ContextSensitiveSync<T> = ResolvableSync<T, [LanguageFileData]>
/** Used to match parts of a translation string content (or anything really), but the search string can change based on the language/version being targeted. */
export type ContextSensitiveSearchValue = ContextSensitive<SearchValue>
/** A variant of {@link ContextSensitiveSearchValue}, where the language file data is directly provided to the resolver instead of the resolver having to fetch the data itself. */
export type ContextSensitiveSearchValueSync = ContextSensitiveSync<SearchValue>
/** A search value that may or may not be be context-sensitive, and may or may not have a synchronous resolver. */
export type FlexibleSearchValue =
  | ContextSensitiveSearchValue
  | ContextSensitiveSearchValueSync
  | SearchValue
/**
 * The function that can be provided as the second parameter to to `String#replace()`.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
 */
export type ReplacerFunction = (substring: string, groups: string[]) => string
export type FlexibleReplacer =
  | string
  | ContextSensitive<string>
  | ReplacerFunction

export type LanguageFileData = Record<string, string>
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

/** The data contained in Minecraft's version manifest: https://launchermeta.mojang.com/mc/game/version_manifest_v2.json */
export interface VersionManifest {
  latest: {
    snapshot: string
    release: string
  }
  versions: any[]
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

export function fetchVersionsSummary() {
  const task = debugReport.push({
    type: "fetchVersionsSummary",
    name: "Fetching Minecraft version information",
  })
  const dataPromise = fetch(
    "https://raw.githubusercontent.com/misode/mcmeta/summary/versions/data.min.json"
  ).then((res) => res.json())

  return task.addPromise(dataPromise) as Promise<VersionInfo[]>
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

  if (!matchedVersion) {
    debugger
    throw new Error(
      `Could not find a matching version ID, name or hash: ${targetVersion}`
    )
  }

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

/** Resolves a synchronous or async context-sensitive value by providing it with language file (meta)data. */
export async function resolveContextSensitiveValue<T>(
  value: ContextSensitive<T> | ContextSensitiveSync<T> | T,
  languageFileData: LanguageFileData,
  language: MinecraftLanguage,
  version: MinecraftVersion
): Promise<T> {
  if (value && typeof value === "object" && "resolve" in value)
    return value.sync
      ? value.resolve(languageFileData)
      : await value.resolve(language, version)
  return value
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
  // Don't include April Fools updates
  const jokeVersions = ["23w13a_or_b"]

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

  return versions
    .slice(startIndex, endIndex)
    .filter((version) => !jokeVersions.includes(version))
}

export async function resolveMinecraftVersionFancyRange(
  range: MinecraftVersionFancyRange
): Promise<string[]> {
  // Local function shorthands:
  const resolveRange = resolveMinecraftVersionSimpleRange

  // Don't include April Fools updates
  const jokeVersions = ["23w13a_or_b"]

  const start = range.start || null
  const end = range.end || null

  const fullRange = await resolveRange([start, end], {
    removeStart: range.exclusiveStart,
    removeEnd: range.exclusiveEnd,
  })

  const exclusionRange = await resolveMinecraftVersionSpecifier(range.exclude)
  const inclusionRange = await resolveMinecraftVersionSpecifier(range.include)

  // Remove any items that need to be excluded
  const processedRange = fullRange.filter(
    (ver) => !exclusionRange.includes(ver) || !jokeVersions.includes(ver)
  )
  // Add any items that need to be included
  processedRange.push(...inclusionRange)

  if (!range.filter) return processedRange

  // If a filter is present on the range, only return versions that match it
  return processedRange.filter((version) => {
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
  const cachedFilePath = `${version}/${language}.json`
  const cacheResult = await getCachedFile(cachedFilePath)

  if (cacheResult) {
    try {
      return JSON.parse(cacheResult)
    } catch (error) {
      // If we get an error upon reading the file, we simply re-fetch it
      console.error(`Failed to read cached file ${cachedFilePath}`)
    }
  }

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

async function getVersionManifest(): Promise<VersionManifest> {
  // If it's available in the cache, immediately return that
  if (cache.has("versionManifest")) return cache.get("versionManifest")

  const result = (await fetch(
    "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"
  ).then((res) => res.json())) as VersionManifest

  // Store the result in the cache for future calls of the function
  cache.set("versionManifest", result)

  // Remove versions that are older than 1.14, since 1.14 is the earliest version available in the version summary
  result.versions = result.versions.slice(0, -451)

  return result
}

export interface GetTranslationStringOptions {
  language: MinecraftLanguage
  version: MinecraftVersion
  fallbackLanguage?: MinecraftLanguage | null
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

export async function getTranslationStringOrThrow(
  key: string,
  options: GetTranslationStringOptions
) {
  const matchedTranslationString = await getTranslationString(key, options)

  if (!matchedTranslationString) {
    debugger
    throw new Error(
      `Translation string ${key} doesn't exist in version ${options.version}!`
    )
  }

  return matchedTranslationString
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
 *
 * Note: No functions actually return this value at the moment, instead choosing to ignore future versions.
 */
export const FUTURE_VERSION = Symbol("futureVersion")

/**
 * Returns true if the provided version name is a future version
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
