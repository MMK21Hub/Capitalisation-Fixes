/**
 * @file Responsible for actually building the resource pack. This is where the magic happens.
 *
 * The build process in this file goes from the bottom to the top:
 * - It starts with with `emitResourcePacks`, the function that is called by the CLI.
 * - It ends with `generateTranslationStrings`, which generates a language file for a single language and a single Minecraft version.
 */
import {
  getTranslationStringOrThrow,
  getVanillaLanguageFile,
  LanguageFileData,
  MinecraftLanguage,
  MinecraftVersionId,
  MinecraftVersionSpecifier,
  packFormat,
  resolveMinecraftVersionSpecifier,
  ResourcePackMetadata,
} from "./helpers/minecraftHelpers.js"
import { FunctionMaybe, filter } from "./helpers/util.js"
import TransformerLogger, { MessageType } from "./classes/TransformerLogger.js"
import type Fix from "./classes/Fix.js"
import { DebugTask } from "./classes/DebugReport.js"
import { MinecraftVersionRange } from "./classes/minecraftVersions.js"
import { debugReport } from "./debugReport.js"
import JSZip from "jszip"

/** The output of a {@link Transformer} */
export type TransformerResult = {
  value: string
}
/** The data provided to {@link Transformer} callback functions */
export type TransformerCallbackData = {
  key: string
  language: MinecraftLanguage
  version: MinecraftVersionId
  oldValue: string
  logger: TransformerLogger
  languageFileData: Record<string, string>
}

export type TransformerCallback = (
  data: TransformerCallbackData
) => TransformerResult | Promise<TransformerResult>

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

interface BuildOptions {
  // Pack options:
  targetVersions: MinecraftVersionRange
  targetLanguages: MinecraftLanguage[]
  /** The Capitalisation Fixes version that this pack shall be branded as */
  packVersion?: string
  /** The description string to go into the `pack.mcmeta` */
  packDescription: string
  filename?: FunctionMaybe<string, [string, string?]>
  assets: {
    readme: Uint8Array
    packPng: Uint8Array
  }
  // Printing options:
  /** Set to print less output. False by default. */
  // TODO: Support setting this with a command-line flag (for new-version.sh)
  quiet?: boolean
  // Filesystem options:
  directory?: string
  clearDirectory?: boolean
}

export type OutFileIndex = Map<string, OutFileMetadata>

export interface OutFileMetadata {
  /**
   * The version of Minecraft that the pack is built for.
   * Has to be a single, literal Minecraft version ID (not a version specifier).
   * @example "1.19.1-pre1"
   */
  minecraftVersion: MinecraftVersionId
  /**
   * The version of that the pack is branded with, i.e. the current version of Capitalisation Fixes.
   * Some built resource packs don't have a version number, e.g. ones built for development of the pack.
   * @example "v2.13"
   */
  versionBrand?: string
  /**
   * The "position" of this file amongst all the files that were generated in this run.
   * A smaller number means that the target version is older.
   */
  index: number
  /**
   * The number of files that were generated in this run. Useful when combined with the {@link index}.
   */
  totalFiles: number
}

let mainTask: DebugTask | null = null

export abstract class Transformer {
  callback

  constructor(callback: TransformerCallback) {
    this.callback = callback
  }
}

async function generateTranslationStrings(
  targetVersion: MinecraftVersionId,
  targetLanguage: MinecraftLanguage,
  fixes: Fix[]
): Promise<LanguageFileData> {
  // TODO: Option somewhere to warn if translation string isn't in vanilla
  const brand = `${targetVersion} ${targetLanguage}`

  const result: LanguageFileData = {}

  const originalLanguageFile = await getVanillaLanguageFile(
    targetLanguage,
    targetVersion
  )

  // Remove fixes that aren't for the target version
  fixes = await filter(fixes, async (fix) => {
    if (fix.versions.isUnconstrained()) return true
    const versions = await fix.versions.getVersionIds()
    return versions.includes(targetVersion)
  })

  // Remove fixes that aren't for the target language
  fixes = fixes.filter(
    (fix) => !fix.languages || fix.languages.includes(targetLanguage)
  )

  for (const { key, transformer } of fixes) {
    const transformerName = Object.getPrototypeOf(transformer).constructor.name
    const logger = new TransformerLogger()

    const oldValue =
      originalLanguageFile[key] ||
      (await getTranslationStringOrThrow(key, {
        language: targetLanguage,
        version: targetVersion,
      }))

    let value: string | null | undefined

    try {
      const result = await transformer.callback({
        key,
        oldValue,
        logger,
        version: targetVersion,
        language: targetLanguage,
        languageFileData: originalLanguageFile,
      })
      value = result.value
    } catch (error) {
      // This is were exceptions from transformer callbacks end up.
      // We could do some fancier error handling her ein the future.
      throw error
    }

    if (value === "") {
      debugger
      throw new Error(
        `[${brand}] ${transformerName} returned an empty string!\n` +
          `Translation key being processed: ${key}`
      )
    }

    result[key] = value

    if (logger.countMessages(MessageType.Warn)) {
      console.group(
        `[${brand}] ${transformerName} produced warning(s) while processing ${key}`
      )

      logger
        .getMessages(MessageType.Warn)
        .forEach((msg) =>
          console.warn(`[${msg.timestamp.simpleTime()}] ${msg.message}`)
        )

      console.groupEnd()
    }

    if (logger.countMessages(MessageType.Error)) {
      console.group(
        `[${brand}] ${transformerName} produced error(s) while processing ${key}:`
      )

      logger
        .getMessages(MessageType.Error)
        .forEach((msg) =>
          console.error(`[${msg.timestamp.simpleTime}] ${msg.message}`)
        )

      console.groupEnd()
    }

    if (
      result[key] === originalLanguageFile[key] &&
      targetLanguage === "en_us"
    ) {
      console.warn(
        `[${brand}]`,
        `${key} is unchanged from the vanilla value (using ${transformerName}):`,
        `"${result[key]}"`
      )
      debugger
    }
  }

  return result
}

