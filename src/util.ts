/** Specify a value, or provide a function that returns that value */
export type FunctionMaybe<T, A extends any[] = []> = T | ((...args: A) => T)
/** Like {@link FunctionMaybe}, but with named arguments for readability */
export type FunctionMaybeArgs<T, A extends Record<string, any>> = FunctionMaybe<
  T,
  A[string][]
>
/**
 * Represents the start and end points of a range
 * @example
 * [3, 5] // Between 3 and 5
 * [3, null] // Anything after 3
 * [null, 5] // Anything before 5
 * [null, null] // Anything and everything
 */
export type StartAndEnd<T> = [T | null, T | null]
/** Represents a {@link Range}, with options for excluding parts within that range */
export type FancyRange<T> = {
  start: T
  end: T
  exclude?: Range<T>
  include?: Range<T>
  exclusiveStart?: boolean
  exclusiveEnd?: boolean
}
/** A set of items within start and end limits. Can be represented in multiple ways. */
export type Range<T> = StartAndEnd<T> | FancyRange<T>

// https://stackoverflow.com/a/46842181/11519302
export async function filter<T>(
  array: T[],
  predicate: (item: T) => Promise<boolean>
) {
  const fail = Symbol()
  return (
    await Promise.all(
      array.map(async (item) => ((await predicate(item)) ? item : fail))
    )
  ).filter((i) => i !== fail) as T[]
}
