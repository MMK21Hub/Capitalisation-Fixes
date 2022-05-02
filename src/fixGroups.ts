import Fix from "./Fix"
import { OverrideTransformer } from "./transformers"

export function overrideGroup(
  bug: string,
  strings: Record<string, string>
): Fix[] {
  return Object.entries(strings).map(
    ([key, value]) =>
      new Fix({ bug, key, transformer: new OverrideTransformer(value) })
  )
}
