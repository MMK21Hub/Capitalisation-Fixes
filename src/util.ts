import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

/** Specify a value, or provide a function that returns that value */
export type FunctionMaybe<T, A extends any[] = []> = T | ((...args: A) => T)
/** Like {@link FunctionMaybe}, but with named arguments for readability */
export type FunctionMaybeArgs<T, A extends Record<string, any>> = FunctionMaybe<
  T,
  A[string][]
>
/**
 * Represents the start and end points of a range
 * @example
 * [3, 5] // Between 3 and 5
 * [3, null] // Anything after 3
 * [null, 5] // Anything before 5
 * [null, null] // Anything and everything
 */
export type StartAndEnd<T> = [T | null, T | null]
/** Represents a {@link Range}, with options for excluding parts within that range */
export type FancyRange<T> = {
  start: T
  end: T
  exclude?: Range<T>
  include?: Range<T>
  exclusiveStart?: boolean
  exclusiveEnd?: boolean
}
/** A set of items within start and end limits. Can be represented in multiple ways. */
export type Range<T> = StartAndEnd<T> | FancyRange<T>

export interface Resolvable<T, A extends any[] = []> {
  resolve(...args: A): T | Promise<T>
}

/* ASYNC UTILS */

// https://stackoverflow.com/a/46842181/11519302
export async function filter<T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
) {
  const fail = Symbol()
  return (
    await Promise.all(
      array.map(async (item) => ((await predicate(item)) ? item : fail))
    )
  ).filter((i) => i !== fail) as T[]
}

/* STRING PROCESSING */

export function toTitleCase(str: string) {
  return str.replaceAll(
    /\w+/g,
    (match) => match.charAt(0).toUpperCase() + match.slice(1)
  )
}

/* FILESYSTEM UTILS */

/**
 * Creates a directory if it does not already exist
 * @returns true if the directory already existed; false if it was created
 */
export function ensureDir(path: string): Promise<boolean> {
  return mkdir(path)
    .then(() => true)
    .catch((e) => {
      return e.code === "EEXIST" ? false : e
    })
}

/** Deletes all the files in a folder */
export async function clearDir(directoryPath: string) {
  const contents = await readdir(directoryPath)

  // Return false if the directory is empty
  if (!contents) return false

  // Delete all the files in the directory (asynchronously)
  await Promise.all(
    contents.map((file) => unlink(path.resolve(directoryPath, file)))
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
  // Make sure that the .cache directory exists
  await ensureDir(".cache")

  const fullFilePath = path.join(".cache", ...filePath.split("/"))
  await writeFile(fullFilePath, contents)
}
