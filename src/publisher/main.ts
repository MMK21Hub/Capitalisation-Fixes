import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"
import { Blob } from "node-fetch"
import { readFile } from "fs/promises"
import { join } from "path"
import { OutFileIndex } from "../builder.js"
import { createInterface } from "readline"

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

async function publishReleases() {
  if (!process.env.MODRINTH_PROJECT_ID)
    throw new Error(
      "MODRINTH_PROJECT_ID must be provided to specify the Modrinth project to publish the releases to."
    )

  const newReleases: unknown[] = []
  let hasErrored = false
  for (const [filename, { minecraftVersion }] of index.entries()) {
    if (hasErrored) break
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
      })
      .catch((e) => {
        console.error(e)
        throw new Error(
          `Failed to upload a release to Modrinth! See error above.`
        )
      })

    console.log(`Successfully published version ${name}`)
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

console.log(`Found ${index.size} file(s) for version ${packVersion}.`)
rl.question(
  `Publish ${index.size} release(s) to Modrinth? (Y/n) `,
  async (answer) => {
    if (answer.toLowerCase().at(0) === "n") return console.log("Goodbye then!")
    const newReleases = await publishReleases()
    console.log(`Published ${newReleases.length} release(s) to Modrinth!`)
  }
)
