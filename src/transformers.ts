import { Transformer, TransformerCallbackData } from "./builder.js"
import { toTitleCase } from "./util.js"

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

/** Lets you apply multiple transformers to a single translation string */
export class MultiTransformer extends Transformer {
  transformers

  constructor(transformers: Transformer[]) {
    super((data) => {
      let currentValue = data.oldValue

      // Run each transformer, providing it with the output from the previous one
      transformers.forEach((transformer) => {
        const result = transformer.callback({
          key: data.key,
          oldValue: currentValue,
        })

        // Update the current value
        currentValue = result.value
      })

      // currentValue shouldn't be null at this point, unless:
      // - The key is not present in the vanilla language file; and
      // - No transformers have touched it (i.e. none were provided)
      if (!currentValue)
        throw new Error(
          "No value returned from transformers. Were any transformers provided?"
        )

      // Return the final value and the original key
      return { value: currentValue, key: data.key }
    })

    this.transformers = transformers
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

export class CapitaliseSegmentTransformer extends Transformer {
  searchValue

  constructor(searchValue: string | RegExp) {
    super(({ oldValue }) => {
      if (!oldValue) return { value: null }

      if (typeof searchValue === "string") {
        const newValue = oldValue.replace(searchValue, toTitleCase(searchValue))
        return {
          value: newValue,
        }
      }

      const matches = oldValue.match(searchValue)
      let value = oldValue
      matches?.forEach((match) => {
        // Convert each matched test segment to title case
        value = value.replace(match, toTitleCase(match))
      })

      return {
        value,
      }
    })

    this.searchValue = searchValue
  }
}
