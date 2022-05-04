import { ResolvableFromLangFileSync } from "./minecraftHelpers"
import { toWords } from "./util"

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
  })
}

export const getMilk = createLanguageHelper((langFile) => {
  const bucket = langFile["item.minecraft.bucket"].toLowerCase()
  const milkBucket = langFile["item.minecraft.milk_bucket"].toLowerCase()

  // Remove the word "bucket", and return the longest word
  return toWords(milkBucket)
    .filter((word) => word !== bucket)
    .sort((a, b) => b.length - a.length)[0]
})
