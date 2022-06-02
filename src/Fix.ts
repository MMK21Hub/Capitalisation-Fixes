import {
  MinecraftLanguage,
  MinecraftVersionSpecifier,
} from "./minecraftHelpers.js"
import { MultiTransformer } from "./transformers/MultiTransformer.js"
import { Transformer } from "./builder.js"

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
  skipBugValidation?: boolean
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
  skipBugValidation

  constructor(options: FixOptions) {
    if (Array.isArray(options.transformer)) {
      // Automatically use a MultiTransformer if an array is provided
      options.transformer = new MultiTransformer(options.transformer)
    }

    if (options.bug && !/[A-Z]+-\d+/.test(options.bug))
      console.warn(`Doesn't look like a bug report key: "${options.bug}"`)

    this.bug = options.bug
    this.key = options.key
    this.transformer = options.transformer
    this.versions = options.versions
    this.languages = options.languages
    this.skipBugValidation = options.skipBugValidation ?? false
  }
}
