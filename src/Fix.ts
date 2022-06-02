import {
  MinecraftLanguage,
  MinecraftVersionSpecifier,
} from "./minecraftHelpers.js"
import { MultiTransformer } from "./transformers/MultiTransformer.js"
import { Transformer } from "./builder.js"
import { getBugXML } from "./mojiraHelpers.js"

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

  async validateLinkedBug() {
    if (!this.bug) return

    if (!/[A-Z]+-\d+/.test(this.bug))
      throw new Error(`Doesn't look like a bug report key: "${this.bug}"`)

    await getBugXML(this.bug)
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
