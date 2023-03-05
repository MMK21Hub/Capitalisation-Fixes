import chalk from "chalk"

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

/* TEXT FORMATTING */
export function calculateColor(time: number) {
  if (time < 50) return chalk.greenBright
  if (time < 100) return chalk.green
  if (time < 500) return chalk.yellow
  if (time < 1000) return chalk.redBright
  return chalk.red
  // return chalk.reset
}

export function insertString(string: string, index: number, newString: string) {
  if (index > string.length - 1) return string
  const insertLength = newString.length
  return index < 0
    ? string.slice(0, index) +
        newString +
        string.slice(index + insertLength || Infinity)
    : string.substring(0, index) +
        newString +
        string.substring(index + insertLength)
}
