import EventEmitter from "node:events"

export enum MessageType {
  Info,
  Warn,
  Error,
}

interface Message {
  type: MessageType
  message: string
  timestamp: Timestamp
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
  decimalSeconds: DecimalSecond[] = []

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

    if (this.leapDay && this.day !== maxDays) {
      const recommendedSolution = `Set #day to ${
        this.day + 1
      } and #leapDay to false`

      throw new ValidationError(
        "leapDay",
        "Leap days can only occur at the end of the month",
        `Current month number: ${this.month}\n` +
          `Expected day for a leap day: ${maxDays}\n` +
          `Recommended solution: ${recommendedSolution}\n` +
          `Alternative solution: Set #day to ${maxDays}`
      )
    }

    if (
      this.leapSecond &&
      (this.second !== 59 || this.minute !== 59 || this.hour !== 23)
    ) {
      const getSuggestion: () => [string, number] = () => {
        if (this.second !== 59) return ["second", this.second + 1]
        if (this.minute !== 59) return ["minute", this.minute + 1]
        return ["hour", this.hour + 1]
      }

      const [field, value] = getSuggestion()

      throw new ValidationError(
        "leapSecond",
        "Leap seconds can only occur at the very end of the day",
        `Provided time: ${this.simpleTime()}\n` +
          `Expected time: 23:59:59\n` +
          `Recommended solution: Set #${field} to ${value} and #leapSecond to false\n` +
          `Alternative solution: Set #hour to 23, #minute to 59 and #second to 59`
      )
    }
  }

  invalidReason() {
    try {
      this.assertValid()
      return null
    } catch (e) {
      if (e instanceof ValidationError) return e
      throw e
    }
  }

  checkValid() {
    return !!this.invalidReason()
  }

  getPaddingAmount(field: string) {
    if (field === "day") return 2
    if (field === "month") return 2
    if (field === "year") return 4
    if (field === "hour") return 2
    if (field === "minute") return 2
    if (field === "second") return 2
    return 0
  }

  getPaddedValues(...values: (keyof this)[]) {
    return values
      .map((key) => [key, this[key]] as [keyof this, this[keyof this]])
      .map(([key, value]) => {
        if (typeof value !== "number" || typeof key !== "string") return value
        const padding = this.getPaddingAmount(key)
        return value.toString().padStart(padding, "0")
      })
  }

  simpleTime(): string {
    const [hour, minute, second] = this.getPaddedValues(
      "hour",
      "minute",
      "second"
    )

    return `${hour}:${minute}:${second}`
  }

  fullTime(): string {
    let decimals = 0.0
    this.decimalSeconds.forEach((decimalSecond) => {
      decimals += decimalSecond.value * 10 ** decimalSecond.exponent
    })

    // Append the decimal places, with the leading 0 stripped, to the simple time
    return this.simpleTime() + decimals.toString().substring(1)
  }

  toISO() {
    const [year, month, day] = this.getPaddedValues("year", "month", "day")
    return `${year}-${month}-${day}T${this.fullTime()}`
  }

  toDate(): Date {
    return new Date(this.toISO())
  }

  setDecimalSecond(exponent: number, value: number) {
    const matchingDecimalSeconds = this.decimalSeconds.find(
      (ds) => ds.exponent === exponent
    )

    matchingDecimalSeconds
      ? // Update an already-existing decimalSecond item if it exists
        (matchingDecimalSeconds.value = value)
      : // Otherwise, add a new decimalSecond item with the provided value
        this.decimalSeconds.push(new DecimalSecond(exponent, value))
  }

  constructor(timestamp: Timestamp | Date | number) {
    const jsDate =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp)

    this.hour = jsDate.getUTCHours()
    this.minute = jsDate.getUTCMinutes()
    this.second = jsDate.getUTCSeconds()

    this.day = jsDate.getUTCDate()
    this.month = jsDate.getUTCMonth() + 1
    this.year = jsDate.getUTCFullYear()

    this.decimalSeconds.push({ value: jsDate.getMilliseconds(), exponent: -3 })
  }
}

export default class TransformerLogger extends EventEmitter {
  info(message: string) {
    this.emit("message", { content: message, type: MessageType.Info })
  }

  warn(message: string) {
    this.emit("message", { content: message, type: MessageType.Warn })
  }

  error(message: string) {
    this.emit("message", { content: message, type: MessageType.Error })
  }

  getMessages(...types: MessageType[]) {
    return types === []
      ? this.messages
      : this.messages.filter(({ type }) => types.includes(type))
  }

  countMessages(...types: MessageType[]) {
    return this.getMessages(...types).length
  }

  readonly messages: Message[] = []

  constructor() {
    super()

    this.on(
      "message",
      ({ type, content }: { type: MessageType; content: string }) => {
        const eventName = MessageType[type].toLowerCase()

        this.messages.push({
          type,
          message: content,
          timestamp: new Timestamp(Date.now()),
        })

        this.emit(eventName, content)
      }
    )
  }
}
