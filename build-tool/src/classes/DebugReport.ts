import { writeFile } from "fs/promises"
import { ensureDir } from "../helpers/utilNode.js"
import { join as joinPath } from "path"

export interface DebugTaskOptions {
  type: string
  trace?: string | number
  name?: string

  startTime?: number
  endTime?: number
  promise?: Promise<unknown>
  async?: boolean

  data?: unknown
}

export interface DebugTaskSerialised {
  type: string
  trace?: string | number
  name?: string
  startTime: number
  endTime?: number
  duration?: number
  data?: unknown
  children: DebugTaskSerialised[]
}

export class DebugTask {
  children: DebugTask[] = []
  async = false
  type
  trace
  name
  startTime
  endTime
  data

  constructor(options: DebugTaskOptions) {
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

  addPromise<T>(promise: Promise<T>) {
    this.async = true
    promise?.finally(() => {
      this.end()
    })
    return promise
  }

  end() {
    this.endTime = Date.now()
  }

  /** Add a child task */
  push(options: DebugTaskOptions) {
    return this.pushRaw(new DebugTask(options))
  }

  pushRaw<T extends DebugTask>(task: T) {
    this.children.push(task)
    return task
  }

  /** Calculate the task's duration, in milliseconds */
  duration() {
    if (!this.endTime) return undefined

    return this.endTime - this.startTime
  }

  /** Convert the task to a JSON-friendly object */
  toObject(): DebugTaskSerialised {
    return {
      type: this.type,
      trace: this.trace,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration(),
      data: this.data,
      children: this.children.map((task) => task.toObject()),
    }
  }
}

export interface DebugReportSerialised {
  startTime: number
  endTime?: number
  duration?: number
  tasks: DebugTaskSerialised[]
}

/** A generic system for tracking and logging debug information and performance stats */
export class DebugReport {
  tasks: DebugTask[] = []
  finished = false
  startTime: number
  endTime?: number

  constructor() {
    this.startTime = Date.now()
  }

  /** Create a task */
  push(options: DebugTaskOptions) {
    return this.pushRaw(new DebugTask(options))
  }

  pushRaw<T extends DebugTask>(task: T) {
    if (this.finished)
      throw new Error("Cannot add a task to a finished debug report")

    this.tasks.push(task)
    return task
  }

  end() {
    this.finished = true
    this.endTime = Date.now()
  }

  /** Calculate the time that this debug session took, in milliseconds */
  duration() {
    if (!this.endTime)
      throw new Error(
        "Cannot calculate duration if the debug report isn't finished"
      )

    return this.endTime - this.startTime
  }

  /** @returns All the debug data, ready to be serialised into JSON */
  toObject(): DebugReportSerialised {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration(),
      tasks: this.tasks.map((task) => task.toObject()),
    }
  }

  async exportToFile(...path: string[]) {
    const data = JSON.stringify(this.toObject(), null, 2)
    await ensureDir(joinPath(...path.slice(0, -1)))
    await writeFile(joinPath(...path), data, "utf8")
  }
}
