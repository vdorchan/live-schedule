import BaseRender from './_base'
import { objHasChanged, getHexAlpha, hexHasAlpha } from './helper'
import eventMixin from './mixins/event'

/**
 * @class {Cell}
 */
export default class Cell extends BaseRender {
  constructor({ colIdx, rowIdx, label, parent }) {
    super()

    this.colIdx = colIdx
    this.rowIdx = rowIdx
    this.label = label
    this.parent = parent

    this.borderWidth = 1
    this.borderTop = 1
    this.borderRight = 1
    this.borderBottom = 1
    this.borderLeft = 1

    this.init()

    /**
     * Width of cell.
     * @type {number}
     */
    this.width = 0

    /**
     * Height of cell.
     * @type {number}
     */
    this.height = 0
  }

  init() {
    this.selected = false
    this.hovering = false
    this.mergedCells = [this]
    this.__actualCell = this
    this.data = null
  }

  getCell() {
    return this.__actualCell
  }

  getColor() {
    const {
      cellSelectedColor,
      bgColor,
      cellActiveColor,
      cellCrossColAlpha,
    } = this.table.settings

    let cellColor = this.selected || this.hovering ? cellSelectedColor : bgColor

    if (this.data) {
      cellColor = this.getDataValue('color') || cellActiveColor
    }

    if (this.isCrossCol()) {
      cellColor = this.getCell().getColor() + getHexAlpha(cellCrossColAlpha)
    }

    return cellColor
  }

  isCrossCol() {
    const _cell = this.getCell()
    return _cell !== this && this.rowIdx === 0 && this.colIdx !== _cell.colIdx
  }

  getIcon() {
    return this.getDataValue('icon')
  }

  getTexts() {
    return this.getDataValue('texts')
  }

  getCoords(isCenter) {
    const { cellWidth, cellHeight } = this.parent
    const x =
      this.colIdx * cellWidth +
      this.parent.startingCoords.x +
      (isCenter ? this.width / 2 : 0)
    const y =
      this.rowIdx * cellHeight +
      this.parent.startingCoords.y +
      (isCenter ? this.height / 2 : 0)
    return { x, y }
  }

  getDataValue(key, data = this.data) {
    if (!data) {
      return undefined
    }
    let map
    const { dataMaps } = this.table.settings
    if (dataMaps) {
      map = dataMaps[key]
    }

    key = this.table.settings[`${key}Key`]
    if (map) {
      const obj = map.find((o) => o.key === data[key])
      return obj ? obj.value : undefined
    }

    return data[key]
  }

  getHighlightConfigs() {
    const { cellWidth, cellHeight } = this.parent
    const { cellBorderWidth } = this.table.settings
    const mergedCells = this.getMergedCells()
    let colIdx = null
    let i = -1
    const cellsGroup = []
    mergedCells.forEach((cell) => {
      if (colIdx === null || cell.colIdx !== colIdx) {
        cellsGroup.push([])
        colIdx = cell.colIdx
        i++
      }
      cellsGroup[i].push(cell)
    })

    return cellsGroup.map((cells) => ({
      width: cellWidth - cellBorderWidth,
      height: cells.length * cellHeight - cellBorderWidth,
      coords: cells[0].getCoords(),
    }))
  }

  getMergedCells() {
    return this.mergedCells
  }

  renderRect(cellColor) {
    const { data } = this
    const { cellWidth, cellHeight } = this.parent
    const {
      cellBorderWidth,
      cellSelectedColor,
      cellActiveColor,
      cellBorderColor,
      bgColor,
      colorKey,
      iconKey,
      textsKey,
    } = this.table.settings

    this.width = cellWidth - cellBorderWidth
    this.height = this.getColHeight(cellHeight) - cellBorderWidth

    this.draw.rect({
      ...this.getCoords(),
      width: this.width,
      height: this.height,
      fill: cellColor,
      borderColor: cellBorderColor,
      borderWidth: cellBorderWidth,
    })
  }

  render() {
    const { bgColor } = this.table.settings

    const cellColor = this.getColor()

    // Fill background color if color has alpha.
    if (hexHasAlpha(cellColor)) {
      this.renderRect(bgColor)
    }

    this.renderRect(cellColor)

    if (this.data) {
      this.renderIconAndTexts(this.getIcon(), this.getTexts())
    }

    this.renderLabel(this.label)
  }

