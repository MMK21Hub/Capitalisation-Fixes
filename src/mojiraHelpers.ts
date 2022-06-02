import { urlPath } from "./util.js"
import fetch from "node-fetch"
import { JSDOM } from "jsdom"

export function getBugXMLUrl(key: string, fields?: string[]) {
  const base = "https://bugs.mojang.com/si/jira.issueviews:issue-xml"
  const url = urlPath(base, key, ".xml")
  fields?.forEach((field) => url.searchParams.append("field", field))
  return url
}

export async function getBugXML(
  bug: string,
  fields?: string[]
): Promise<JSDOM> {
  const url = getBugXMLUrl(bug, fields).href
  const response = await fetch(url)

  if (!response.ok)
    throw new Error(
      `Could not fetch XML data for bug ${bug} with URL ${url}: Server returned ${response.status} ${response.statusText}`
    )

  const text = await response.text()
  return new JSDOM(text)
}
