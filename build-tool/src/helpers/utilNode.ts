/** Utilities that can only be used when running under Node.js */

import path from "node:path"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"

/* FILESYSTEM UTILS */

/**
 * Creates a directory if it does not already exist
 * @returns true if the directory already existed; false if it was created
 */
export function ensureDir(path: string): Promise<boolean> {
  return mkdir(path, { recursive: true })
    .then(() => true)
    .catch((e) => {
      return e.code === "EEXIST" ? false : e
    })
}

/** Deletes all the files in a folder */
export async function clearDir(
  directoryPath: string,
  recursive: boolean = true
) {
  const contents = await readdir(directoryPath)

  // Return false if the directory is empty
  if (!contents) return false

  // Delete all the files in the directory (asynchronously)
  await Promise.all(
    contents.map((file) => rm(path.resolve(directoryPath, file), { recursive }))
  )

  return true
}

/* CACHING */

export async function getCachedFile(filePath: string) {
  // Make sure that the .cache directory exists
  await ensureDir(".cache")

  const fullFilePath = path.join(".cache", ...filePath.split("/"))
  return await readFile(fullFilePath, "utf8").catch(() => {
    return null
  })
}

export async function addToCache(filePath: string, contents: string) {
  const filePathParts = filePath.split("/")
  // Make sure that the .cache directory (in CWD) exists
  await ensureDir(".cache")
  // Ensure that any subdirectories in the provided file path exist
  const filePathSubfolders = filePathParts.slice(0, -1)
  await ensureDir(path.join(".cache", ...filePathSubfolders))
  // Create the file
  const fullFilePath = path.join(".cache", ...filePathParts)
  await writeFile(fullFilePath, contents)
}
