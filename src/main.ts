import fetch from "node-fetch"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import * as path from "node:path"

abstract class Transformer {
  callback

  constructor(callback: (value: string) => TransformerResult) {
    this.callback = callback
  }
}

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
class CustomTransformer extends Transformer {
  constructor(callback: (value: string) => TransformerResult) {
    super(callback)
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
    super((value) => {
      let newValue = value
      for (const transformer of transformers) {
        newValue = transformer.callback(newValue).value
      }
      return { value: newValue }
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
/** A single Minecraft language ID */
type MinecraftLanguage = string
/** A single Minecraft version ID */
type MinecraftVersion = string
/** Used to refer to a group, range, or single version of Minecraft */
type MinecraftVersionSpecifier = Range<MinecraftVersion> | MinecraftVersion

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

async function getVanillaLanguageFile(
  language: MinecraftLanguage,
  version: MinecraftVersion
) {
  // If there is a file in the cache that matches the language and the version, use it
  const cacheResult = await getCachedFile(`${language}/${version}.json`)
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
  ensureDir(path.join(".cache", language)).then(() => {
    const filePath = path.join(language, `${version}.json`)
    addToCache(filePath, JSON.stringify(languageFile))
  })
}

function getVersionManifest() {
  return fetch(
    "https://launchermeta.mojang.com/mc/game/version_manifest_v2.json"
  ).then((res) => res.json()) as Promise<{
    latest: { snapshot: string; release: string }
    versions: any[]
  }>
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

function generateTranslationStrings(fixes: Fix[]) {
  const result: Record<string, string> = {}
  fixes.forEach(({ data: { key, transformer } }) => {
    console.log(`Generating translation string: ${key}`)
    result[key] = transformer.callback(key).value
  })
  return result
}

console.log(
  generateTranslationStrings([
    new Fix({
      key: "test",
      transformer: new OverrideTransformer("test"),
    }),
  ])
)
