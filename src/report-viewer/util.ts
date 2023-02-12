/* FILE/FOLDER CONSTANTS */
export const debugReportsFolder = "debug"

/* TIME FORMATTING */
export function secs(milliseconds: number, decimalPlaces: number = 2) {
  const seconds = milliseconds / 1000
  return (
    seconds.toLocaleString(undefined, {
      maximumFractionDigits: decimalPlaces,
      minimumFractionDigits: decimalPlaces,
    }) + "s"
  )
}
