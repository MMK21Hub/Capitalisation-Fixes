import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"
import { Blob } from "node-fetch"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { OutFileIndex, OutFileMetadata } from "../builder.js"
import { createInterface } from "readline"
import { ensureDir } from "../helpers/util.js"

/**
 * Goes through all the files in the index.
 * Asserts that they all have a version brand.
 * Asserts that they all have the same version brand.
 * @returns The version brand that is shared by all the files in the index
 */
function findPackVersion(packIndex: OutFileIndex): string {
  if (!packIndex.size) {
    throw new Error("There aren't any files in the pack index!")
  }

  let packVersion: string | null = null

  // Typescript doesn't like me defining packVersion within a forEach callback,
  // so I've used a normal for loop.
  for (const [filename, { versionBrand }] of packIndex.entries()) {
    if (!versionBrand) {
      throw new Error(
        `File ${filename} doesn't have a version brand, so it can't be included in a Modrinth release.`
      )
    }

    if (!packVersion) {
      // This is the first output file, so we'll use its version brand
      packVersion = versionBrand
      continue
    }

    if (packVersion !== versionBrand) {
      // This pack's brand doesn't match the one from earlier (stored in providedPackVersion)
      throw new Error(
        `Mismatched version brands in output files! The script can only handle one pack version at a time.`
      )
    }
  }

  if (!packVersion) {
    throw new Error("Couldn't find a pack version for some unknown reason.")
  }

  return packVersion
}

async function getReleaseNotes(): Promise<string> {
  const releaseConfigFolder = "release"
  const filename = "changelog.md"
  const filePath = join(releaseConfigFolder, filename)
  await ensureDir(releaseConfigFolder)
  // Create the file (with no content) if it doesn't already exist:
  await writeFile(filePath, Buffer.from(""), {
    flag: "a",
  })

  console.log(
    `Write the release notes by editing the file at ${filePath} with your preferred text editor.`
  )

  return new Promise((resolve, reject) => {
    rl.question("Press enter here once you're done. ", async () => {
      const fileData = await readFile(filePath, "utf-8")
      if (!fileData) reject("Release notes file is empty!")
      console.log("\x1b[36m" + fileData + "\x1b[0m")
      rl.question(
        "Press enter to use the above text as the release notes. ",
        () => {
          resolve(fileData)
        }
      )
    })
  })
}

function generateChangelog(
  { minecraftVersion, versionBrand, index, totalFiles }: OutFileMetadata,
  releaseNotes: string
): string {
  if (!versionBrand)
    return `Development build for Minecraft ${minecraftVersion}`

  const githubRelease = `https://github.com/MMK21Hub/Capitalisation-Fixes/releases/tag/${versionBrand}`

  /* Markdown is supported. Use level-three headings (and below) to avoid clashing with Modrinth's UI. */
  return `
${releaseNotes}

----

[*View this release on Github*](${githubRelease})
  `.trim()
}

async function publishReleases(changelogBody: string) {
  if (!process.env.MODRINTH_PROJECT_ID)
    throw new Error(
      "MODRINTH_PROJECT_ID must be provided to specify the Modrinth project to publish the releases to."
    )

  const newReleases: unknown[] = []
  for (const [filename, fileInfo] of index.entries()) {
    const { minecraftVersion } = fileInfo
    const fileContents = await readFile(join(outputDir, filename))
    const name = `${packVersion} (${minecraftVersion})`

    const responseData = await client.rest
      .createVersion({
        files: [[filename, new Blob([fileContents])]],
        game_versions: [minecraftVersion],
        loaders: ["minecraft"],
        name: name,
        project_id: process.env.MODRINTH_PROJECT_ID,
        version_number: `${packVersion}-${minecraftVersion}`,
        changelog: generateChangelog(fileInfo, changelogBody),
      })
      .catch((e) => {
        console.error(e)
        throw new Error(
          `Failed to upload a release to Modrinth! See error above.`
        )
      })

    console.log(`Successfully published version "${name}"`)
    newReleases.push(responseData)
  }

  return newReleases
}

// Load environment variables from the .env file
dotenv.config()

const client = new ModrinthClient({
  baseURL: process.env.MODRINTH_API || "https://staging-api.modrinth.com",
  token: process.env.MODRINTH_TOKEN,
  brand: process.env.CLIENT_BRAND || "Capitalisation-Fixes Publisher Script",
})

const outputDir = "out"
const indexFile = join(outputDir, "index.json")
const indexEntries = JSON.parse(await readFile(indexFile, "utf-8"))
const index: OutFileIndex = new Map(indexEntries)
const packVersion = findPackVersion(index)
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log(`Found ${index.size} file(s) for version ${packVersion}`)
console.log(`Using API: ${client.baseURL}`)

const carefulMode = client.baseURL.hostname === "api.modrinth.com"
if (carefulMode) {
  console.log(
    "\x1b[31m" +
      "This is the public, production instance of Modrinth. " +
      "Your release is going live!" +
      "\x1b[0m"
  )
}

const changelogText = await getReleaseNotes()
const newReleases = await publishReleases(changelogText)
console.log(`Published ${newReleases.length} release(s) to Modrinth!`)
console.log("Next step: Manually (un)mark featured versions as appropriate.")
process.exit(0)
