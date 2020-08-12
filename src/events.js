import { ResizeObserver } from '@juggle/resize-observer'
import Selection from './selection'

/**
 * @class {Event}
 */
export default class Events {
  constructor(schedule) {
    this.schedule = schedule
    this.table = schedule.table
    this.canvas = this.table.canvas

    this._movingCell = null
    this._movingRowIdx = null

    /**
     * Cache cells to highlight.
     * @type {Array}
     */
    this._highlightCells = []

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.onContextMenuItemSelect = this.onContextMenuItemSelect.bind(this)

    this.canvas.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('mousemove', this.onMouseMove)
    this.canvas.addEventListener('contextmenu', this.onContextMenu)

    this.table.contextMenu.onContextMenuItemSelect(this.onContextMenuItemSelect)

    this.currentSelection = null
    this.selections = []
  }

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
    this.selections.forEach((selection) => selection.deselect())
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
      this.currentSelection.finish()
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

    if (this.currentSelection && this.currentSelection.isInProgress()) {
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
  onContextMenu(event) {
    event.preventDefault()
    if (this.currentSelection) {
      this.schedule.showContextMenu(event)
    }
  }

  onContextMenuItemSelect(action, item) {
    if (this.currentSelection && action) {
      const cell = this.currentSelection.getSelectedCell()

      if (action === 'delete') {
        this.currentSelection.deleteCell()
      }

      this.schedule.emit('contextMenuItemSelect', action, item)
    }
  }

  /**
   *
   */
  destroy() {
    this.canvas.removeListener('mousedown', this.onMouseDown)
    window.removeListener('mouseup', this.onMouseUp)
    window.removeListener('mousemove', this.onMouseMove)
    this.canvas.removeListener('contextmenu', this.onContextMenu)
  }

  getCoords(event) {
    const { left, top } = this.canvas.getBoundingClientRect()
    return { x: event.clientX - left, y: event.clientY - top }
  }
}
