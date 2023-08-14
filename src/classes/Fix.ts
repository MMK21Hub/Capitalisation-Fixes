import {
  findVersionIndex,
  MinecraftLanguage,
  MinecraftVersionSpecifier,
  resolveMinecraftVersionSpecifier,
} from "../helpers/minecraftHelpers.js"
import { MultiTransformer } from "../transformers/MultiTransformer.js"
import { Transformer } from "../builder.js"
import {
  getBug,
  getBugFixVersions,
  getBugResolution,
  isFixed,
  Resolution,
} from "../helpers/mojiraHelpers.js"
import { DebugTask } from "./DebugReport.js"

export interface FixOptions {
  /** The translation string that needs to be edited */
  key: string
  /** A "transformer" that declares the edits that need to be made to the specified translation string. Providing an array of transformers automatically uses a {@link MultiTransformer} */
  transformer: Transformer | Transformer[]
  /** Specifies the versions of Minecraft that the fix should be applied to (defaults to all versions) */
  versions?: MinecraftVersionSpecifier
  /** Specifies the languages that the fix should be applied to (defaults to all languages) */
  languages?: MinecraftLanguage[]
  /** References the Mojira bug report for the bug that the fix fixes */
  bug?: string
}

export interface FixData extends FixOptions {
  transformer: Transformer
}

export default class Fix {
  key
  transformer
  versions
  languages
  bug

  async validateFixedBug() {
    if (!this.bug)
      return console.warn(
        "Fix#validateFixedBug() should only be called when a linked bug is present"
      )
    const fixVersions = await getBugFixVersions(this.bug)
    if (fixVersions.length === 0)
      return console.warn(
        "Fix#validateFixedBug() should only be called when the linked bug is fixed"
      )

    // TODO: Deduplicate warnings that come from the same bug
    if (!this.versions)
      return console.warn(
        `${this.bug} has been fixed upstream, but its fix(es) don't have version constraints.`
      )

    const fixVersion = fixVersions.at(-1)!
    const applicableVersions = await resolveMinecraftVersionSpecifier(
      this.versions
    )
    const lastApplicableVersion = applicableVersions.at(-1)
    if (!lastApplicableVersion)
      return new Error(`Fix#versions didn't return anything when resolved!`)
    const applicableVersionsEnd = findVersionIndex(lastApplicableVersion)
    const fixedVersionsStart = findVersionIndex(fixVersion)

    if (applicableVersionsEnd >= fixedVersionsStart) {
      const extraVersions = applicableVersionsEnd - fixedVersionsStart + 1
      console.warn(
        `Version range for ${this.bug} fix includes versions ${extraVersions} version(s) where the bug is fixed upstream. ` +
          `Bug was fixed upstream in ${fixVersion}, but the last version included in the range is ${lastApplicableVersion}.`
      )
    }
  }

  async validateLinkedBug() {
    if (!this.bug) return

    const debugTask = new DebugTask({
      type: "Fix#validateLinkedBug",
      name: `Validating a fix with linked bug ${this.bug}`,
    })

    if (!/[A-Z]+-\d+/.test(this.bug))
      throw new Error(`Doesn't look like a bug report key: "${this.bug}"`)

    const resolvedKey = await debugTask
      .push({
        type: "getBug",
      })
      .addPromise(getBug(this.bug))

    if (!resolvedKey) throw new Error(`Issue ${this.bug} does not exist!`)

    if (resolvedKey !== this.bug) {
      console.warn(
        `Issue ${this.bug} redirects to ${resolvedKey}. Check that you're specifying the correct bug report.`
      )
      this.bug = resolvedKey
    }

    const { resolution } = await debugTask
      .push({
        type: "getBugResolution",
      })
      .addPromise(getBugResolution(this.bug))

    const badResolutions = [
      Resolution.Invalid,
      Resolution.Duplicate,
      Resolution.Incomplete,
      Resolution.WorksAsIntended,
    ]
    if (resolution && badResolutions.includes(resolution))
      throw new Error(
        `Bug report ${this.bug} has an inappropriate resolution (${Resolution[resolution]})`
      )

    const bugFixed = await debugTask
      .push({
        type: "isFixed",
      })
      .addPromise(isFixed(this.bug))

    if (bugFixed) {
      await debugTask
        .push({
          type: "Fix#validateFixedBug",
        })
        .addPromise(this.validateFixedBug())
    }

    debugTask.end()
    return debugTask
  }

  constructor(options: FixOptions) {
    this.transformer = Array.isArray(options.transformer)
      ? new MultiTransformer(options.transformer)
      : options.transformer

    this.bug = options.bug
    this.key = options.key
    this.versions = options.versions
    this.languages = options.languages
  }
}
