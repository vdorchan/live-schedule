export const HIGHLIGHT_CLASS = 'schedule-highlight'
export const HIGHLIGHT_UP_RESIZE_CLASS = 'schedule-highlight-up-resize'
export const HIGHLIGHT_DOWN_RESIZE_CLASS = 'schedule-highlight-down-resize'
export const HIGHLIGHT_DISABLED_UP_RESIZE = 'disabled-up-resize'
export const HIGHLIGHT_DISABLED_DOWN_RESIZE = 'disabled-down-resize'

/**
 * @class {Highlights}
 */
export default class Highlights {
  constructor(rootNode, onResize) {
    /**
     * @type {HTMLElement}
     */
    this.rootNode = rootNode

    /**
     * @type {Function}
     */
    this.onResize = onResize

    /**
     * Cache for highlight element.
     * @type {Array}
     */
    this._highlightList = []
  }

  clearHighlights(highlightGroup) {
    highlightGroup._members.forEach((highlight) => {
      highlight.style.visibility = 'hidden'
    })
    highlightGroup.cell = null
  }

  /**
   * @returns {HTMLElement}
   */
  createNew() {
    const highlightGroup = {
      _members: [],
      cell: null,
    }

    this._highlightList.push(highlightGroup)

    return highlightGroup
  }

  createHighlight(highlightGroup) {
    const highlight = document.createElement('div')
    highlight.className = HIGHLIGHT_CLASS

    highlight.upResize = document.createElement('div')
    highlight.upResize.className = HIGHLIGHT_UP_RESIZE_CLASS

    highlight.downResize = document.createElement('div')
    highlight.downResize.className = HIGHLIGHT_DOWN_RESIZE_CLASS

    highlight.appendChild(highlight.upResize)
    highlight.appendChild(highlight.downResize)
    this.rootNode.appendChild(highlight)
    highlightGroup._members.push(highlight)

    return highlight
  }

  getCoords(event) {
    const { left, top } = this.rootNode.getBoundingClientRect()
    return { x: event.clientX - left, y: event.clientY - top }
  }

  adjust(highlightGroup) {
    const { cell } = highlightGroup
    const configs = cell.getHighlightConfigs()
    const nuhmberOfHighlights = configs.length

    configs.forEach((config, idx) => {
      const { coords, width, height } = config
      const highlight =
        highlightGroup._members[idx] || this.createHighlight(highlightGroup)
      highlight.className = HIGHLIGHT_CLASS
      highlight.style.left = `${coords.x}px`
      highlight.style.top = `${coords.y}px`
      highlight.style.width = `${width}px`
      highlight.style.height = `${height}px`
      highlight.style.visibility = 'visible'
    })

    if (nuhmberOfHighlights > 1) {
      highlightGroup._members[0].classList.add(HIGHLIGHT_DISABLED_DOWN_RESIZE)
      highlightGroup._members[nuhmberOfHighlights - 1].classList.add(
        HIGHLIGHT_DISABLED_UP_RESIZE
      )
      highlightGroup._members
        .slice(1, nuhmberOfHighlights - 1)
        .forEach((h) =>
          h.classList.add(
            HIGHLIGHT_DISABLED_DOWN_RESIZE,
            HIGHLIGHT_DISABLED_UP_RESIZE
          )
        )
    }
  }

  /**
   * Show the cell highlight.
   * @param {Cell} cell
   */
  show(cell) {
    let highlightGroup = this._highlightList.find((h) => !h.cell)
    if (!highlightGroup) {
      highlightGroup = this.createNew()
    }

    highlightGroup.cell = cell

    this.adjust(highlightGroup)
  }

  clear() {
    this._highlightList.forEach((highlightGroup) =>
      this.clearHighlights(highlightGroup)
    )
  }
}
