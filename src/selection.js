/**
 * Manage cell selection.
 * @class {Selction}
 */
export default class Section {
  constructor(table, oriCell) {
    this.table = table
    this.oriCell = oriCell
    this.oriRowIdx = oriCell

    this.oriCell.getCell().select()
    this.selectedCells = []
    this.selectedCells[this.oriCell.colIdx] = this.oriCell
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
    this.clear(cellsToClear)
  }

  mergeCols(rowIdx) {
    this.table.mergeCols(oriCell, rowIdx)
  }

  finish() {}

  clear(cells) {
    ;(cells || this.selectedCells).forEach((cell) => {
      cell.getCell().unselect()
      this.table.removeHighlights()
    })
  }

  highlight() {
    this.selectedCells.forEach((cell) => cell && this.table.highlightCell(cell.getCell()))
  }
}
