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
}

export interface FixData extends FixOptions {
  transformer: Transformer
}

export class Fix {
  data

  constructor(options: FixOptions) {
    if (Array.isArray(options.transformer)) {
      // Automatically use a MultiTransformer if an array is provided
      options.transformer = new MultiTransformer(options.transformer)
    }

    this.data = options as FixData
  }
}
