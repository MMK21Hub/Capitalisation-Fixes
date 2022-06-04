import {
  getSelectorId,
  getSelectorText,
  getSelectorTextAll,
  SelectorNotFound,
  urlPath,
} from "./util.js"
import { JSDOM } from "jsdom"
import fetch from "node-fetch"
import { getMinecraftVersionId } from "./minecraftHelpers.js"

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

export async function getBugFixVersions(bug: string) {
  const dom = await getBugXML(bug, ["fixVersions"])

  try {
    const fixVersions = getSelectorTextAll(dom, "fixVersion")
    return fixVersions.map(getMinecraftVersionId)
  } catch (error) {
    if (error instanceof SelectorNotFound) return []
    throw error
  }
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