  renderLabel(label) {
    if (typeof label !== 'string') {
      return
    }
    const { x, y } = this.getCoords(true)
    this.draw.text({
      text: label,
      x,
      y,
      fill: this.table.settings.headerTextColor,
    })
  }

  renderIconAndTexts(icon, texts) {
    let { x, y } = this.getCoords(true)
    if (texts || icon) {
      const { fontSize, lineHeight } = this.table.settings

      y = y - (((texts || []).length + (icon ? 1 : 0) - 1) / 2) * lineHeight

      if (icon) {
        const imgSize = this.width - 5
        this.draw.image({
          src: icon,
          x: x - imgSize / 2,
          y: y - imgSize / 2,
          width: imgSize,
          height: imgSize,
        })
        y += lineHeight
      }

      if (texts) {
        const maxFontLength = this.width / parseInt(fontSize)
        const posList = texts.forEach((text) => {
          this.draw.text({
            text: text.slice(0, maxFontLength),
            x,
            y,
          })
          y += lineHeight
        })
      }
    }
  }

  setData(callback) {
    if (this.selected && this.isVisible()) {
      if (!this.data) {
        this.data = {}
      }

      let data = { ...this.data, ...(callback || {}) }

      if (typeof callback === 'function') {
        data = callback(cell.data || {})
      }

      const { colorKey, iconKey, textsKey } = this.table.settings

      this.renderIfPropsChanged(
        {
          [colorKey]: data[colorKey],
          [iconKey]: data[iconKey],
          [textsKey]: data[textsKey],
        },
        this.data
      )
      this.data = data
    }
  }

  mouseIn() {
    !this.hasData() && this.renderIfPropsChanged({ hovering: true })
    return this
  }

  mouseOut() {
    !this.hasData() && this.renderIfPropsChanged({ hovering: false })
    return this
  }

  select() {
    if (this.hasData()) {
      this.selected = true
    } else {
      this.renderIfPropsChanged({ selected: true })
    }
    return this
  }

  deselect() {
    if (this.hasData()) {
      this.selected = false
    } else {
      this.mergedCells.forEach((cell) => cell.clear())
    }
    return this
  }

  renderIfPropsChanged(props, data = this) {
    if (this.getCell() !== this && !this.isCrossCol()) {
      return this.getCell().renderIfPropsChanged(props)
    }

    let hasChaned = false
    Object.keys(props).forEach((prop) => {
      if (props[prop] !== data[prop]) {
        data[prop] = props[prop]
        hasChaned = true
      }
    })
    if (hasChaned) {
      this.renderMerged()
    }

    return hasChaned
  }

  renderMerged() {
    this.render()
    this.mergedCells.forEach((cell) => cell.isCrossCol() && cell.render())
  }

  cloneFrom(cell) {
    this.selected = cell.selected
    this.data = cell.data
    return this
  }

  merge(cellsToMerge) {
    const actualCell = cellsToMerge[0]
    if (actualCell !== this) {
      return
    }

    const oriMergedCells = this.__actualCell.mergedCells
    oriMergedCells
      .filter((cell) => !cellsToMerge.includes(cell))
      .forEach((cell) => {
        cell.init()
        cell.render()
      })

    actualCell.mergedCells = cellsToMerge
    cellsToMerge.map((cell) => {
      cell.__actualCell = actualCell

      // render if col is crowss col
      if (cell.isCrossCol()) {
        cell.render()
      }
    })

    // actualCell.mergeCrossCol()
    actualCell.render()

    return actualCell
  }

  getColHeight(cellHeight) {
    const _cell = this.isCrossCol() ? this.getCell() : this
    return (
      _cell.mergedCells.filter((cell) => cell.colIdx === this.colIdx).length *
      cellHeight
    )
  }

  getRowSpan() {
    return this.mergedCells.length
  }

  getRowIdxOfLastCell() {
    const mergedCells = this.getMergedCells()
    return mergedCells[mergedCells.length - 1].rowIdx
  }

  clear() {
    this.mergedCells.forEach((cell) => {
      cell.init()
      cell.render()
    })
  }

  isBefore(cell) {
    return this.colIdx === cell.colIdx
      ? this.rowIdx < cell.rowIdx
      : this.colIdx < cell.colIdx
  }

  isSame(cell) {
    return this.getCell() === cell.getCell()
  }

  isVisible() {
    return this.__actualCell === this
  }

  hasData() {
    return !!this.data
  }
}

Object.assign(Cell.prototype, eventMixin)
