import Fix from "./Fix"
import { OverrideTransformer } from "./transformers"

export function overrideGroup(
  bug: string,
  strings: Record<string, string>,
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
        transformer: new OverrideTransformer(value),
      })
  )
}
