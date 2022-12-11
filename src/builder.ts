import path from "node:path"
import { readFile, writeFile } from "node:fs/promises"
import AdmZip from "adm-zip"
import {
  getTranslationStringOrThrow,
  getVanillaLanguageFile,
  LanguageFileData,
  MinecraftLanguage,
  MinecraftVersion,
  MinecraftVersionSpecifier,
  packFormat,
  resolveMinecraftVersionSpecifier,
  ResourcePackMetadata,
} from "./minecraftHelpers.js"
import { FunctionMaybe, filter, ensureDir, clearDir } from "./util.js"
import TransformerLogger, { MessageType } from "./TransformerLogger.js"
import type Fix from "./Fix.js"
import { packDescription } from "./main.js"

/** The output of a {@link Transformer} */
export type TransformerResult = {
  value: string
}
/** The data provided to {@link Transformer} callback functions */
export type TransformerCallbackData = {
  key: string
  language: MinecraftLanguage
  version: MinecraftVersion
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
  targetVersions: MinecraftVersionSpecifier
  targetLanguages: MinecraftLanguage[]
  directory?: string
  packVersion?: string
  clearDirectory?: boolean
  filename?: FunctionMaybe<string, [string, string?]>
}

export type OutFileIndex = Map<string, OutFileMetadata>

export interface OutFileMetadata {
  /**
   * The version of Minecraft that the pack is built for.
   * Has to be a single, literal Minecraft version ID (not a version specifier).
   * @example "1.19.1-pre1"
   */
  minecraftVersion: MinecraftVersion
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

export abstract class Transformer {
  callback

  constructor(callback: TransformerCallback) {
    this.callback = callback
  }
}

async function generateTranslationStrings(
  targetVersion: MinecraftVersion,
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
    if (!fix.versions) return true
    const versions = await resolveMinecraftVersionSpecifier(fix.versions)
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
        `Result of the transformer for translation key ${key} is the same as the vanilla value.`,
        `Transformer used: ${transformerName}`
      )
      debugger
    }
  }

  if (process.env.QUIET) return result

  // Log the translation strings that we just generated
  console.group(`=== ${brand} ===`)
  Object.entries(result).forEach(([key, value]) =>
    console.log(`${key}: "${value.replaceAll(/\n+/g, " ")}"`)
  )
  console.groupEnd()

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

export async function generateMultipleVersionsLanguageFileData(
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
  packMetadata: ResourcePackMetadata,
  metaFiles?: Record<string, Buffer>
) {
  const zip = new AdmZip()

  // Add each "meta file" to the zip
  if (metaFiles)
    Object.entries(metaFiles).forEach(([path, contents]) =>
      zip.addFile(path, contents)
    )

  // Add the pack.mcmeta
  zip.addFile("pack.mcmeta", Buffer.from(JSON.stringify(packMetadata, null, 4)))

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

  // Get the pack.png and README files from the repo, and include them in the zip
  const metaFiles: Record<string, Buffer> = {}
  const metaFileNames = ["pack.png", "README.md"]
  for (const i in metaFileNames) {
    const file = metaFileNames[i]
    const filePath = path.join(metaFileDirectory, file)
    metaFiles[file] = await readFile(filePath)
  }

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
  const filename = "index.json"
  const data = JSON.stringify(Array.from(index.entries()))
  const filePath = path.join(outputDir, filename)
  await writeFile(filePath, data, "utf-8")
}

export async function emitResourcePacks(
  fixes: Fix[],
  buildOptions: BuildOptions
) {
  const outputDir = buildOptions.directory || "out"
  console.log("Building resource packs...")

  // Perform validation on the provided fixes
  const validationResults = Promise.all(
    fixes.map((fix) => fix.validateLinkedBug())
  )

  // Prepare the output directory
  await ensureDir(outputDir)
  if (buildOptions.clearDirectory) await clearDir(outputDir, false)

  if (!buildOptions.packVersion)
    console.warn(
      "No pack version specified. Published builds should be branded with a version number."
    )

  // Validation needs to be complete before we start processing the fixes
  await validationResults

  const languageFiles = await generateMultipleVersionsLanguageFileData(
    buildOptions.targetVersions,
    buildOptions.targetLanguages,
    fixes
  )
  const zipFiles = await generateMultiplePackZipData(languageFiles, ".")

  /** A map of filenames to that file's metadata. */
  const zipFileIndex: OutFileIndex = new Map()

  // Save each of the in-memory zip files to the disk
  Object.entries(zipFiles).forEach(([version, zip], index) => {
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
    const infoFile = Buffer.from(JSON.stringify(infoFileContents, null, 4))
    zip.addFile("capitalisation_fixes.json", infoFile)

    zip.writeZip(zipPath)
    zipFileIndex.set(filename, fileMetadata)
  })

  // Save the index.json file
  await emitOutFileIndex(zipFileIndex, outputDir)
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
    if (!fix.versions) return true

    const fixVersions = await resolveMinecraftVersionSpecifier(fix.versions)
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
