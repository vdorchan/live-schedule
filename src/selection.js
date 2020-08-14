import { numberEach } from './helper'

/**
 * Manage cell selection.
 * @class {Selction}
 */
export default class Section {
  constructor(schedule, cell) {
    this.cell = null
    this.rowFrom = null
    this.colFrom = null
    this.rowSpan = null

    this.setCell(cell)
    this.schedule = schedule
    this.table = schedule.table
    this.inProgress = true

    /**
     * Position of adjust, up of down.
     * @type {string}
     */
    this.positionOfAdjustment = null
  }

  selectMultiCol() {}

  mergeRow(rowFrom, rowTo) {
    const currentCell = this.cell.getCell()

    let cellToMerged = this.getEmptyCellsAtCol(rowFrom, rowTo)

    cellToMerged = rowFrom > rowTo ? cellToMerged.reverse() : cellToMerged
    return cellToMerged[0].cloneFrom(currentCell).merge(cellToMerged)
  }

  getEmptyCellsAtCol(rowFrom, rowTo) {
    let emptyColCells = []
    const currentCell = this.cell
    numberEach(
      (idx) => {
        const cell = this.table.getCell(this.colFrom, idx)
        if (!currentCell.isSame(cell) && cell.getCell().hasData()) {
          return false
        }
        emptyColCells.push(cell)
      },
      rowFrom,
      rowTo
    )

    return emptyColCells
  }

  adjust(colIdx, rowIdx) {
    if (!this.positionOfAdjustment && !this.cell.hasData()) {
      if (colIdx === this.colFrom) {
        this.mergeRow(this.rowFrom, rowIdx)
      }
    } else if (this.positionOfAdjustment === 'down') {
      this.mergeRow(
        this.rowFrom,
        Math.max(
          this.rowFrom,
          rowIdx - this.rowIdxOfLastCell + this.rowFrom + this.rowSpan - 1
        )
      )
    } else if (this.positionOfAdjustment === 'up') {
      const mergedCell = this.mergeRow(rowIdx, this.rowFrom + this.rowSpan)
      this.setCell(mergedCell)
    }
  }

  /**
   *
   * @param {Cell} cell
   */
  setCell(cell) {
    this.cell = cell.getCell().select()
    this.rowIdxOfLastCell = this.cell.getRowIdxOfLastCell()
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
    this.positionOfAdjustment = positionOfAdjustment || null
    this.rowFrom = this.cell.rowIdx
    this.colFrom = this.cell.colIdx
    this.rowSpan = this.cell.getRowSpan()
    this.table.removeHighlights()
    this.inProgress = true
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
   * @param {array} cells
   */
  deselect(cells) {
    this.table.removeHighlights()
    this.cell.getCell().deselect()
  }

  highlight() {
    this.table.highlights.show(this.cell.getCell())
  }

  deleteCell() {
    this.deselect()
    this.getCell().clear()
  }
}
