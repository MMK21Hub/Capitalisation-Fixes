import { isNode } from "./helpers/util.js"

if (isNode()) {
  const { runCLI } = await import("./cli.js")
  await runCLI()
}
