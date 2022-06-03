import { getSelectorId, getSelectorText, urlPath } from "./util.js"
import { JSDOM } from "jsdom"

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
  Fixed,
  WontFix,
  Duplicate,
  Incomplete,
  WorksAsIntended,
  CannotReproduce,
  Invalid,
  AwaitingResponse,
  Done,
  WontDo,
  Declined,
}

export function getBugXMLUrl(key: string, fields?: string[]) {
  const base = "https://bugs.mojang.com/si/jira.issueviews:issue-xml"
  const url = urlPath(base, key, ".xml")
  fields?.forEach((field) => url.searchParams.append("field", field))
  return url
}

export function getBugXML(bug: string, fields?: string[]): Promise<JSDOM> {
  const url = getBugXMLUrl(bug, fields)
  return JSDOM.fromURL(url.href).catch(console.log).then()
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

export async function getBug(key: string) {
  const url = urlPath("https://bugs.mojang.com/rest/api/2/issue/", key)
  const response = await fetch(url.href)
  if (response.status === 404) return null

  const responseData = await response.json()
  return responseData.key as string
}
