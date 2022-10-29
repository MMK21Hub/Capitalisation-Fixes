import ModrinthClient from "./ModrinthClient.js"
import dotenv from "dotenv"
import { Blob } from "node-fetch"
import { readFile } from "fs/promises"
import { join } from "path"
import { OutFileIndex } from "../builder.js"

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
console.log(packVersion)

// console.log(
//   await client.rest.createVersion({
//     files: {
//       "nothing to see here.zip": new Blob(["hello"]),
//     },
//     game_versions: ["22w42a"],
//     loaders: ["fabric"],
//     name: "Cool version",
//     project_id: process.env.MODRINTH_PROJECT_ID!,
//     version_number: "2.0",
//   })
// )
