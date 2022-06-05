import {
  findVersionIndex,
  MinecraftLanguage,
  MinecraftVersionSpecifier,
  resolveMinecraftVersionSpecifier,
} from "./minecraftHelpers.js"
import { MultiTransformer } from "./transformers/MultiTransformer.js"
import { Transformer } from "./builder.js"
import {
  getBug,
  getBugAffectsVersions,
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
      console.warn(
        `Version range for fix for ${this.bug} overlaps with versions where the bug has been fixed. ` +
          `Bug was fixed upstream in version ${fixVersion}, but the version range for the fix ends at ${lastApplicableVersion}.`
      )
    }
  }

  async validateBugAffectsVersions() {
    if (!this.bug)
      return console.warn(
        "Fix#validateFixedBug() should only be called when a linked bug is present"
      )

    if (!this.versions) return

    const applicableVersions = await resolveMinecraftVersionSpecifier(
      this.versions
    )

    const affectsVersions = await getBugAffectsVersions(this.bug)
    const firstAffectedVersion = affectsVersions.at(0)
    const firstApplicableVersion = applicableVersions.at(0)
    if (!firstAffectedVersion)
      return console.warn(`${this.bug} has no Affects Version/s!`)
    if (!firstApplicableVersion)
      throw new Error(`Validating fix for ${this.bug}: Resolved versions 🦀`)
    const affectedVersionsStart = findVersionIndex(firstAffectedVersion)
    const applicableVersionsStart = findVersionIndex(firstApplicableVersion)

    if (applicableVersionsStart < affectedVersionsStart) {
      return console.warn(
        `Version range for fix for ${this.bug} starts earlier than the first affected version. ` +
          `Earliest affected version: ${firstAffectedVersion}. Earliest version that the fix will be applied to: ${firstApplicableVersion}.`
      )
    }
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

    await this.validateBugAffectsVersions()
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
