import Cell from './cell'
import BaseRender from './_base'

/**
 * Cells rederer.
 * @class {Table}
 */
export default class Cells extends BaseRender {
  constructor() {
    super()

    /**
     * Array containing a list of cell.
     *
     * @private
     * @type {Array}
     */
    this._cells = []

    /**
     * Reference to the starting coords of cell.
     */
    this.startingCoords = {
      x: 0,
      y: 0,
    }
  }

  init() {
    const { numberOfCols, numberOfRows, timeScale } = this.table.settings
    const { cellWidth, cellHeight } = this.table
    for (let colIdx = 0; colIdx < numberOfCols; colIdx++) {
      this._cells[colIdx] = []

      for (let rowIdx = 0; rowIdx < numberOfRows / timeScale; rowIdx++) {
        const cell = new Cell({
          colIdx,
          rowIdx,
          parent: this,
          dashLine: true
        })
        cell.setRenderer(this.draw)
        cell.setTable(this.table)
        if (rowIdx === 0 && colIdx === 0) {
          cell.colSpan = 2
        }
        this._cells[colIdx].push(cell)
      }
    }
  }

  refresh() {
    this.cellGroupsEach((cell) => !cell.selected && cell.clear())
    this.render()
  }

  adjust() {
    const {
      colHeaderWidth,
      rowHeaderHeight,
      cellBorderWidth,
    } = this.table.settings
    const { cellWidth, cellHeight } = this.table
    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: rowHeaderHeight + cellBorderWidth,
    }
    this.cellWidth = cellWidth
    this.cellHeight = cellHeight
  }

  render() {
    if (!this._cells.length) this.init()
    this.adjust()

    const items = this.table.sort(this.table.items)
    let item = items.shift()
    let cellsToMerge
    this.cellsEach((cell) => {
      if (item && cell.colIdx === item.colIdx && cell.rowIdx === item.rowIdx) {
        cell.data = item.data
        cellsToMerge = this.table.getEmptyCellsBetween(
          cell,
          this.getCell(cell.colIdx, cell.rowIdx + item.rowSpan)
        )
        cell.merge(cellsToMerge)
        item = items.shift()
      } else {
        cell.render()
      }
    })
  }

  cellsEach(cb, { cellFrom, cellTo, rowSpan, reverse } = {}) {
    const { _cells } = this
    let colIdx = 0
    let rowIdx = 0

    if (cellFrom) {
      colIdx = cellFrom.colIdx
      rowIdx = cellFrom.rowIdx
    } else if (reverse) {
      const { settings } = this.table
      colIdx = settings.numberOfCols.length - 1
      rowIdx = settings.numberOfRows.length - 1
    }

    let colCells = _cells[colIdx]
    let curRowSpan = 0
    let stop = false

    while (!stop && colCells) {
      const cell = colCells[rowIdx]
      if (cell) {
        if (cb(cell, colIdx, rowIdx) === false) {
          stop = true
        }

        if (cellTo && cellTo.isSame(cell)) colCells = null

        reverse ? rowIdx-- : rowIdx++
      } else {
        rowIdx = 0
        colCells = _cells[reverse ? --colIdx : ++colIdx]
      }

      if (rowSpan && curRowSpan++ === rowSpan) colCells = null
    }
  }

  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  cellGroupsEach(cb, config) {
    return this.cellsEach((cell) => {
      cell.isVisible() && cb(cell)
      return true
    }, config)
  }

  getCells() {
    return this._cells
  }

  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {number} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  getCell(colIdx, rowIdx, crossCol = true) {
    try {
      if (crossCol) {
        const numberOfRows = this.table.settings.numberOfRows / this.table.settings.timeScale
        if (rowIdx > numberOfRows - 1 || rowIdx < 0) {
          const _numberOfRows = colIdx * numberOfRows + rowIdx
          colIdx = Math.floor(_numberOfRows / numberOfRows)
          rowIdx = _numberOfRows % numberOfRows
        }
      }

      return this.getCells()[colIdx][rowIdx] || null
    } catch (error) {
      return null
    }
  }
}
