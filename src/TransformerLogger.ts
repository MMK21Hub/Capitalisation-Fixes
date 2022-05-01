import EventEmitter from "node:events"

enum MessageType {
  Info,
  Warn,
  Error,
}

interface Message {
  type: MessageType
  message: string
}

export class ValidationError extends Error {
  property
  details

  constructor(property: string, message?: string, details?: string) {
    super(message)
    this.name = "ValidationError"
    this.property = property
    this.details = details
  }
}

const monthLengths: Record<number, number> = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
}

class DecimalSecond {
  exponent
  value

  constructor(exponent: number, value: number) {
    this.exponent = exponent
    this.value = value
  }
}

export class Timestamp {
  hour: number
  minute: number
  second: number
  /** Divisions of a second, e.g. milliseconds and nanoseconds */
  decimalSeconds: DecimalSecond[]

  day: number
  month: number
  year: number

  /** True if the date is February 29th */
  leapDay: boolean = false
  /** True if the time is 23:59:60 */
  leapSecond: boolean = false

  assertValid() {
    if (this.hour > 23 || this.hour < 0)
      throw new ValidationError("hour", "Hour must be between 0 and 23")
    if (this.minute > 59 || this.minute < 0)
      throw new ValidationError("minute", "Minute must be between 0 and 59")
    if (this.second > 59 || this.second < 0)
      throw new ValidationError("second", "Second must be between 0 and 59")

    if (this.day <= 0)
      throw new ValidationError("day", "Day cannot be positive")
    if (this.month > 12 || this.month < 1)
      throw new ValidationError("month", "Month must be between 1 and 12")

    const maxDays = monthLengths[this.month]
    if (this.day > maxDays) {
      const isLeap = this.month === 2 && this.day === 29
      throw new ValidationError(
        "day",
        `Specified day is over the maximum day count for month ${this.month}` +
          (isLeap ? ". Set #leapDay to represent Feb 29" : ""),
        `Expected a value from 1 to ${maxDays}, but got ${this.day}`
      )
    }

    this.decimalSeconds.forEach((decimalSecond, i) => {
      // Check for multiple decimal seconds with the same exponent
      const duplicates = this.decimalSeconds.filter(
        (dc) => dc.exponent === decimalSecond.exponent
      )

      if (duplicates.length > 1) {
        const duplicatesString = duplicates
          .map((ds, i) => `#${i} (${ds.value})`)
          .join(", ")

        throw new ValidationError(
          "decimalSeconds",
          `Multiple decimal seconds specified for the same exponent (${decimalSecond.exponent})`,
          "Items with the same exponent: " + duplicatesString
        )
      }

      if (decimalSecond.exponent === 0)
        throw new ValidationError(
          `decimalSeconds[${i}].exponent`,
          "Exponent cannot be 0. Modify the Timestamp#second field to specify seconds."
        )

      if (decimalSecond.exponent > 0)
        throw new ValidationError(
          `decimalSeconds[${i}].exponent`,
          "Exponent must be negative. Use minutes/hours etc to specify units of time larger than 1 second.",
          "Provided value: " + decimalSecond.exponent
        )

      if (decimalSecond.exponent % 3) {
        const suggestedValue =
          decimalSecond.value * 10 ** Math.abs(decimalSecond.exponent)
        const suggestedExponent = Math.floor(decimalSecond.exponent / 3) * 3

        throw new ValidationError(
          `decimalSeconds[${i}].exponent`,
          "Exponent must be a multiple of three. To specify other resolutions, use a smaller exponent and multiply the value by 10 or 100.",
          `Provided value: ${decimalSecond.exponent}\n` +
            `Suggested value: ${suggestedValue} (with exponent ${suggestedExponent})`
        )
      }
    })
  }

  toISO() {
    const { year, month, day, hour, minute, second } = this
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
  }

  toDate(): Date {
    return new Date(this.toISO())
  }
}

export default class TransformerLogger extends EventEmitter {
  info(message: string) {
    this.emit("info", message)
    this.messages.push({ type: MessageType.Info, message })
  }

  warn(message: string) {
    this.emit("warn", message)
    this.messages.push({ type: MessageType.Warn, message })
  }

  error(message: string) {
    this.emit("error", message)
    this.messages.push({ type: MessageType.Error, message })
  }

  messages: Message[] = []
}
