/**
 * Manage cell selection.
 * @class {Selction}
 */
export default class Section {
  constructor(schedule, oriCell) {
    this.schedule = schedule
    this.table = schedule.table
    this.oriCell = oriCell
    this.oriRowIdx = oriCell

    this.oriCell.getCell().select()
    this.selectedCells = []
    this.selectedCells[this.oriCell.colIdx] = this.oriCell
    this.inProgress = true
  }

  getSelectedCell() {
    return this.selectedCells[this.oriCell.colIdx].getCell()
  }

  multiCols(colTo, rowIdx) {
    const selectedCells = this.table.selectMultiCols(
      this.oriCell,
      colTo,
      rowIdx
    )
    const selectedColIdxs = selectedCells.map((cell) => cell.colIdx)

    const cellsToClear = this.selectedCells.filter(
      (cell, idx) => !selectedColIdxs.includes(idx)
    )
    this.selectedCells = []
    selectedCells.forEach((cell) => (this.selectedCells[cell.colIdx] = cell))
    this.deselect(cellsToClear)

    this.schedule.showTooltip(this.selectedCells[colTo])
  }

  /**
   * Indicate that selection procell began.
   */
  begin() {
    this.inProgress = true
  }

  /**
   * Indicate that selection procell finished.
   */
  finish() {
    this.inProgress = false
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
    ;(cells || this.selectedCells).forEach((cell) => {
      cell.getCell().deselect()
      this.table.removeHighlights()
    })
  }

  highlight() {
    this.selectedCells.forEach(
      (cell) => cell && this.table.highlightCell(cell.getCell())
    )
  }

  deleteCell() {
    this.deselect()
    this.getSelectedCell().clear()
  }
}
