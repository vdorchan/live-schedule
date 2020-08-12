import BaseRender from './_base'
import { objHasChanged } from './helper'

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
    const map = this.table.settings.dataMaps[key]
    key = this.table.settings[`${key}Key`]
    if (map) {
      const obj = map.find((o) => o.key === data[key])
      return obj ? obj.value : undefined
    }

    return data[key]
  }

  render() {
    const data = this.data
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

    let cellColor = this.selected || this.hovering ? cellSelectedColor : bgColor

    if (data) {
      cellColor = this.getDataValue('color') || cellActiveColor
    }

    this.width = cellWidth - cellBorderWidth
    this.height = cellHeight * this.mergedCells.length - cellBorderWidth

    this.draw.rect({
      ...this.getCoords(),
      width: this.width,
      height: this.height,
      fill: cellColor,
      borderColor: cellBorderColor,
      borderWidth: cellBorderWidth,
    })

    if (data) {
      this.renderIconAndTexts(
        this.getDataValue('icon'),
        this.getDataValue('texts')
      )
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

  setData(data) {
    if (this.selected && this.isVisible()) {
      if (!this.data) {
        this.data = {}
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
    !this.isValid() && this.renderIfPropsChanged({ hovering: true })
  }

  mouseOut() {
    !this.isValid() && this.renderIfPropsChanged({ hovering: false })
  }

  select() {
    this.renderIfPropsChanged({ selected: true })
  }

  deselect() {
    if (this.data) {
      this.renderIfPropsChanged({ selected: false })
    } else {
      this.mergedCells.forEach((cell) => cell.clear())
    }
  }

  renderIfPropsChanged(props, data = this) {
    if (this.__actualCell !== this) {
      return this.__actualCell.renderIfPropsChanged(props)
    }

    let hasChaned = false
    Object.keys(props).forEach((prop) => {
      if (props[prop] !== data[prop]) {
        data[prop] = props[prop]
        hasChaned = true
      }
    })
    if (hasChaned) {
      this.render()
    }

    return hasChaned
  }

  cloneFrom(cell) {
    this.selected = cell.selected
    return this
  }

  merge(cellsToMerge, renderImmediately = true) {
    const actualCell =
      cellsToMerge[0] === this ? this : cellsToMerge[0].cloneFrom(this)
    const oriMergedCells = this.__actualCell.mergedCells
    oriMergedCells
      .filter((cell) => !cellsToMerge.includes(cell))
      .forEach((cell) => cell.clear())

    cellsToMerge.map((cell) => {
      cell.__actualCell = actualCell
    })
    actualCell.mergedCells = cellsToMerge
    actualCell.render()

    return actualCell
  }

  clear() {
    this.mergedCells.forEach(cell => {
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
    return this.colIdx === cell.colIdx && this.rowIdx === cell.rowIdx
  }

  isVisible() {
    return this.__actualCell === this
  }

  isValid() {
    return !!this.data
  }
}
