import { readFile } from "node:fs/promises"
import * as path from "node:path"
import AdmZip from "adm-zip"
import { clearDir, ensureDir, filter, FunctionMaybe } from "./util"
import {
  OverrideTransformer,
  MultiTransformer,
  CustomTransformer,
  Fix,
  LanguageFileBundle,
} from "./builder"
import {
  MinecraftVersion,
  MinecraftLanguage,
  LanguageFileData,
  MinecraftVersionSpecifier,
  getVanillaLanguageFile,
  resolveMinecraftVersionSpecifier,
} from "./minecraftHelpers"

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

interface BuildOptions {
  targetVersions: MinecraftVersionSpecifier
  targetLanguages: MinecraftLanguage[]
  directory?: string
  packVersion?: string
  clearDirectory?: boolean
  filename?: FunctionMaybe<string, [string, string?]>
}

async function emitResourcePacks(fixes: Fix[], buildOptions: BuildOptions) {
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

console.log("Building resource packs...")

export const cache = new Map<string, any>()

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

const versionString = process.argv[2]

await emitResourcePacks(fixes, {
  targetVersions: ["22w14a", "22w15a"],
  targetLanguages: ["en_us", "en_gb"],
  clearDirectory: true,
  packVersion: versionString,
  // If no version was specified, just name the zip after the MC version it targets:
  filename: versionString
    ? undefined
    : (minecraftVersion) => `${minecraftVersion}.zip`,
})
