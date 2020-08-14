import Draw from './draw'
import ContextMenu from './contextMenu'

/**
 * Table render and managing.
 * @class {Table}
 */
export default class Table {
  constructor(
    schedule,
    items,
    { cells, rowHeader, colHeader, highlights, contextMenu, tooltip } = {}
  ) {
    this.schedule = schedule
    /**
     * The root node to which newly created table will be inserted
     * @type {HTMLElement}
     */

    this.canvas = schedule.canvas

    /**
     * Cache the settings.
     * @type {Cells}
     */
    this.settings = schedule.settings

    this.items = items

    /**
     * Reference to the instance of cells renderer.
     * @type {Cells}
     */
    this.cells = cells

    /**
     * Reference to the instance of row header renderer.
     * @type {RowHeader}
     */
    this.rowHeader = rowHeader

    /**
     * Reference to the instance of col header renderer.
     * @type {ColHeader}
     */
    this.colHeader = colHeader

    /**
     * Reference to the instance of highlights.
     * @type {Highlights}
     */
    this.highlights = highlights

    /**
     * Reference to the instance of highlights.
     * @type {ContextMenu}
     */
    this.contextMenu = contextMenu

    /**
     * Reference to the instance of tooltip.
     * @type {Tooltip}
     */
    this.tooltip = tooltip

    /**
     * Set table renderer.
     */
    this.cells.setTable(this)
    this.rowHeader.setTable(this)
    this.colHeader.setTable(this)

    this.container = null
  }

  setItems(items) {
    this.items = items
    this.cells.refresh()
  }

  /**
   * Render the Table.
   * @param {number} tableWidth Width of Table.
   * @param {number} tableHeight Height of Table.
   */
  render(tableWidth, tableHeight) {
    if (!this.draw) {
      this.draw = new Draw(this.canvas, tableWidth, tableHeight)
    } else {
      this.draw.resize(tableWidth, tableHeight)
    }

    const {
      fontSize,
      fontFamily,
      numberOfCols,
      numberOfRows,
      cellBorderWidth,
      colHeaderWidth,
    } = this.settings
    /**
     * Set global font config.
     */
    this.draw.ctx.font = `${fontSize}px ${fontFamily}`

    /**
     * Set instance of Draw.
     */
    this.cells.setRenderer(this.draw)
    this.rowHeader.setRenderer(this.draw)
    this.colHeader.setRenderer(this.draw)

    // calculate width of col.
    this.cellWidth = Math.floor(
      (tableWidth - cellBorderWidth - colHeaderWidth) / numberOfCols
    )

    // calculate height of row.
    const totalNumberOfRows = numberOfRows + (this.rowHeader ? 1 : 0)
    this.cellHeight = Math.floor(
      (tableHeight - cellBorderWidth) / totalNumberOfRows
    )

    // Set width of height of row header.
    this.settings.rowHeaderHeight = this.cellHeight

    this.cells.render()
    this.rowHeader.render()
    this.colHeader.render()
  }

  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  cellsEach(cb, config) {
    this.cells.cellsEach(cb, config)
  }

  /**
   *
   * @param {Function} cb
   * @param {Object} config
   */
  cellGroupsEach(cb, config) {
    return this.cells.cellGroupsEach(cb, config)
  }

  /**
   * Get cell specified by index of column and index of row.
   * @param {number} colIdx Index of col.
   * @param {*} rowIdx  Index of row.
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  getCell(colIdx, rowIdx, crossCol) {
    return this.cells.getCell(colIdx, rowIdx, crossCol)
  }

  /**
   * Return column index specified x coord.
   * @param {number} x
   */
  getColIdx(x) {
    return Math.floor((x - this.cells.startingCoords.x) / this.cellWidth)
  }

  /**
   * Return row index specified y coord.
   * @param {number} y
   */
  getRowIdx(y) {
    return Math.floor((y - this.cells.startingCoords.y) / this.cellHeight)
  }

  /**
   * Return cell specified y coords.
   * @param {number} coords
   * @param {boolean} crossCol Cross col when col index bigger than max col idx.
   */
  getCellByCoord({ x, y }, crossCol) {
    const colIdx = Math.floor(
      (x - this.cells.startingCoords.x) / this.cellWidth
    )
    const rowIdx = Math.floor(
      (y - this.cells.startingCoords.y) / this.cellHeight
    )
    return this.getCell(colIdx, rowIdx, crossCol)
  }

  /**
   *
   * @param {array} cells
   * @param {boolean} reverse
   */
  sort(cells, reverse) {
    const judge = (a, b) => (reverse ? a > b : a < b)
    return cells.sort((a, b) => {
      if (judge(a.colIdx, b.colIdx)) {
        return -1
      } else if (a.colIdx === b.colIdx) {
        return judge(a.rowIdx, b.rowIdx) ? -1 : 1
      }
    })
  }

  /**
   *
   * @param {Cell} cellFrom
   * @param {Cell} cellTo
   */
  getEmptyCellsBetween(cellFrom, cellTo) {
    const [_cellFrom, _cellTo] = this.sort([cellFrom, cellTo])

    const cellsBetween = []
    this.cellsEach(
      (cell) => {
        if (cell.hasData() && !cell.isSame(_cellFrom)) {
          return false
        }
        cellsBetween.push(cell)
      },
      { cellFrom: _cellFrom, cellTo: _cellTo }
    )

    return cellsBetween
  }

  /**
   * Select multiple cells.
   * @param {Cell} oriCell
   * @param {number} colTo
   * @param {number} rowIdx
   * @returns {Array} Selected Cells.
   */
  selectMultiCols(oriCell, colTo, rowIdx) {
    let colFrom = oriCell.colIdx
    const selectedCells = []
    let isEnd = () => colFrom <= colTo
    let iterate = () => colFrom++
    if (colFrom > colTo) {
      isEnd = () => colFrom >= colTo
      iterate = () => colFrom--
    }

    while (isEnd()) {
      const cellFrom = this.getCell(iterate(), oriCell.rowIdx)
      cellFrom.select()
      selectedCells.push(this.mergeCols(cellFrom, rowIdx))
    }

    return selectedCells
  }

  /**
   *
   * @param {Cell} cellFrom
   * @param {number} rowIdx
   * @returns Actual cell after merged.
   */
  mergeCols(cellFrom, rowIdx) {
    const cellTo = this.getCell(cellFrom.colIdx, rowIdx)
    const cellsToMerge = this.getEmptyCellsBetween(cellFrom, cellTo)
    return cellFrom.merge(cellsToMerge)
  }

  /**
   *
   * @param {object} coords
   */
  mouseInCell(coords) {
    if (!this.contextMenu.isVisible()) {
      this.cellsEach((cell) => cell.mouseOut())
      this.schedule.hideTooltip()
      let cell = this.getCellByCoord(coords, false)
      if (cell) {
        cell = cell.getCell()
        cell.mouseIn()
        this.schedule.showTooltip(cell)
      }
    }
  }

  /**
   * Highlight specified cell.
   * @param {Cell} cell
   */
  highlightCell(cell) {
    this.highlights.show(cell)
  }

  /**
   * Remove all highlight of cell.
   */
  removeHighlights() {
    this.highlights.clear()
  }
}
