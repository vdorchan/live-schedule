import BaseRender from './_base'
import Cell from './cell'

/**
 * Table render and managing.
 * @class {RowHeader}
 */
export default class RowHeader extends BaseRender {
  constructor() {
    super()

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
    for (let colIdx = 0; colIdx < this.table.settings.numberOfCols; colIdx++) {
      this._cells[colIdx] = []
      const cell = new Cell({
        type: 'rowHeader',
        colIdx,
        rowIdx: 0,
        label: String(colIdx + 1),
        parent: this,
      })
      cell.setRenderer(this.draw)
      cell.setTable(this.table)
      this._cells[colIdx] = cell
    }
  }

  adjust() {
    const { cellWidth, cellHeight } = this.table
    const { colHeaderWidth, cellBorderWidth, rowHeaderHeight } = this.table.settings
    this.cellWidth = cellWidth
    this.cellHeight = rowHeaderHeight

    this.startingCoords = {
      x: colHeaderWidth + cellBorderWidth,
      y: cellBorderWidth,
    }
  }

  render() {
    if (!this._cells.length) this.init()
    this.adjust()
    this._cells.forEach((cell) => cell.renderHeader())
  }
}
