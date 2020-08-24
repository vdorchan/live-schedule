import { numberEach, arrayRemoveItem } from './helper'
import { events } from './mixins/event'

/**
 * Manage cell selection.
 * @class {Selction}
 */
export default class Section {
  constructor(schedule, cell) {
    /**
     * @type {Cell}
     */
    this.cell = null

    /**
     * @type {number}
     */
    this.rowFrom = null

    /**
     * @type {number}
     */
    this.colFrom = null

    /**
     * @type {number}
     */
    this.rowSpan = null

    /**
     * @type {number}
     */
    this.rowIdxOfLastCell = null

    this.schedule = schedule
    this.table = schedule.table
    this.inProgress = true

    this.batchedCells = []
    this.setCell(cell)

    /**
     * Position of adjust, up of down.
     * @type {string}
     */
    this.positionOfAdjustment = null
  }

  selectMultiCol(colIdx, rowIdx) {
    const _batchedCells = [...this.batchedCells]
    this.batchedCells = []
    const cellsToMergedList = []

    const stopedCellConfig = { colIdx, rowIdx }

    numberEach(
      idx => {
        const cellsToMerged = this.adjust(idx, rowIdx)
        if (idx !== this.colFrom && this.colMeetData(cellsToMerged)) {
          stopedCellConfig.colIdx = idx
          return false
        }

        cellsToMergedList.push(cellsToMerged)

        arrayRemoveItem(_batchedCells, (cell) =>
          cellsToMerged.some((c) => c.colIdx === cell.getCell().colIdx)
        )
      },
      this.colFrom,
      colIdx
    )

    const maxNumberOfMerge = cellsToMergedList.reduce(
      (prev, current) => Math.min(prev, current.length),
      cellsToMergedList[0].length
    )

    cellsToMergedList.forEach(cellsToMerged => {
      const reverse = this.rowFrom > rowIdx
      cellsToMerged = reverse
        ? cellsToMerged
            .reverse()
            .slice(0, maxNumberOfMerge)
            .reverse()
        : cellsToMerged.slice(0, maxNumberOfMerge)
      const mergedCell = this.mergeRow(cellsToMerged)
      this.setCell(mergedCell)
      this.batchedCells.push(mergedCell)

      stopedCellConfig.rowIdx = cellsToMerged[0].rowIdx
    })
    _batchedCells.forEach((cell) => cell.getCell().deselect())

    this.schedule.showTooltip(
      this.table.getCell(stopedCellConfig.colIdx, stopedCellConfig.rowIdx)
    )
  }

  move(colIdx, rowIdx) {
    this.table.removeHighlights()
    const { numberOfRows } = this.table.settings
    const cellsToMerged = this.adjust(
      this.colFrom,
      rowIdx + (colIdx - this.colFrom) * numberOfRows
    )
    this.mergeRow(cellsToMerged)
  }

  cutCells(cells, length) {
    if (cells.length === 1) {
      return cells
    }

    return cells[0].rowIdx > cells[1].rowIdx
      ? cells.reverse().slice(0, length) .reverse()
      : cells.slice(0, length)
  }

  mergeRow(cellToMerged) {
    const currentCell = this.cell.getCell()
    return cellToMerged[0].cloneFrom(currentCell).merge(cellToMerged)
  }

  colMeetData(cells) {
    return !cells.length || cells.some((cell) => cell.getCell().hasData())
  }

  getEmptyCellsAtCol(colFrom, rowFrom, rowTo) {
    const emptyColCells = []
    const currentCell = this.cell
    numberEach(
      (idx) => {
        const cell = this.table.getCell(colFrom, idx)
        if (cell) {
          if (!currentCell.isSame(cell) && cell.getCell().hasData()) {
            return false
          }
          emptyColCells.push(cell)
        }
      },
      rowFrom,
      rowTo
    )

    return rowFrom > rowTo ? emptyColCells.reverse() : emptyColCells
  }

  adjust(colIdx, rowIdx) {
    if (!this.positionOfAdjustment && !this.cell.hasData()) {
      return this.getEmptyCellsAtCol(colIdx, this.rowFrom, rowIdx)
    } else if (this.positionOfAdjustment === 'down') {
      return this.getEmptyCellsAtCol(
        this.colFrom,
        this.rowFrom,
        Math.max(
          this.rowFrom,
          rowIdx - this.rowIdxOfLastCell + this.rowFrom + this.rowSpan - 1
        )
      )
    } else if (this.positionOfAdjustment === 'up') {
      const rowTo = this.rowFrom + this.rowSpan - 1
      return this.getEmptyCellsAtCol(
        this.colFrom,
        Math.min(rowTo, rowIdx),
        rowTo
      )
    }
  }

  /**
   *
   * @param {Cell} cell
   */
  setCell(cell) {
    this.cell = cell.getCell().select()
  }

  /**
   * @returns {Cell} cell
   */
  getCell() {
    return this.cell
  }

  /**
   * Indicate that selection procell began.
   */
  begin(cell, positionOfAdjustment) {
    this.setCell(cell)
    this.batchedCells.forEach(cell => cell.deselect())
    this.batchedCells = [this.cell]
    this.positionOfAdjustment = positionOfAdjustment || null
    this.rowFrom = this.cell.rowIdx
    this.colFrom = this.cell.colIdx
    this.rowSpan = this.cell.getRowSpan()
    this.rowIdxOfLastCell = this.cell.getRowIdxOfLastCell()
    this.table.removeHighlights()

    this.inProgress = !cell.hasData(true) || positionOfAdjustment
  }

  /**
   * Indicate that selection procell finished.
   */
  finish() {
    this.currentCell = null
    this.inProgress = false
    this.positionOfAdjustment = null
  }

  /**
   * Check if the process of selecting the cell/cells is in progress.
   */
  isInProgress() {
    return this.inProgress
  }

  /**
   * Deselect all cells.
   * @param {boolean} includesDataSelection
   */
  deselect(includesDataSelection) {
    this.table.removeHighlights()
    this.batchedCells.forEach((cell) => cell.getCell().deselect())
  }

  highlight() {
    this.batchedCells = this.batchedCells.filter((cell) => {
      if (cell.selected) {
        this.table.highlights.show(cell.getCell())
        return true
      }
      return false
    })
  }

  deleteCell(cell) {
    const selectedCell = this.getCell()
    const cellToDelete = cell || selectedCell
    if (cellToDelete.isSame(selectedCell)) {
      this.deselect()
    }

    cellToDelete.delete()
  }
}
