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

    this.container.addEventListener('mousedown', this.onMouseDown)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('mousemove', this.onMouseMove)
    this.container.addEventListener('contextmenu', this.onContextMenu)
    document.addEventListener('keydown', this.onKeydown)

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
    const { x, y } = this.getCoords(event)
    const cell = this.table.getCellByCoord({ x, y })

    const { currentSelection } = this.table

    if (event.target.classList.contains(HIGHLIGHT_DOWN_RESIZE_CLASS)) {
      return currentSelection.begin(cell, 'down')
    }

    if (event.target.classList.contains(HIGHLIGHT_UP_RESIZE_CLASS)) {
      return currentSelection.begin(cell, 'up')
    }

    if (event.shiftKey) {
      const colIdx = this.table.getColIdx(x)
      const rowIdx = this.table.getRowIdx(y)
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
    const { x, y } = this.getCoords(event)
    const cell = this.table.getCellByCoord({ x, y })

    const { currentSelection } = this.table

    if (currentSelection && currentSelection.isInProgress()) {
      const colIdx = this.table.getColIdx(x)
      const rowIdx = this.table.getRowIdx(y)
      currentSelection.selectMultiCol(colIdx, rowIdx)
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

    if (this.table.currentSelection) {
      this.schedule.showContextMenu(event)
    }
  }

  onContextMenuItemSelect(action, item) {
    const { currentSelection } = this.table
    if (currentSelection && action) {
      if (action === 'delete') {
        currentSelection.deleteCell()
      }

      this.schedule.emit(events.CONTEXT_MENU_ITEM_SELECT, action, item)
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
