import { Transformer } from "./builder.js"
import Fix from "./Fix.js"
import { OverrideTransformer } from "./transformers/index.js"

export function stringGroup(
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
