import {
  getSelectorId,
  getSelectorText,
  getSelectorTextAll,
  SelectorNotFound,
  urlPath,
} from "./util.js"
import { JSDOM } from "jsdom"
import fetch from "node-fetch"
import { isFutureVersion, toVersionID } from "./minecraftHelpers.js"

// From https://bugs.mojang.com/rest/api/2/status
export enum Status {
  Open,
  InProgress,
  Reopened,
  Resolved,
  Closed,
  Postponed,
}

// From https://bugs.mojang.com/rest/api/2/resolution
export enum Resolution {
  Fixed = 1,
  WontFix = 2,
  Duplicate = 3,
  Incomplete = 4,
  WorksAsIntended = 6,
  CannotReproduce = 5,
  Invalid = 7,
  AwaitingResponse = 10001,
  Done = 10003,
  WontDo = 10004,
  Declined = 10005,
}

export function getBugXMLUrl(key: string, fields?: string[]) {
  const base = "https://bugs.mojang.com/si/jira.issueviews:issue-xml"
  const url = urlPath(base, key, ".xml")
  fields?.forEach((field) => url.searchParams.append("field", field))
  return url
}

export function getBugXML(bug: string, fields?: string[]): Promise<JSDOM> {
  const url = getBugXMLUrl(bug, fields)
  return JSDOM.fromURL(url.href)
    .catch((error: Error) => {
      console.error(`getBugXML(): HTTP request failed! (${url.href})`)
      throw error
    })
    .then()
}

export async function getBugResolution(bug: string) {
  const dom = await getBugXML(bug, ["resolution", "status"])
  const status = getSelectorId<Status>(dom, "status")
  const resolution = getSelectorId<Resolution>(dom, "resolution", false)
  const key = getSelectorText(dom, "key")

  return {
    resolution,
    status,
    key,
  }
}

/** @returns An array of version names (or maybe IDs, sometimes) */
function getRawVersionsFromXML(dom: JSDOM, selector: string) {
  try {
    const versionNames = getSelectorTextAll(dom, selector)
    return versionNames
  } catch (error) {
    if (error instanceof SelectorNotFound) return []
    throw error
  }
}

/** @returns An array of version IDs */
function getVersionsFromXML(dom: JSDOM, selector: string) {
  const selectedVersions = getRawVersionsFromXML(dom, selector)
  const versionIds = selectedVersions
    // Get rid of future versions, since they refer to the future,
    // so are not useful to us. E.g. a bug marked as fixed for a
    // future version has not actually been fixed in any version.
    // (But it will be fixed in the near future.)
    .filter((version) => !isFutureVersion(version))
    .map(toVersionID)
  return versionIds
}

/** Tip: If there are multiple fix versions, or there's a fix version but the report has been reopened, then it means that Mojang made a failed attempt to fix the bug. */
export async function getBugFixVersions(bug: string) {
  const dom = await getBugXML(bug, ["fixVersions"])
  return getVersionsFromXML(dom, "fixVersion")
}

export async function getBugAffectsVersions(bug: string) {
  const dom = await getBugXML(bug, ["version"])
  return getVersionsFromXML(dom, "item version")
}

/** Returns true if the bug is fixed, and the fix has is public (i.e. not an unreleased version) */
export async function isFixed(bug: string) {
  const fixedResolutions = [Resolution.Fixed, Resolution.Done]
  const { resolution } = await getBugResolution(bug)
  if (resolution && fixedResolutions.includes(resolution)) {
    // Get the fix version names, as provided by the API
    const bugInfo = await getBugXML(bug, ["fixVersions"])
    const fixVersions = getRawVersionsFromXML(bugInfo, "fixVersion")

    // If the last listed fix version is a future update,
    // then the fix has not been released yet.
    const significantFixVersion = fixVersions.at(-1)
    if (significantFixVersion && isFutureVersion(significantFixVersion))
      return false

    // The bug has a fix version (and it's not a future version)
    return true
  }

  return false
}

export async function getBug(key: string): Promise<string | null> {
  const url = urlPath("https://bugs.mojang.com/rest/api/2/issue", key)
  const response = await fetch(url.href)
  if (response.status === 404) return null

  const responseData = await response.json()

  if (
    typeof responseData === "object" &&
    responseData &&
    "key" in responseData &&
    // @ts-ignore
    typeof responseData.key === "string"
  )
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/25720
    return responseData.key

  throw new Error(`getBug(): Unexpected API response: ${responseData}`)
}
