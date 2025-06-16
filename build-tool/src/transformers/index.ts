import {
  Transformer,
  TransformerCallback as Callback,
  TransformerCallbackData as CallbackData,
} from "../builder.js"
import {
  FlexibleReplacer,
  FlexibleSearchValue,
  getVanillaLanguageFile,
  ReplacerFunction,
  resolveContextSensitiveValue,
} from "../helpers/minecraftHelpers.js"
import { toTitleCase, StartAndEnd, SearchValue } from "../helpers/util.js"

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

/** Replaces a specified search string with another string */
export class ReplaceTransformer extends Transformer {
  searchValue
  replaceValue

  constructor(
    searchValue: FlexibleSearchValue,
    replaceValue: FlexibleReplacer
  ) {
    super(async ({ oldValue, languageFileData, language, version }) => {
      const resolvedSearch = await resolveContextSensitiveValue(
        searchValue,
        languageFileData,
        language,
        version
      )

      const resolvedReplacer = await resolveContextSensitiveValue(
        replaceValue,
        languageFileData,
        language,
        version
      )

      const replacer: ReplacerFunction = (
        substring: string,
        ...args: unknown[]
      ) => {
        if (typeof resolvedReplacer === "string")
          throw new Error(
            "Don't use the replacer function if the search value is a string. Instead, just directly pass the string to oldValue.replace()."
          )

        const captureGroups: string[] = []
        for (const [i, arg] of args.entries()) {
          if (typeof arg === "string") captureGroups.push(arg)
          else break
        }

        return resolvedReplacer(substring, captureGroups)
      }

      const newValue =
        typeof resolvedReplacer === "string"
          ? oldValue?.replace(resolvedSearch, resolvedReplacer)
          : // The built-in type for the parameters passed to the replacer function is just any[]
            oldValue?.replace(resolvedSearch, replacer as any)

      return {
        value: newValue,
      }
    })

    this.searchValue = searchValue
    this.replaceValue = replaceValue
  }
}

/** Similar to {@link ReplaceTransformer}, but can take into account context (stuff surrounding the target string) */
export class ContextualReplaceTransformer extends Transformer {
  constructor(
    search: { before?: RegExp; target: RegExp; after?: RegExp },
    replace: string
  ) {
    super(({ oldValue }) => {
      const fullRegex = new RegExp(
        `(?<before>${search.before?.source})(?<target>${search.target.source})(?<after>${search.after?.source})`
      )

      const newValue = oldValue.replace(
        fullRegex,
        `$<before>${replace}$<after>`
      )

      return { value: newValue }

      // const match = fullRegex.exec(oldValue)
      // const matchedTarget = match?.groups?.["target"]
      // if (!matchedTarget)
      //   return logger.error(
      //     "Could not find any matches for the provided search expression."
      //   )
    })
  }
}

/** Converts the whole string into Title Case. Useful for button labels etc. */
export class TitleCaseTransformer extends Transformer {
  constructor() {
    super(({ oldValue }) => ({
      value: toTitleCase(oldValue),
    }))
  }
}

/** Capitalises past of a string, as specified by a RegEx or simple search string */
export class CapitaliseSegmentTransformer extends Transformer {
  searchValue

  constructor(searchValue: FlexibleSearchValue) {
    super(async ({ oldValue, language, version, languageFileData }) => {
      const searchString = new RegExp(
        await resolveContextSensitiveValue(
          searchValue,
          languageFileData,
          language,
          version
        ),
        "gi"
      )

      const value = oldValue.replaceAll(searchString, toTitleCase)
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
      // Surround the string in \b to make sure it's a whole-word match
      // e.g. so we get "Full" but not "successFull"
      const matcher = new RegExp("\\b" + string + "\\b", "gi")
      const pluralMatcher = new RegExp("\\b" + string + "s\\b", "gi")

      // 0 if no match, 1 if it's singular, 2 if it's plural
      const match = matcher.test(currentValue)
        ? 1
        : pluralMatcher.test(currentValue)
        ? 2
        : 0

      if (!match) return

      // Case-insensitively replace all occurrences of the string with the properly-capitalised version from the lang file
      if (match === 1) {
        currentValue = currentValue.replaceAll(matcher, string)
      } else if (match === 2) {
        currentValue = currentValue.replaceAll(pluralMatcher, string + "s")
      }
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

export class RemoveWordTransformer extends ContextualReplaceTransformer {
  constructor(
    word: RegExp,
    options: {
      matchBefore?: RegExp
      matchAfter?: RegExp
    }
  ) {
    super(
      {
        before:
          options.matchBefore && new RegExp(options.matchBefore.source + " "),
        target: new RegExp(word.source + " "),
        after: options.matchAfter,
      },
      ""
    )
  }
}

/**
 * Adds a "plural guard" to the specified word.
 *
 * Plural guards are used when it is not known if a noun is singular or plural, e.g. "/kill is a command that kills the selected player(s)".
 * They are usually an "s" in brackets, but sometimes the letters "es" are used to keep the spelling of the word correct.
 *
 * It is recommended to specify the targetWord as a regex wrapped in `\b` so that it only matches whole words.
 */
export class PluralGuardTransformer extends ReplaceTransformer {
  constructor(targetWord: FlexibleSearchValue, pluralString: string = "s") {
    const pluralGuard = `(${pluralString})`

    super(targetWord, (word) => {
      // Strip the plural from the matched word, e.g. "players" becomes "player"
      const singularWord = word.replace(new RegExp(`${pluralString}$`), "")

      return singularWord + pluralGuard
    })
  }
}
