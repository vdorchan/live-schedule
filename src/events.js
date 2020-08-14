import { ResizeObserver } from '@juggle/resize-observer'
import Selection from './selection'
import {
  HIGHLIGHT_UP_RESIZE_CLASS,
  HIGHLIGHT_DOWN_RESIZE_CLASS,
} from './highlights'
import keycode from 'keycode'

/**
 * @class {Event}
 */
export default class Events {
  constructor(schedule) {
    this.schedule = schedule
    this.table = schedule.table
    this.canvas = this.table.canvas
    this.container = schedule.container

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
    this.onKeydown = this.onKeydown.bind(this)

    this.container.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('mousemove', this.onMouseMove)
    this.container.addEventListener('contextmenu', this.onContextMenu)
    document.addEventListener('keydown', this.onKeydown)

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

    if (event.target.classList.contains(HIGHLIGHT_DOWN_RESIZE_CLASS)) {
      return this.currentSelection.begin(cell, 'down')
    }

    if (event.target.classList.contains(HIGHLIGHT_UP_RESIZE_CLASS)) {
      return this.currentSelection.begin(cell, 'up')
    }

    if (event.shiftKey) {
      const colIdx = this.table.getColIdx(x)
      const rowIdx = this.table.getRowIdx(y)
      return this.currentSelection.move(colIdx, rowIdx)
    }

    if (!event.ctrlKey && !event.metaKey) {
      this.selections.forEach((selection) => selection.deselect())
      this.selections = []
    }

    if (cell) {
      this.currentSelection = new Selection(this.schedule, cell)
      this.currentSelection.begin(cell)
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

    if (this.currentSelection && this.currentSelection.isInProgress()) {
      const colIdx = this.table.getColIdx(x)
      const rowIdx = this.table.getRowIdx(y)
      this.currentSelection.selectMultiCol(colIdx, rowIdx)
    } else {
      this.table.mouseInCell({ x, y })
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
      if (action === 'delete') {
        this.currentSelection.deleteCell()
      }

      this.schedule.emit('contextMenuItemSelect', action, item)
    }
  }

  onKeydown(event) {
    if (keycode(event) === 'backspace') {
      this.currentSelection.deleteCell()
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
