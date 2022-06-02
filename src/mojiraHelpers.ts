import { urlPath } from "./util.js"
import fetch from "node-fetch"
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
