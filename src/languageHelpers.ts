import {
  MinecraftLanguage,
  MinecraftVersion,
  ResolvableFromLangFileSync,
} from "./minecraftHelpers"

export type LanguageHelperCallback<O = undefined> = (
  language: MinecraftLanguage,
  version: MinecraftVersion,
  options?: O
) => string

export type LanguageHelper<O = undefined> = (
  options?: O
) => ResolvableFromLangFileSync

function createLanguageHelper<O = undefined>(
  callback: LanguageHelperCallback<O>
): LanguageHelper<O> {
  return (options?: O) => ({
    resolve(language: MinecraftLanguage, version: MinecraftVersion) {
      return callback(language, version, options)
    },
  })
}

const getMilk = createLanguageHelper((language, version) => "milk")

getMilk().resolve("en_us", "1.14.4")
