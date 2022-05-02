import { Transformer } from "./builder.js"
import Fix from "./Fix.js"
import {
  OverrideTransformer,
  TitleCaseTransformer,
} from "./transformers/index.js"

export function fixGroup(
  bug: string,
  strings: Record<string, string | Transformer>,
  options: {
    keyPrefix?: string
  } = {}
): Fix[] {
  let { keyPrefix = "" } = options
  if (keyPrefix && !keyPrefix.endsWith(".")) keyPrefix += "."

  return Object.entries(strings).map(
    ([key, value]) =>
      new Fix({
        bug,
        key: `${keyPrefix}${key}`,
        transformer:
          value instanceof Transformer ? value : new OverrideTransformer(value),
      })
  )
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
