import { JSDOM } from "jsdom"
import { Response } from "node-fetch"
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

/** Makes the provided keys (K) of the object (T) optional */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
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
/** Something that can be used to fins matches within a string, i.e. regex or another string */
export type SearchValue = string | RegExp

export interface ResolvableAny<T, A extends any[] = []> {
  resolve(...args: A): T | Promise<T>
  sync?: boolean
}
export interface ResolvableAsync<T, A extends any[] = []>
  extends ResolvableAny<T, A> {
  resolve(...args: A): T | Promise<T>
  sync?: false
}
export interface ResolvableSync<T, A extends any[] = []>
  extends ResolvableAny<T, A> {
  resolve(...args: A): T
  sync: true
}

export function isSimpleRange<T>(
  specifier: Range<T>
): specifier is StartAndEnd<T> {
  return Array.isArray(specifier) && typeof specifier[0] !== "object"
}

/* DATA MANIPULATION */

export type RecordLike<K extends string | number | symbol, T> =
  | Record<K, T>
  | [K, T][]

export function toMap<T>(recordLike: RecordLike<string, T>): Map<string, T> {
  return Array.isArray(recordLike)
    ? new Map(recordLike)
    : new Map(Object.entries(recordLike))
}

/* DOM UTILS */

export class SelectorNotFound extends Error {
  constructor(message: string) {
    super(message)
  }
}

export function getSelector(dom: JSDOM, selector: string) {
  const match = dom.window.document.querySelector(selector)
  if (!match) throw new SelectorNotFound(`Couldn't find selector: ${selector}`)
  return match
}

export function getSelectorAll(dom: JSDOM, selector: string) {
  const matches = dom.window.document.querySelectorAll(selector)
  if (!matches.length)
    throw new SelectorNotFound(`Didn't match any elements: ${selector}`)
  return matches
}

export function getElementText(element: Element) {
  if (element.textContent) return element.textContent.trim()

  // Apparently you can just put your data inside a comment and call it "CDATA"
  const cdataMatcher = /\[CDATA\[(.*)\]\]/
  const cdataMatch = cdataMatcher.exec(element.outerHTML)
  if (cdataMatch) return cdataMatch[1].trim()

  throw new Error(`Element doesn't contain any text!\n${element.outerHTML}`)
}

export function getSelectorText(dom: JSDOM, selector: string) {
  const element = getSelector(dom, selector)
  return getElementText(element)
}

export function getSelectorTextAll(dom: JSDOM, selector: string) {
  const matchingElements = Array.from(getSelectorAll(dom, selector))
  return matchingElements.map(getElementText)
}

export function getSelectorId<T extends number = number>(
  dom: JSDOM,
  selector: string,
  strict?: true
): T
export function getSelectorId<T extends number = number>(
  dom: JSDOM,
  selector: string,
  strict: false
): T | null
export function getSelectorId<T extends number = number>(
  dom: JSDOM,
  selector: string,
  strict = true
): T | null {
  const element = getSelector(dom, selector)
  const id = element.getAttribute("id")
  if (!id) throw new Error(`Element doesn't have an id!\n${element.outerHTML}`)

  const idNumber = parseInt(id)
  if (isNaN(idNumber)) throw new Error(`Element id is not a number: ${id}`)
  if (!strict && idNumber === -1) return null
  if (idNumber < 0) throw new Error(`Element id is negative: ${id}`)
  return idNumber as T
}

/* HTTP UTILS */

export type URLSearchParamsResolvable = URLSearchParams | Record<string, string>

export function urlPath(...paths: string[]): URL {
  return new URL(paths.join("/"))
}

export function resolveURLParams(params: URLSearchParamsResolvable) {
  if (params instanceof URLSearchParams) return params

  const finalParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => finalParams.set(key, value))
  return finalParams
}

export type HTTPMethods =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH"

// TRACK is a the equivalent of TRACE, but only supported by the IIS web server
export type ForbiddenMethods = "CONNECT" | "TRACE" | "TRACK"

export type FetchableMethods = Exclude<HTTPMethods, ForbiddenMethods>

export class RequestError<T = unknown> {
  responseCode
  responseCodeText
  url
  message

  constructor(response: Response, message: T) {
    this.responseCode = response.status
    this.responseCodeText = response.statusText
    this.url = response.url
    this.message = message
  }
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

/** Returns true if the provided word should be capitalised in a Title Case string. Not exhaustive. */
export function shouldCapitalise(word: string) {
  const excludedWords = ["from", "into"]
  const includedWords = ["me"]

  if (includedWords.includes(word)) return true
  if (word.length < 3) return false
  if (word.length > 5) return true
  if (excludedWords.includes(word)) return false
  return true
}

export function toTitleCase(str: string) {
  return str.replaceAll(/\w+/g, (match) =>
    shouldCapitalise(match)
      ? match.charAt(0).toUpperCase() + match.slice(1)
      : match
  )
}

/** Splits a string into an array of words */
export function toWords(str: string) {
  return Array.from(str.match(/\b(\w+)'?(\w+)?\b/g) || [])
}

export function isSingleWord(str: string) {
  return toWords(str).length === 1
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
  // Make sure that the .cache directory exists
  await ensureDir(".cache")

  const fullFilePath = path.join(".cache", ...filePath.split("/"))
  await writeFile(fullFilePath, contents)
}
