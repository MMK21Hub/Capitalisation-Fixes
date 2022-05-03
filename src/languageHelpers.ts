import { ResolvableFromLangFileSync } from "./minecraftHelpers"

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

const getMilk = createLanguageHelper((langFile) => "milk")
