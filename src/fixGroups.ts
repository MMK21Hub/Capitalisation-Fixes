import { Transformer } from "./builder.js"
import Fix from "./classes/Fix.js"
import {
  MinecraftVersionRange,
  MinecraftVersionSimpleRangeTemplate,
} from "./classes/minecraftVersions.js"
import {
  FlexibleSearchValue,
  MinecraftVersionSpecifier,
} from "./helpers/minecraftHelpers.js"
import {
  CapitaliseFromTranslationStringsTransformer,
  CapitaliseSegmentTransformer,
  OverrideTransformer,
  TitleCaseTransformer,
} from "./transformers/index.js"

export function fixGroup(
  bug: string,
  strings: Record<string, string | Transformer>,
  options: {
    keyPrefix?: string
    versions?: MinecraftVersionSimpleRangeTemplate | MinecraftVersionRange
  } = {}
): Fix[] {
  let { keyPrefix = "", versions } = options
  if (keyPrefix && !keyPrefix.endsWith(".")) keyPrefix += "."

  return Object.entries(strings).map(
    ([key, value]) =>
      new Fix({
        bug,
        key: `${keyPrefix}${key}`,
        transformer:
          value instanceof Transformer ? value : new OverrideTransformer(value),
        versions,
      })
  )
}

export function multiFixGroup(
  bug: string,
  transformer: Transformer,
  translationKeys: string[],
  options: {
    keyPrefix?: string
    versions?: MinecraftVersionSimpleRangeTemplate | MinecraftVersionRange
  } = {}
) {
  let { keyPrefix = "", versions } = options
  if (keyPrefix && !keyPrefix.endsWith(".")) keyPrefix += "."

  const targetKeys = keyPrefix
    ? translationKeys.map((key) => `${keyPrefix}${key}`)
    : translationKeys

  return targetKeys.map((key) => new Fix({ bug, key, transformer, versions }))
}

export function titleCaseGroup(
  bug: string,
  translationKeys: string[],
  options: {
    keyPrefix?: string
  } = {}
): Fix[] {
  let { keyPrefix = "" } = options
  if (keyPrefix && !keyPrefix.endsWith(".")) keyPrefix += "."

  return translationKeys.map(
    (key) =>
      new Fix({
        bug,
        key: `${keyPrefix}${key}`,
        transformer: new TitleCaseTransformer(),
      })
  )
}

export function autoCapitaliseGroup(
  bug: string,
  translationKeys: string[],
  options: {
    keyPrefix?: string
    vanillaStrings?: string[]
    alwaysCapitalise?: FlexibleSearchValue[]
    versions?: MinecraftVersionSimpleRangeTemplate | MinecraftVersionRange
  } = {}
): Fix[] {
  let {
    keyPrefix = "",
    vanillaStrings = ["block.**", "item.**", "entity.**"],
    versions,
  } = options
  if (keyPrefix && !keyPrefix.endsWith(".")) keyPrefix += "."

  const autoCapitaliser = new CapitaliseFromTranslationStringsTransformer({
    vanillaStrings,
  })

  const transformer: Transformer | Transformer[] = options.alwaysCapitalise
    ? [autoCapitaliser]
    : autoCapitaliser

  options.alwaysCapitalise?.forEach((searchValue) =>
    (transformer as Transformer[]).push(
      new CapitaliseSegmentTransformer(searchValue)
    )
  )

  return translationKeys.map(
    (key) =>
      new Fix({
        bug,
        key: `${keyPrefix}${key}`,
        transformer,
        versions,
      })
  )
}
