import { MultiTransformer } from "./transformers/MultiTransformer.js"
import { FixOptions, FixData } from "./builder.js"

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
