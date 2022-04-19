import fetch from "node-fetch"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import * as path from "node:path"

abstract class Transformer {
  callback

  constructor(callback: (data: TransformerCallbackData) => TransformerResult) {
    this.callback = callback
  }
}

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
class CustomTransformer extends Transformer {
  constructor(callback: (data: TransformerCallbackData) => string) {
    // Call the provided function and use the string it returns
    super((data) => ({ value: callback(data) }))
  }
}

/** Modify translation strings the old way! */
class OverrideTransformer extends Transformer {
  constructor(value: string) {
    // Just return the provided value
    super(() => ({ value }))
  }
}

/** Lets you apply multiple transformers to a single translation string */
class MultiTransformer extends Transformer {
  transformers

  constructor(transformers: Transformer[]) {
    super((data) => {
      let currentValue = data.oldValue

      // Run each transformer, providing it with the output from the previous one
      transformers.forEach((transformer) => {
        const result = transformer.callback({
          key: data.key,
          oldValue: currentValue,
        })

        // Update the current value
        currentValue = result.value
      })

      // currentValue shouldn't be null at this point, unless:
      // - The key is not present in the vanilla language file; and
      // - No transformers have touched it (i.e. none were provided)
      if (!currentValue)
        throw new Error(
          "No value returned from transformers. Were any transformers provided?"
        )

      // Return the final value and the original key
      return { value: currentValue, key: data.key }
    })

    this.transformers = transformers
  }
}

/**
 * Represents the start and end points of a range
 * @example
 * [3, 5] // Between 3 and 5
 * [3, null] // Anything after 3
 * [null, 5] // Anything before 5
 * [null, null] // Anything and everything
 */
type Range<T> = [T | null, T | null]
/** The output of a {@link Transformer} */
type TransformerResult = {
  value: string
}
/** The data provided to {@link Transformer} callback functions */
type TransformerCallbackData = {
  key: string
  oldValue: string | null
}
/** A single Minecraft language ID */
type MinecraftLanguage = string
/** A single Minecraft version ID */
type MinecraftVersion = string
/** Used to refer to a group, range, or single version of Minecraft */
type MinecraftVersionSpecifier = Range<MinecraftVersion> | MinecraftVersion
// Language files are a map of translation keys to string values
type LanguageFileData = Record<string, string>

interface FixOptions {
  /** The translation string that needs to be edited */
  key: string
  /** A "transformer" that declares the edits that need to be made to the specified translation string */
  transformer: Transformer
  /** Specifies the versions of Minecraft that the fix should be applied to (defaults to all versions) */
  versions?: MinecraftVersionSpecifier
  /** Specifies the languages that the fix should be applied to (defaults to all languages) */
  languages?: MinecraftLanguage[]
}

class Fix {
  data

  constructor(options: FixOptions) {
    this.data = options
  }
}

// https://stackoverflow.com/a/46842181/11519302
async function filter<T>(array: T[], predicate: (item: T) => Promise<boolean>) {
  const fail = Symbol()
  return (
    await Promise.all(
      array.map(async (item) => ((await predicate(item)) ? item : fail))
    )
  ).filter((i) => i !== fail) as T[]
}

async function resolveMinecraftVersionSpecifier(
  specifier: MinecraftVersionSpecifier
) {
  if (typeof specifier === "string") return [specifier]

  const [start, end] = specifier
  const versionManifest = await getVersionManifest()
  const versions = versionManifest.versions.map((v) => v.id).reverse()

  const startIndex = start ? versions.indexOf(start) : 0
  const endIndex = end ? versions.indexOf(end) : versions.length

  return versions.slice(startIndex, endIndex + 1)
}

