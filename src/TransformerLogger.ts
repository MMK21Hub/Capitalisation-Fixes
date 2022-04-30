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
    if (this.hour > 23) {
      throw new ValidationError("hour", "Hour must be between 0 and 23")
    }
    if (this.minute > 59) {
      throw new ValidationError("minute", "Minute must be between 0 and 59")
    }
    if (this.second > 59) {
      throw new ValidationError("second", "Second must be between 0 and 59")
    }

    this.decimalSeconds.forEach((decimalSecond) => {
      // Check for multiple decimal seconds with the same exponent
      const duplicates = this.decimalSeconds.filter(
        (dc) => dc.exponent === decimalSecond.exponent
      )

      if (duplicates.length > 1) {
        const duplicatesString = duplicates
          .map((ds, i) => `#${i} (${ds.value})`)
          .join(", ")

        throw new ValidationError(
          `decimalSeconds`,
          `Multiple decimal seconds specified for the same exponent (${decimalSecond.exponent})`,
          `Items with the same exponent: ${duplicatesString}`
        )
      }

      if (decimalSecond.exponent > 0) throw new ValidationError("exponent")
    })

    this.decimalSeconds.forEach((decimalSecond) => {})
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
