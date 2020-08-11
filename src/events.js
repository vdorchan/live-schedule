import { ResizeObserver } from '@juggle/resize-observer'
import Selection from './selection'

/**
 * @class {Event}
 */
export default class Events {
  constructor(table) {
    this.table = table
    this.canvas = table.canvas

    this._movingCell = null
    this._movingRowIdx = null

    /**
     * Cache cells to highlight.
     * @type {Array}
     */
    this._highlightCells = []

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    window.addEventListener('mouseup', this.onMouseUp.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('contextmenu', this.onContextMenu)
    // this.addResizeListener(this.table.rootNode, this.onResize)

    this.currentSelection = null
    this.selections = []
  }

  /**
   * @private
   */
  clearEvents() {}

  addResizeListener(el, cb) {
    const ro = new ResizeObserver((entries, _) => {
      const { width, height } = entries[0].contentRect

      cb(width, height)
    })

    ro.observe(el)
  }

  /**
   * @private
   */
  addEventListener() {}

  /**
   *
   */
  onMouseDown(event) {
    const { x, y } = this.getCoords(event)
    const cell = this.table.getCellByCoord({ x, y })
    this.selections.forEach((selection) => selection.clear())
    this.selections = []
    if (cell) {
      this.currentSelection = new Selection(this.table, cell)
      this.selections.push(this.currentSelection)
    }
  }

  /**
   *
   */
  onMouseUp() {
    if (this.currentSelection) {
      this.selections.forEach((selection) => selection.highlight())
      this.currentSelection = null
    }
  }

  /**
   *
   */
  onMouseMove(event) {
    const { x, y } = this.getCoords(event)
    const cell = this.table.getCellByCoord({ x, y })
    if (!cell || this._movingCell === cell) return

    this._movingCell = cell

    if (this.currentSelection) {
      const colIdx = this.table.getColIdx(x)
      const rowIdx = this.table.getRowIdx(y)
      this.currentSelection.multiCols(colIdx, rowIdx)
    } else {
      this.table.mouseInCell(cell)
    }
  }

  /**
   *
   */
  onResize() {}

  /**
   *
   */
  onContextMenu() {}

  /**
   *
   */
  destroy() {}

  getCoords(event) {
    const { left, top } = this.canvas.getBoundingClientRect()
    return { x: event.clientX - left, y: event.clientY - top }
  }
}
