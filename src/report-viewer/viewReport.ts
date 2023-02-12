import { DebugReportSerialised, DebugTaskSerialised } from "../DebugReport.js"
import { calculateColor, secs } from "./util.js"
import chalk from "chalk"

export interface ReportRendererOptions {
  reportData: DebugReportSerialised
}

export class ReportRenderer {
  report
  currentTaskIndex

  constructor(options: ReportRendererOptions) {
    const { reportData } = options

    this.report = reportData
    this.currentTaskIndex = [0]
  }

  currentTaskDepth() {
    return this.currentTaskIndex.length
  }

  calculateIndentation() {
    const indentWidth = 2
    const indentLevels = this.currentTaskDepth() - 1
    return indentLevels * indentWidth
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

  /**
   * Updates `this.currentTaskIndex` to the index of the next task in the "task tree" of tasks and child tasks.
   * If required, it will 'move' up or down a level to get to the next task.
   * @param stepInto Set to `false` to prevent going deeper into the task tree
   * @returns The current task, or `null` if we are at the end of the task tree
   */
  bumpCurrentTask(stepInto = true) {
    let foundNextTask = false

    for (let depth = this.currentTaskIndex.length - 1; depth >= 0; depth--) {
      const index = this.currentTaskIndex[depth]
      const oldTask = this.getCurrentTask()
      const newIndexes = this.currentTaskIndex.slice()

      if (stepInto && oldTask.children.length !== 0) {
        // The current task has children, so step into the first child
        this.currentTaskIndex.push(0)
        foundNextTask = true
        break
      }

      const nextIndex = index + 1
      newIndexes[depth] = nextIndex
      const nextTaskExists = !!this.getTaskAt(...newIndexes)
      if (nextTaskExists) {
        // This level of the tree has a sibling that we can move to
        this.currentTaskIndex = newIndexes
        foundNextTask = true
        break
      }

      stepInto = false
      this.currentTaskIndex.pop()
    }

    return foundNextTask ? this.getCurrentTask() : undefined
  }

  printTasks() {
    let currentTask: DebugTaskSerialised | undefined = this.getCurrentTask()
    while (currentTask !== undefined) {
      const indent = " ".repeat(this.calculateIndentation())
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
