import { getSelectorText, urlPath } from "./util.js"
import { JSDOM } from "jsdom"

export function getBugXMLUrl(key: string, fields?: string[]) {
  const base = "https://bugs.mojang.com/si/jira.issueviews:issue-xml"
  const url = urlPath(base, key, ".xml")
  fields?.forEach((field) => url.searchParams.append("field", field))
  return url
}

export function getBugXML(bug: string, fields?: string[]): Promise<JSDOM> {
  const url = getBugXMLUrl(bug, fields)
  return JSDOM.fromURL(url.href)
}

export async function getBugResolution(bug: string) {
  const dom = await getBugXML(bug, ["resolution", "status"])
  const resolution = getSelectorText(dom, "resolution")
  const status = getSelectorText(dom, "status")
  const key = getSelectorText(dom, "key")

  return {
    resolution,
    status,
    key,
  }
}
