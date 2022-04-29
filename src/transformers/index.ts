import { Transformer, TransformerCallbackData } from "../builder.js"
import { toTitleCase } from "../util.js"

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
