import {
  DebugReportSerialised,
  DebugTask,
  DebugTaskSerialised,
} from "../DebugReport.js"
import { calculateColor, insertString as replaceCharAt, secs } from "./util.js"
import chalk from "chalk"

export interface ReportRendererOptions {
  reportData: DebugReportSerialised
}

export class ReportRenderer {
  // Options for customising the display of debug reports
  indentWidth = 2

  report
  currentTaskIndex
  indents: number[] = []

  constructor(options: ReportRendererOptions) {
    const { reportData } = options

    this.report = reportData
    this.currentTaskIndex = [0]
  }

  currentTaskDepth() {
    return this.currentTaskIndex.length
  }

  calculateIndentation() {
    const indentLevels = this.currentTaskDepth() - 1
    return indentLevels * this.indentWidth
  }

  indentationString() {
    const totalWidth = this.calculateIndentation()
    this.indents.push(totalWidth)
    if (totalWidth === 0) return ""

    const character = " "
    let padding = character.repeat(totalWidth)

    for (let i = 0; i < totalWidth; i += this.indentWidth) {
      padding = replaceCharAt(padding, i, "│")
    }

    const nextTask = this.findNextTask()
    const hasProceedingSibling =
      // nextTask && nextTask.length <= this.currentTaskIndex.length
      !!this.findNextTask(this.currentTaskIndex, {
        stepInto: false,
        stepOut: false,
      })
    const hasChild = this.getCurrentTask().children.length
    const lastCharacter = hasProceedingSibling || hasChild ? "├╴" : "└╴"
    padding = replaceCharAt(padding, -2, lastCharacter)

    return padding
  }

  getTaskAt(...indexes: number[]): DebugTaskSerialised | undefined {
    let task: DebugTaskSerialised | DebugReportSerialised | undefined =
      this.report

    indexes.forEach((index, i) => {
      if (!task) return undefined
      const children = "tasks" in task ? task.tasks : task.children
      task = children.at(index)
    })

    return task as any
  }

  getCurrentTask() {
    return this.getTaskAt(...this.currentTaskIndex)!
  }

  findNextTask(
    currentIndex: number[] = this.currentTaskIndex,
    options: { stepInto?: boolean; stepOut?: boolean } = {}
  ) {
    let { stepInto = true, stepOut = true } = options

    let nextTaskIndex: number[] = currentIndex.slice()

    for (let depth = nextTaskIndex.length - 1; depth >= 0; depth--) {
      const index = nextTaskIndex[depth]
      const oldTask = this.getTaskAt(...nextTaskIndex)!
      const newIndexes = nextTaskIndex.slice()

      if (stepInto && oldTask.children.length !== 0) {
        // The current task has children, so step into the first child
        nextTaskIndex.push(0)
        break
      }

      const nextIndex = index + 1
      newIndexes[depth] = nextIndex
      const nextTaskExists = !!this.getTaskAt(...newIndexes)
      if (nextTaskExists) {
        // This level of the tree has a sibling that we can move to
        nextTaskIndex = newIndexes
        break
      }

      if (!stepOut) return null

      stepInto = false
      nextTaskIndex.pop()
    }

    return nextTaskIndex.length ? nextTaskIndex : null
  }

  /**
   * Updates `this.currentTaskIndex` to the index of the next task in the "task tree" of tasks and child tasks.
   * If required, it will 'move' up or down a level to get to the next task.
   * @param stepInto Set to `false` to prevent going deeper into the task tree
   * @returns The current task, or `null` if we are at the end of the task tree
   */
  bumpCurrentTask(stepInto = true) {
    const nextTask = this.findNextTask(this.currentTaskIndex, { stepInto })
    if (nextTask) this.currentTaskIndex = nextTask
    return nextTask ? this.getTaskAt(...nextTask) : undefined
  }

  printTasks() {
    let currentTask: DebugTaskSerialised | undefined = this.getCurrentTask()
    while (currentTask !== undefined) {
      const indent = this.indentationString()
      const title = chalk.bold(currentTask.name || chalk(currentTask.type))
      let line = `${indent}${title}`
      if (currentTask.duration) {
        line += ` ${secs(currentTask.duration)}`
      }
      const color = currentTask.duration
        ? calculateColor(currentTask.duration)
        : chalk.reset
      console.log(color(line))

      // Move on to the next task
      currentTask = this.bumpCurrentTask()
    }
  }

  printReport() {
    const startTime = new Date(this.report.startTime)
    let preamble = `Session started at ${startTime.toLocaleString()}`

    if (this.report.duration) {
      preamble += ` and lasted ${secs(this.report.duration)}`
    }

    console.log(preamble)

    this.printTasks()
  }
}
