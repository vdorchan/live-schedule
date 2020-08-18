import { ResizeObserver } from '@juggle/resize-observer'
import Selection from './selection'
import {
  HIGHLIGHT_UP_RESIZE_CLASS,
  HIGHLIGHT_DOWN_RESIZE_CLASS,
} from './highlights'
import { events } from './mixins/event'
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

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.onContextMenuItemSelect = this.onContextMenuItemSelect.bind(this)
    this.onKeydown = this.onKeydown.bind(this)

    const readOnly = this.table.settings

    if (!readOnly) {
      this.container.addEventListener('mousedown', this.onMouseDown)
      window.addEventListener('mouseup', this.onMouseUp)
      this.container.addEventListener('contextmenu', this.onContextMenu)
      document.addEventListener('keydown', this.onKeydown)
    }
    window.addEventListener('mousemove', this.onMouseMove)

    this.table.contextMenu.onContextMenuItemSelect(this.onContextMenuItemSelect)
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
    const coord = this.getCoords(event)
    const cell = this.table.getCellByCoord(coord)

    const { currentSelection } = this.table

    if (event.target.classList.contains(HIGHLIGHT_DOWN_RESIZE_CLASS)) {
      return currentSelection.begin(cell, 'down')
    }

    if (event.target.classList.contains(HIGHLIGHT_UP_RESIZE_CLASS)) {
      return currentSelection.begin(cell, 'up')
    }

    if (event.shiftKey) {
      const colIdx = this.table.getColIdx(coord.x)
      const rowIdx = this.table.getRowIdx(coord.y)
      return currentSelection.move(colIdx, rowIdx)
    }

    if (!event.ctrlKey && !event.metaKey) {
      this.table.clearSelection()
    }

    if (cell) {
      const _currentSelection = new Selection(this.schedule, cell)
      _currentSelection.begin(cell)
      this.table.setSelection(_currentSelection)
      this.table.addSelection(_currentSelection)
    }
  }

  /**
   *
   */
  onMouseUp() {
    const { currentSelection } = this.table
    if (currentSelection) {
      this.table.highlightSelections()
      currentSelection.finish()
    }
  }

  /**
   *
   */
  onMouseMove(event) {
    const coord = this.getCoords(event)
    const cell = this.table.getCellByCoord(coord)

    const { currentSelection } = this.table

    if (currentSelection && currentSelection.isInProgress()) {
      const colIdx = this.table.getColIdx(coord.x)
      const rowIdx = this.table.getRowIdx(coord.y)
      currentSelection.selectMultiCol(colIdx, rowIdx)
    } else {
      this.table.mouseInCell(coord)
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

    if (this.table.currentSelection) {
      this.schedule.showContextMenu(event)
    }
  }

  onContextMenuItemSelect(action, item) {
    const { currentSelection } = this.table
    if (currentSelection && action) {
      const hasBindEvent = this.schedule.emit(
        events.CONTEXT_MENU_ITEM_SELECT,
        action,
        this.schedule,
        currentSelection.getCell().data,
        item
      )

      if (!hasBindEvent && action === 'delete') {
        currentSelection.deleteCell()
      }
    }
  }

  onKeydown(event) {
    if (keycode(event) === 'backspace') {
      this.table.currentSelection.deleteCell()
    }
  }

  /**
   *
   */
  clear() {
    this.container.removeEventListener('mousedown', this.onMouseDown)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('mousemove', this.onMouseMove)
    this.container.removeEventListener('contextmenu', this.onContextMenu)
    document.removeEventListener('keydown', this.onKeydown)
  }

  getCoords(event) {
    const { left, top } = this.canvas.getBoundingClientRect()
    return { x: event.clientX - left, y: event.clientY - top }
  }
}
