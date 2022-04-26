import AdmZip from "adm-zip"
import { readFile } from "fs/promises"
import path from "path"
import {
  getVanillaLanguageFile,
  LanguageFileData,
  MinecraftLanguage,
  MinecraftVersion,
  MinecraftVersionSpecifier,
  resolveMinecraftVersionSpecifier,
} from "./minecraftHelpers"
import { FunctionMaybe, filter, ensureDir, clearDir } from "./util"

/** The output of a {@link Transformer} */
type TransformerResult = {
  value: string
}
/** The data provided to {@link Transformer} callback functions */
type TransformerCallbackData = {
  key: string
  oldValue: string | null
}

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
export type LanguageFileBundle = Record<
  string,
  Record<string, LanguageFileData>
>

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

interface BuildOptions {
  targetVersions: MinecraftVersionSpecifier
  targetLanguages: MinecraftLanguage[]
  directory?: string
  packVersion?: string
  clearDirectory?: boolean
  filename?: FunctionMaybe<string, [string, string?]>
}

export abstract class Transformer {
  callback

  constructor(callback: (data: TransformerCallbackData) => TransformerResult) {
    this.callback = callback
  }
}

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
export class CustomTransformer extends Transformer {
  constructor(callback: (data: TransformerCallbackData) => string) {
    // Call the provided function and use the string it returns
    super((data) => ({ value: callback(data) }))
  }
}

/** Modify translation strings the old way! */
export class OverrideTransformer extends Transformer {
  constructor(value: string) {
    // Just return the provided value
    super(() => ({ value }))
  }
}

/** Lets you apply multiple transformers to a single translation string */
export class MultiTransformer extends Transformer {
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

export class Fix {
  data

  constructor(options: FixOptions) {
    this.data = options
  }
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

  // Log the translation strings that we just generated
  console.log(`=== ${targetVersion} ${targetLanguage} ===`)
  Object.entries(result).forEach(([key, value]) =>
    console.log(`${key}: "${value}"`)
  )
  console.log(" ")

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

  const result: LanguageFileBundle = {}

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

async function generatePackZipData(
  languageFiles: Record<string, LanguageFileData>,
  metaFiles: Record<string, Buffer>
) {
  const zip = new AdmZip()

  // Add each "meta file" to the zip
  Object.entries(metaFiles).forEach(([path, contents]) =>
    zip.addFile(path, contents)
  )

  // Add each language file to the zip
  Object.entries(languageFiles).forEach(([language, languageFile]) => {
    const fileContents = JSON.stringify(languageFile, null, 4)
    zip.addFile(
      `assets/minecraft/lang/${language}.json`,
      Buffer.from(fileContents)
    )
  })

  return zip
}

async function generateMultiplePackZipData(
  versionedLanguageFiles: LanguageFileBundle,
  metaFileDirectory: string
) {
  const result: Record<string, AdmZip> = {}

  // Include our pack.mcmeta, pack.png and readme files in the zip
  const metaFiles: Record<string, Buffer> = {}
  const metaFileNames = ["pack.mcmeta", "pack.png", "README.md"]
  for (const i in metaFileNames) {
    const file = metaFileNames[i]
    const filePath = path.join(metaFileDirectory, file)
    metaFiles[file] = await readFile(filePath)
  }

  await Promise.all(
    Object.entries(versionedLanguageFiles).map(
      async ([version, languageFiles]) => {
        // Add the current version's language files to the result
        result[version] = await generatePackZipData(languageFiles, metaFiles)
      }
    )
  )

  return result
}

export async function emitResourcePacks(
  fixes: Fix[],
  buildOptions: BuildOptions
) {
  const outputDir = buildOptions.directory || "out"

  // Prepare the output directory
  ensureDir(outputDir)
  if (buildOptions.clearDirectory) clearDir(outputDir)

  if (!buildOptions.packVersion)
    console.warn(
      "No pack version specified. Published builds should be branded with a version number."
    )

  const languageFiles = await generateMultipleVersionsLanguageFileData(
    buildOptions.targetVersions,
    buildOptions.targetLanguages,
    fixes
  )
  const zipFiles = await generateMultiplePackZipData(languageFiles, ".")

  Object.entries(zipFiles).forEach(([version, zip]) => {
    const suffix = buildOptions.packVersion
      ? `-${buildOptions.packVersion}`
      : ""
    const defaultFilename = `Capitalisation-Fixes${suffix}-${version}.zip`
    const filename =
      typeof buildOptions.filename === "function"
        ? buildOptions.filename(version, buildOptions.packVersion)
        : buildOptions.filename || defaultFilename
    const zipPath = path.join(outputDir, filename)
    zip.writeZip(zipPath)
  })
}