function generateLanguageFilesData(
  targetVersion: MinecraftVersionId,
  targetLanguages: MinecraftLanguage[],
  fixes: Fix[]
) {
  return Promise.all(
    targetLanguages.map((language) =>
      generateTranslationStrings(targetVersion, language, fixes)
    )
  )
}

export async function generateMultipleVersionsLanguageFileData(
  targetVersions: MinecraftVersionRange,
  targetLanguages: MinecraftLanguage[],
  fixes: Fix[]
) {
  const languageFileGenerationTask = mainTask?.push({
    type: "generateMultipleVersionsLanguageFileData",
    name: "Generating the language files for each version",
  })

  console.log("Building the packs...")

  const versions = await targetVersions.getVersionIds()

  const versionedLanguageFiles = await Promise.all(
    versions.map((version, index) => {
      const promise = generateLanguageFilesData(version, targetLanguages, fixes)
      languageFileGenerationTask?.push({
        type: "generateLanguageFileSet",
        data: {
          targetLanguages,
          targetVersion: version,
        },
        trace: index,
        name: `Generating language files for ${version}`,
        promise: promise,
      })
      return promise
    })
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

  languageFileGenerationTask?.end()
  return result
}

async function generatePackZipData(
  languageFiles: Record<string, LanguageFileData>,
  packMetadata: ResourcePackMetadata,
  metaFiles?: MetaFiles
) {
  const zip = new JSZip()

  // Add each "meta file" to the zip
  if (metaFiles)
    Object.entries(metaFiles).forEach(([path, contents]) =>
      zip.file(path, contents)
    )

  // Add the pack.mcmeta
  zip.file("pack.mcmeta", JSON.stringify(packMetadata, null, 4))

  // Add each language file to the zip
  Object.entries(languageFiles).forEach(([language, languageFile]) => {
    const fileContents = JSON.stringify(languageFile, null, 4)
    zip.file(`assets/minecraft/lang/${language}.json`, fileContents)
  })

  return zip
}

export type MetaFiles = Record<string, Uint8Array>

async function generateMultiplePackZipData(
  versionedLanguageFiles: LanguageFileBundle,
  metaFiles: MetaFiles,
  packDescription: string
) {
  const result: Record<string, JSZip> = {}

  await Promise.all(
    Object.entries(versionedLanguageFiles).map(
      async ([version, languageFiles]) => {
        const metadata = {
          pack: {
            description: packDescription,
            pack_format: packFormat(version),
          },
        }

        // Add the current version's language files to the result
        result[version] = await generatePackZipData(
          languageFiles,
          metadata,
          metaFiles
        )
      }
    )
  )

  return result
}

/** Saves an index of the generated zip files to the outputDir */
async function emitOutFileIndex(index: OutFileIndex, outputDir: string) {
  const path = await import("node:path")
  const { writeFile } = await import("node:fs/promises")

  const filename = "index.json"
  const data = JSON.stringify(Array.from(index.entries()))
  const filePath = path.join(outputDir, filename)
  await writeFile(filePath, data, "utf-8")
}

/** Perform validation on the provided fixes */
export async function validateFixes(fixes: Fix[]) {
  const validateFixesTask = mainTask?.push({
    type: "emitResourcePacks.validateFixes",
    name: "Validating the fixes",
  })
  console.log("Validating the fixes...")
  const validationPromise = validateFixesTask?.addPromise(
    Promise.all(
      fixes.map(async (fix) => {
        const debugTask = await fix.validateLinkedBug()
        if (debugTask) validateFixesTask?.pushRaw(debugTask)
      })
    )
  )
  return validationPromise
}

/** Builds a set of resource packs according to the provided build options. Returns the in-memory ZIP file representations. */
export async function generateResourcePacks(
  fixes: Fix[],
  buildOptions: BuildOptions
): Promise<{ [version: string]: JSZip }> {
  const languageFiles = await generateMultipleVersionsLanguageFileData(
    buildOptions.targetVersions,
    buildOptions.targetLanguages,
    fixes
  )

  // Print a summary of the generated language files
  if (!buildOptions.quiet) {
    const langFileEntries = Object.entries(languageFiles)
    console.log(
      `Generated translation files for ${langFileEntries.length} version(s):`
    )
    const longestVersionName = Math.max(
      ...langFileEntries.map(([version]) => version.length)
    )
    langFileEntries.forEach(([version, langFiles]) => {
      const languages = Object.entries(langFiles)
        .map(([name, data]) => `${name} (${Object.keys(data).length})`)
        .join(", ")
      const versionPadded = `${version}:`.padEnd(longestVersionName + 1, " ")
      console.log(`  ${versionPadded} ${languages}`)
    })
  }

  // Grab the metadata file contents to be included in the zip files
  const metadataFiles: MetaFiles = {
    "pack.png": buildOptions.assets.packPng,
    "README.md": buildOptions.assets.readme,
  }
  // Generate the zip files (to memory)
  const zipFiles = await generateMultiplePackZipData(
    languageFiles,
    metadataFiles,
    buildOptions.packDescription
  )

  return zipFiles
}

/** Node.js only - Saves the provided (in-memory) zip files to the output directory at the end of a build */
async function saveResourcePacksToDisk(
  zipFiles: {
    [version: string]: JSZip
  },
  buildOptions: BuildOptions
) {
  const path = await import("node:path")
  const { writeFile } = await import("node:fs/promises")
  const { ensureDir, clearDir } = await import("./helpers/utilNode.js")

  const outputDir = buildOptions.directory || "out"
  /** A map of filenames to that file's metadata. */
  const zipFileIndex: OutFileIndex = new Map()

  // Prepare the output directory
  await ensureDir(outputDir)
  if (buildOptions.clearDirectory) await clearDir(outputDir, false)

  // Save each of the in-memory zip files to the disk
  const zipTasks = Object.entries(zipFiles).map(
    async ([version, zip], index) => {
      const suffix = buildOptions.packVersion
        ? `-${buildOptions.packVersion}`
        : ""
      const defaultFilename = `Capitalisation-Fixes${suffix}-${version}.zip`
      const filename =
        typeof buildOptions.filename === "function"
          ? buildOptions.filename(version, buildOptions.packVersion)
          : buildOptions.filename || defaultFilename
      const zipPath = path.join(outputDir, filename)

      const fileMetadata: OutFileMetadata = {
        minecraftVersion: version,
        versionBrand: buildOptions.packVersion,
        index,
        totalFiles: Object.values(zipFiles).length,
      }
      const infoFileContents = {
        ...fileMetadata,
        license: "CC0",
        licenseDescription: "Public-domain equivalent. No rights reserved.",
        url: "https://modrinth.com/resourcepack/capitalisation-fixes",
        source: "https://github.com/MMK21Hub/Capitalisation-Fixes",
      }
      const infoFile = JSON.stringify(infoFileContents, null, 4)
      zip.file("capitalisation_fixes.json", infoFile)

      // zip.writeZip(zipPath)
      const zipFileData = await zip.generateAsync({ type: "uint8array" })
      await writeFile(zipPath, zipFileData)
      zipFileIndex.set(filename, fileMetadata)
    }
  )
  await Promise.all(zipTasks)

  // Save the index.json file
  await emitOutFileIndex(zipFileIndex, outputDir)
}

export async function emitResourcePacks(
  fixes: Fix[],
  buildOptions: BuildOptions
) {
  mainTask = debugReport.push({
    type: "emitResourcePacks",
    name: "Building resource packs",
  })

  if (!buildOptions.packVersion)
    console.log(
      "Building development variants of the pack (for published releases, you should set a version number)"
    )

  // Validation needs to be complete before we start processing the fixes
  await validateFixes(fixes)
  // Generate the packs
  const zipFiles = await generateResourcePacks(fixes, buildOptions)
  // Save the packs as real zip files in the output directory
  await saveResourcePacksToDisk(zipFiles, buildOptions)

  mainTask.end()
}

export async function generateStats(
  fixes: Fix[],
  filter: {
    version?: MinecraftVersionSpecifier
    language?: MinecraftLanguage[]
  } = {}
) {
  async function checkVersion(fix: Fix) {
    if (!versions) return true
    if (fix.versions.isUnconstrained()) return true

    const fixVersions = await fix.versions.getVersionIds()
    return fixVersions.some((version) => versions.includes(version))
  }

  async function checkLanguage(fix: Fix) {
    if (!languages) return true
    if (!fix.languages) return true

    return fix.languages.some((language) => languages.includes(language))
  }

  async function processFix(fix: Fix) {
    const versionMatch = await checkVersion(fix)
    const languageMatch = await checkLanguage(fix)
    if (!versionMatch || !languageMatch) return

    if (fix.bug) bugReports.add(fix.bug)
    translationKeys.add(fix.key)
  }

  console.log("Generating stats...")
  const versions = filter.version
    ? await resolveMinecraftVersionSpecifier(filter.version)
    : null
  const languages = filter.language || null

  const bugReports = new Set<string>()
  const translationKeys = new Set<string>()

  await Promise.all(fixes.map(processFix))

  return {
    bugReports,
    translationKeys,
    count: {
      bugReports: bugReports.size,
      translationKeys: translationKeys.size,
    },
  }
}
