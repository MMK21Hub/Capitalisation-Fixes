export interface DebugEventOptions {
  type: string
  trace?: string | number
  name?: string
  startTime?: number
  endTime?: number
  data?: unknown
}

export interface DebugEventSerialised {
  type: string
  trace?: string | number
  name?: string
  startTime: number
  endTime?: number
  data?: unknown
  children: DebugEventSerialised[]
}

export class DebugEvent {
  children: DebugEvent[] = []
  type
  trace
  name
  startTime
  endTime
  data

  constructor(options: DebugEventOptions) {
    this.type = options.type
    this.trace = options.trace
    this.name = options.name
    this.startTime = options.startTime || Date.now()
    this.endTime = options.endTime
    this.data = options.data
  }

  /** Add a child event */
  push(options: DebugEventOptions) {
    const event = new DebugEvent(options)
    this.children.push(event)
    return event
  }

  /** Convert the event to a JSON-friendly object */
  toObject(): DebugEventSerialised {
    return {
      type: this.type,
      trace: this.trace,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      data: this.data,
      children: this.children.map((event) => event.toObject()),
    }
  }
}

/** A generic system for tracking and logging debug information and performance stats */
export class DebugReport {
  events: DebugEvent[] = []
  startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  /** Add an event */
  push(options: DebugEventOptions) {
    const event = new DebugEvent(options)
    this.events.push(event)
    return event
  }

  /** @returns All the debug data, ready to be serialised into JSON */
  toObject() {
    return {
      startTime: this.startTime,
      events: this.events.map((event) => event.toObject()),
    }
  }
}

export interface OutFileReporterOptions {
  targetLanguages: string[]
  targetVersion: string[]
  index: number
}

/** A {@link DebugReport} with methods specific to the Capitalisation Fixes build tool */
export class BuilderDebugReport extends DebugReport {
  constructor() {
    super()
  }

  newOutFile(options: OutFileReporterOptions) {
    this.push({
      type: "generateLanguageFileSet",
      data: {
        targetLanguages: options.targetLanguages,
        targetVersion: options.targetVersion,
      },
      name: `Generating language files for ${options.targetVersion}`,
    })
  }

  newLanguageFile() {}
}
