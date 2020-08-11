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

  clearHighlight(highlight) {
    highlight.visible = false
    highlight.style.visibility = 'hidden'
    highlight.cell = null
  }

  /**
   * @returns {HTMLElement}
   */
  createNew() {
    const highlight = document.createElement('div')
    highlight.className = 'schedule-highlight'

    highlight.upResize = document.createElement('div')
    highlight.upResize.className = 'schedule-highlight-up-resize'

    highlight.downResize = document.createElement('div')
    highlight.downResize.className = 'schedule-highlight-down-resize'

    highlight.appendChild(highlight.upResize)
    highlight.appendChild(highlight.downResize)

    this.rootNode.appendChild(highlight)
    this._highlightList.push(highlight)

    return highlight
  }

  adjust(highlight) {
    const { cell } = highlight
    const coords = cell.getCoords()
    highlight.style.left = `${coords.x}px`
    highlight.style.top = `${coords.y}px`
    highlight.style.width = `${cell.width}px`
    highlight.style.height = `${cell.height}px`
  }

  /**
   * Show the cell highlight.
   * @param {Cell} cell
   */
  show(cell) {
    let highlight = this._highlightList.find((h) => !h.cell)
    if (!highlight) {
      highlight = this.createNew()
    }

    highlight.cell = cell

    this.adjust(highlight)
    highlight.visible = true
    highlight.style.visibility = 'visible'
  }

  clear() {
    this._highlightList.forEach((h) => this.clearHighlight(h))
  }
}
