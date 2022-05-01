import { Transformer, TransformerCallbackData } from "../builder.js"
import { toTitleCase, Range, StartAndEnd } from "../util.js"

/** Provide a custom callback function to do advanced transformations that aren't covered by existing transformers */
export class CustomTransformer extends Transformer {
  constructor(callback: (data: TransformerCallbackData) => string) {
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

  constructor(searchValue: string | RegExp, replaceValue: string) {
    super(({ oldValue }) => ({
      value: oldValue?.replace(searchValue, replaceValue),
    }))

    this.searchValue = searchValue
    this.replaceValue = replaceValue
  }
}

/** Capitalises past of a string, as specified by a RegEx or simple search string */
export class CapitaliseSegmentTransformer extends Transformer {
  searchValue

  constructor(searchValue: string | RegExp) {
    super(({ oldValue }) => {
      if (!oldValue) return { value: null }
      const value = oldValue.replace(searchValue, toTitleCase)
      return { value }
    })

    this.searchValue = searchValue
  }
}

/** Capitalises the parts of a string that are in-between the provided search strings (inclusively)  */
export class CapitaliseSectionTransformer extends Transformer {
  range: StartAndEnd<string | RegExp>

  constructor(start: string | RegExp | null, end: string | RegExp | null) {
    super(({ oldValue, key, logger }) => {
      if (!oldValue) return { value: null }

      const [start, end] = this.range

      const simpleStart = typeof start === "string"
      const simpleEnd = typeof end === "string"

      const startIndex =
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
