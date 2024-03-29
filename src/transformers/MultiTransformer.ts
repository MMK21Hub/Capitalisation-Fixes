import { Transformer } from "../builder.js"

/** Lets you apply multiple transformers to a single translation string */
export class MultiTransformer extends Transformer {
  transformers

  constructor(transformers: Transformer[]) {
    super(
      async ({
        oldValue,
        key,
        logger,
        language,
        version,
        languageFileData,
      }) => {
        let currentValue = oldValue

        // Run each transformer, providing it with the output from the previous one
        for (const transformer of transformers) {
          const result = await transformer.callback({
            key,
            oldValue: currentValue,
            logger,
            language,
            version,
            languageFileData,
          })

          // Update the current value
          currentValue = result.value
        }

        // currentValue shouldn't be null at this point, unless:
        // - The key is not present in the vanilla language file; and
        // - No transformers have touched it (i.e. none were provided)
        if (!currentValue)
          throw new Error(
            "No value returned from transformers. Were any transformers provided?"
          )

        // Return the final value and the original key
        return { value: currentValue, key }
      }
    )

    this.transformers = transformers
  }
}
