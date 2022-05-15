import { ResolvableFromLangFileSync } from "./minecraftHelpers.js"
import { isSingleWord, toWords } from "./util.js"

export type LanguageHelperCallback<O = undefined> = (
  langFile: Record<string, string>,
  options?: O
) => string

export type LanguageHelper<O = undefined> = (
  options?: O
) => ResolvableFromLangFileSync

function createLanguageHelper<O = undefined>(
  callback: LanguageHelperCallback<O>
): LanguageHelper<O> {
  return (options?: O) => ({
    resolve(languageFileData: Record<string, string>) {
      return callback(languageFileData, options)
    },
    sync: true,
  })
}

export class FailedLanguageHelper extends Error {
  details: string[]

  constructor(message: string, ...details: string[]) {
    super(message)
    this.name = "FailedLanguageHelper"
    this.details = details
  }
}

export const getMilk = createLanguageHelper((langFile) => {
  const bucket = langFile["item.minecraft.bucket"].toLowerCase()
  const milkBucket = langFile["item.minecraft.milk_bucket"].toLowerCase()

  if (!isSingleWord(bucket))
    throw new FailedLanguageHelper(
      `Expected translation string "item.minecraft.milk_bucket" to be a single word`,
      `Actual value: "${milkBucket}"`
    )

  // Remove the word "bucket", and return the longest word
  return toWords(milkBucket)
    .filter((word) => word !== bucket)
    .sort((a, b) => b.length - a.length)[0]
})
