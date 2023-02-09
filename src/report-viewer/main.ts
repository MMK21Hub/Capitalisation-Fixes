import arg from "arg"
import { findLatestReport, loadReport } from "./loadReport.js"

const args = arg({
  "--file": String,
})

const { "--file": selectedFile } = args

const targetFile = selectedFile || (await findLatestReport())

console.log(await loadReport(targetFile))
