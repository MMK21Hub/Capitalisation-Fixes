import {
  MinecraftLanguage,
  MinecraftVersionSpecifier,
  resolveMinecraftVersionSpecifier,
} from "./minecraftHelpers.js"
import { MultiTransformer } from "./transformers/MultiTransformer.js"
import { Transformer } from "./builder.js"
import {
  getBug,
  getBugFixVersions,
  getBugResolution,
  Resolution,
} from "./mojiraHelpers.js"

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

    if (!this.versions)
      return console.warn(
        `Linked bug ${this.bug} has been fixed upstream, but there is no version constraint on the fix. ` +
          `You should add a version constraint to avoid applying unnecessary fixes.`
      )

    const resolvedVersions = await resolveMinecraftVersionSpecifier(
      this.versions
    )

    // Only one version was specified, so it's probably OK
    if (resolvedVersions.length === 1) return

    // TODO: Get the start and end of both version ranges (this.versions and fixVersions), and compare the version numbers
    const intersectingVersions = fixVersions.filter((v) =>
      resolvedVersions.includes(v)
    )
    if (intersectingVersions.length)
      console.warn(
        `Fix for ${this.bug} is being applied to a version that it's been fixed in: ${intersectingVersions[0]}. ` +
          `You should update the constraint to ensure that only affected versions have the fix applied to them.`
      )

    // TODO: Do a similar thing for the Affects Version(s) field
  }

  async validateLinkedBug() {
    if (!this.bug) return

    if (!/[A-Z]+-\d+/.test(this.bug))
      throw new Error(`Doesn't look like a bug report key: "${this.bug}"`)

    const resolvedKey = await getBug(this.bug)
    if (!resolvedKey) throw new Error(`Issue ${this.bug} does not exist!`)

    if (resolvedKey !== this.bug) {
      console.warn(
        `Issue ${this.bug} redirects to ${resolvedKey}. Check that you're specifying the correct bug report.`
      )
      this.bug = resolvedKey
    }

    const { resolution } = await getBugResolution(this.bug)

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

    const fixedResolutions = [Resolution.Fixed, Resolution.Done]
    if (resolution && fixedResolutions.includes(resolution))
      await this.validateFixedBug()
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