async function getVanillaLanguageFile(
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

async function getCachedFile(filePath: string) {
  // Make sure that the .cache directory exists
  await ensureDir(".cache")

  const fullFilePath = path.join(".cache", ...filePath.split("/"))
  return await readFile(fullFilePath, "utf8").catch(() => {
    return null
  })
}

/**
 * Creates a directory if it does not already exist
 * @returns true if the directory already existed; false if it was created
 */
function ensureDir(path: string): Promise<boolean> {
  return mkdir(path)
    .then(() => true)
    .catch((e) => {
      return e.code === "EEXIST" ? false : e
    })
}

async function addToCache(filePath: string, contents: string) {
  // Make sure that the .cache directory exists
  await ensureDir(".cache")

  const fullFilePath = path.join(".cache", ...filePath.split("/"))
  await writeFile(fullFilePath, contents)
}

async function generateTranslationStrings(
  targetVersion: MinecraftVersion,
  targetLanguage: MinecraftLanguage,
  fixes: Fix[]
) {
  const result: LanguageFileData = {}

  const originalLanguageFile = await getVanillaLanguageFile(
    targetLanguage,
    targetVersion
  )

  // Remove fixes that aren't for the target version
  fixes = await filter(fixes, async (fix) => {
    if (!fix.data.versions) return true
    const versions = await resolveMinecraftVersionSpecifier(fix.data.versions)
    return versions.includes(targetVersion)
  })

  console.log(
    `Generating language file for ${targetLanguage} (${targetVersion})`
  )

  // Remove fixes that aren't for the target language
  fixes = fixes.filter(
    (fix) => !fix.data.languages || fix.data.languages.includes(targetLanguage)
  )

  const fixKeyIsDuplicated = (fixes: Fix[], fix: Fix, index: number) =>
    fixes.filter((f, i) => f.data.key === fix.data.key && index > i).length
  const duplicateFixes = fixes.filter((fix, i) =>
    fixKeyIsDuplicated(fixes, fix, i)
  )

  duplicateFixes.forEach(({ data: { key } }) =>
    console.warn(`Translation key ${key} has multiple fixes that target it`)
  )

  fixes.forEach(({ data: { key, transformer } }) => {
    result[key] = transformer.callback({
      key,
      oldValue: originalLanguageFile[key] ?? null,
    }).value

    if (result[key] === originalLanguageFile[key])
      console.warn(
        `Result of the transformer for translation key ${key} is the same as the vanilla value.`,
        `Transformer used: ${
          Object.getPrototypeOf(transformer).constructor.name
        }`
      )
  })

  return result
}

function generateLanguageFilesData(
  targetVersion: MinecraftVersion,
  targetLanguages: MinecraftLanguage[],
  fixes: Fix[]
) {
  return Promise.all(
    targetLanguages.map((language) =>
      generateTranslationStrings(targetVersion, language, fixes)
    )
  )
}

async function generateMultipleVersionsLanguageFileData(
  targetVersions: MinecraftVersionSpecifier,
  targetLanguages: MinecraftLanguage[],
  fixes: Fix[]
) {
  const versions = await resolveMinecraftVersionSpecifier(targetVersions)

  const versionedLanguageFiles = await Promise.all(
    versions.map((version) =>
      generateLanguageFilesData(version, targetLanguages, fixes)
    )
  )

  /**
   * A map of versions to a map of languages to sets of translations.
   * Looks like this:
   * ```json
   * {
   *   "1.14.4": {
   *     "en_us": {
   *       "gui.yes": "Yes",
   *       "gui.no": "No",
   *       // More translation strings...
   *     },
   *     "en_gb": { ... },
   *     "fr_fr": { ... },
   *     // More languages...
   *   },
   *   "1.15.1": { ... },
   *   // More versions...
   * ```
   */
  const result: Record<string, Record<string, LanguageFileData>> = {}

  versionedLanguageFiles.forEach((languageFiles, i) => {
    // Initialize an object to store this version's language files
    const languages: Record<string, LanguageFileData> = {}

    // Add each language file to the object
    languageFiles.forEach(
      (languageFile, i) => (languages[targetLanguages[i]] = languageFile)
    )

    // Add the current version's language files to the result
    result[versions[i]] = languages
  })

  return result
}

const cache = new Map<string, any>()

const fixes = [
  new Fix({
    key: "test",
    transformer: new OverrideTransformer("test"),
    versions: ["22w12a", "22w14a"],
  }),
  new Fix({
    key: "gui.yes",
    transformer: new MultiTransformer([
      // Adds an exclamation mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}!`),
      // Adds a question mark to the end
      new CustomTransformer(({ oldValue }) => `${oldValue}?`),
    ]),
  }),
  new Fix({
    key: "item.minecraft.baked_potato",
    transformer: new OverrideTransformer("Baked Jacket Potato"),
    languages: ["en_gb"],
  }),
]

console.log(
  JSON.stringify(
    await generateMultipleVersionsLanguageFileData(
      ["22w14a", "22w15a"],
      ["en_us", "en_gb"],
      fixes
    ),
    null,
    2
  )
)
