import path from "path"
import { DebugReportSerialised } from "../DebugReport.js"
import { debugReportsFolder } from "./util.js"
import { readFile, readdir } from "fs/promises"

export async function findLatestReport() {
  const files = await readdir(debugReportsFolder, { withFileTypes: true })

  const reportFiles = files.filter(
    (file) => file.isFile() && file.name.endsWith(".json")
  )

  const latestReport = files.sort().at(-1)
  if (!latestReport)
    throw new Error(
      `Couldn't find any .json files in the folder ${debugReportsFolder}`
    )

  return latestReport.name
}

export async function loadReport(fileName: string) {
  const fileContents = await readFile(
    path.join(debugReportsFolder, fileName),
    "utf-8"
  )

  return JSON.parse(fileContents) as DebugReportSerialised
}
