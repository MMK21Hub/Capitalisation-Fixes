import {
  MissingValueError,
  Transformer,
  TransformerCallback as Callback,
  TransformerCallbackData as CallbackData,
} from "../builder.js"
import {
  FlexibleSearchValue,
  getVanillaLanguageFile,
  resolveFlexibleSearchValue,
} from "../minecraftHelpers.js"
import { toTitleCase, StartAndEnd, SearchValue } from "../util.js"

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
export class CustomTransformer extends Transformer {
  constructor(callback: (data: CallbackData) => string) {
    // Call the provided function and use the string it returns
    super((data) => ({ value: callback(data) }))
  }
}

/** Modify translation strings the old way! */
export class OverrideTransformer extends Transformer {
  constructor(value: string) {
    // Just return the provided value
    super(() => ({ value }))
  }
}

export type Replacer = string | ReplacerFunction

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
type ReplacerFunction = (substring: string, groups: string[]) => string

/** Replaces a specified search string with another string */
export class ReplaceTransformer extends Transformer {
  searchValue
  replaceValue

  constructor(searchValue: FlexibleSearchValue, replaceValue: Replacer) {
    super(async ({ oldValue, languageFileData, language, version }) => {
      searchValue = await resolveFlexibleSearchValue(
        searchValue,
        languageFileData,
        language,
        version
      )

      const replacer: ReplacerFunction = (
        substring: string,
        ...args: unknown[]
      ) => {
        if (typeof replaceValue === "string") return replaceValue

        const captureGroups: string[] = []
        let captureGroupsEnd: number
        for (const [i, arg] of args.entries()) {
          if (typeof arg === "string") {
            captureGroups.push(arg)
            continue
          }
          captureGroupsEnd = i
          break
        }

        return replaceValue(substring, captureGroups)
      }

      return {
        // The built-in type for the parameters passed to the replacer function is just any[]
        value: oldValue?.replace(searchValue, replacer as any),
      }
    })

    this.searchValue = searchValue
    this.replaceValue = replaceValue
  }
}

/** Converts the whole string into Title Case. Useful for button labels etc. */
export class TitleCaseTransformer extends Transformer {
  constructor() {
    super(({ oldValue }) => ({
      value: toTitleCase(oldValue || "") || null,
    }))
  }
}

/** Capitalises past of a string, as specified by a RegEx or simple search string */
export class CapitaliseSegmentTransformer extends Transformer {
  searchValue

  constructor(searchValue: FlexibleSearchValue) {
    super(async ({ oldValue, language, version, languageFileData }) => {
      if (!oldValue) return { value: null }

      searchValue = new RegExp(
        await resolveFlexibleSearchValue(
          searchValue,
          languageFileData,
          language,
          version
        ),
        "gi"
      )

      const value = oldValue.replaceAll(searchValue, toTitleCase)
      return { value }
    })

    this.searchValue = searchValue
  }
}

/** Capitalises the parts of a string that are in-between the provided search strings (inclusively)  */
export class CapitaliseSectionTransformer extends Transformer {
  range: StartAndEnd<SearchValue>

  constructor(start: SearchValue | null, end: SearchValue | null) {
    super(({ oldValue, key, logger }) => {
      if (!oldValue) return { value: null }

      const [start, end] = this.range

      const simpleStart = typeof start === "string"
      const simpleEnd = typeof end === "string"

      const startIndex: number =
        start === null
          ? 0
          : simpleStart
          ? oldValue.indexOf(start)
          : oldValue.search(start)

      const endIndex =
        end === null
          ? oldValue.length
          : simpleEnd
          ? oldValue.indexOf(end) + end.length
          : oldValue.search(end) + (oldValue.match(end)?.[0].length || -1)

      if (startIndex === -1) {
        logger.warn(
          "Start search string didn't match anything in the string. " +
            `Searching for "${start}" in "${oldValue}" while processing translation key ${key}.`
        )
        return { value: oldValue }
      }

      if ((simpleEnd && endIndex < end.length) || endIndex === -1) {
        logger.warn(
          "End search string didn't match anything in the string. " +
            `Searching for "${end}" in "${oldValue}" while processing translation key ${key}.`
        )
        return { value: oldValue }
      }

      const value =
        oldValue.slice(0, startIndex) +
        toTitleCase(oldValue.slice(startIndex, endIndex)) +
        oldValue.slice(endIndex)

      return { value }
    })

    this.range = [start, end]
  }
}

/**
 * Matches translation strings from the vanilla language file to parts of the input string, to automatically capitalise any in-game names.
 */
export class CapitaliseFromTranslationStringsTransformer
  implements Transformer
{
  options

  callback: Callback = async ({ oldValue, language, version }) => {
    if (!oldValue) throw new MissingValueError()
    const languageFile = await getVanillaLanguageFile(language, version)

    const matchingTranslationStrings = Object.entries(languageFile)
      .filter(([key]) => {
        const keySegments = key.split(".")

        const matches = this.options.vanillaStrings.filter((matchString) => {
          const matchSegments = matchString.split(".")
          const matchingSegments = matchSegments.filter((matchSegment, i) => {
            if (matchSegment === keySegments[i]) return true
            if (matchSegment === "*" && keySegments[i]) return true
            if (matchSegment === "**") return true
            return false
          })

          return matchingSegments.length === matchSegments.length
        })

        return matches.length > 0
      })
      .map(([_, value]) => value)

    let currentValue = oldValue

    matchingTranslationStrings.forEach((string) => {
      const matcher = new RegExp(string, "gi")
      const pluralMatcher = new RegExp(string + "s", "gi")

      const match = matcher.test(currentValue)
        ? 1
        : pluralMatcher.test(currentValue)
        ? 2
        : 0

      if (!match) return

      // Case-insensitively replace all occurrences of the string with the properly-capitalised version from the lang file
      currentValue = currentValue.replaceAll(
        matcher,
        match === 1 ? string : `${string}s`
      )
    })

    return { value: currentValue }
  }

  constructor(options: {
    /**
     * An array of vanilla translation strings to use. Can use wildcards.
     * @example ["block.minecraft.*", "entity.**"]
     */
    vanillaStrings: string[]
  }) {
    this.options = options
  }
}
