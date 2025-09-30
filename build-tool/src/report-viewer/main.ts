import arg from "arg"
import { findLatestReport, loadReport } from "./loadReport.js"
import { ReportRenderer } from "./viewReport.js"

const args = arg(
  {
    "--file": String,
  },
  { permissive: true }
)

const { "--file": selectedFile } = args

const targetFile = selectedFile || (await findLatestReport())
const reportData = await loadReport(targetFile)
const renderer = new ReportRenderer({ reportData })
renderer.printReport()
