import { writeFile } from "fs/promises"
import { ensureDir } from "./util.js"
import { join as joinPath } from "path"

export interface DebugEventOptions {
  type: string
  trace?: string | number
  name?: string

  startTime?: number
  endTime?: number
  promise?: Promise<unknown>
  async?: boolean

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
  async = false
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

    if (options.promise) {
      this.addPromise(options.promise)
    }
  }

  addPromise(promise: Promise<unknown>) {
    this.async = true
    promise?.finally(() => {
      this.end()
    })
    return promise
  }

  end() {
    this.endTime = Date.now()
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

  async exportToFile(...path: string[]) {
    const data = JSON.stringify(this.toObject(), null, 4)
    await ensureDir(joinPath(...path.slice(0, -1)))
    await writeFile(joinPath(...path), data, "utf8")
  }
}

export interface OutFileReporterOptions {
  targetLanguages: string[]
  targetVersion: string
  index: number
  promise: Promise<unknown>
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
      trace: options.index,
      name: `Generating language files for ${options.targetVersion}`,
      promise: options.promise,
    })
  }

  newLanguageFile() {}
}
