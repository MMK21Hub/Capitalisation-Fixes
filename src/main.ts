abstract class Transformer {
  callback

  constructor(callback: (value: string) => TransformerResult) {
    this.callback = callback
  }
}

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
class CustomTransformer extends Transformer {
  constructor(callback: (value: string) => TransformerResult) {
    super(callback)
  }
}

/** Modify translation strings the old way! */
class OverrideTransformer extends Transformer {
  constructor(value: string) {
    // Just return the provided value
    super(() => ({ value }))
  }
}

/** Lets you apply multiple transformers to a single translation string */
class MultiTransformer extends Transformer {
  transformers

  constructor(transformers: Transformer[]) {
    super((value) => {
      let newValue = value
      for (const transformer of transformers) {
        newValue = transformer.callback(newValue).value
      }
      return { value: newValue }
    })
    this.transformers = transformers
  }
}

/**
 * Represents the start and end points of a range
 * @example
 * [3, 5] // Between 3 and 5
 * [3, null] // Anything after 3
 * [null, 5] // Anything before 5
 * [null, null] // Anything and everything
 */
type Range<T> = [T | null, T | null]
/** The output of a {@link Transformer} */
type TransformerResult = {
  value: string
}
/** A single Minecraft language ID */
type MinecraftLanguage = string
/** A single Minecraft version ID */
type MinecraftVersion = string
/** Used to refer to a group, range, or single version of Minecraft */
type MinecraftVersionSpecifier = Range<MinecraftVersion> | MinecraftVersion

interface FixOptions {
  /** The translation string that needs to be edited */
  key: string
  /** A "transformer" that declares the edits that need to be made to the specified translation string */
  transformer: Transformer
  /** Specifies the versions of Minecraft that the fix should be applied to (defaults to all versions) */
  versions?: MinecraftVersionSpecifier
  /** Specifies the languages that the fix should be applied to (defaults to all languages) */
  languages?: MinecraftLanguage[]
}

class Fix {
  data

  constructor(options: FixOptions) {
    this.data = options
  }
}
