class Transformer {}

/**
 * Represents the start and end points of a range
 * @example
 * [3, 5] // Between 3 and 5
 * [3, null] // Anything after 3
 * [null, 5] // Anything before 5
 * [null, null] // Anything and everything
 */
type Range<T> = [T | null, T | null]
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
