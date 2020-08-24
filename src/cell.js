import BaseRender from './_base'
import { objHasChanged, getHexAlpha, hexHasAlpha } from './helper'
import eventMixin from './mixins/event'

/**
 * @class {Cell}
 */
export default class Cell extends BaseRender {
  constructor({ colIdx, rowIdx, label, parent, dashLine }) {
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

    this.dashLine = dashLine

    this.mergedCells = [this]

    this.setTable(parent.table)
    this.setRenderer(parent.draw)

    this.table = parent.table
    this.timeRange = null
    this.setTimeRange()
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
    } else if (this.getCell() !== this) {
      cellColor = null
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

  setTimeRange() {
    const { timeScale, yearMonth } = this.table.settings
    const timeFrom = yearMonth.add(
      this.rowIdx * 60 * timeScale + this.colIdx * 24 * 60,
      'minute'
    )
    const timeTo = timeFrom.add(this.getRowSpan() * 60 * timeScale, 'minute')
    this.timeRange = [timeFrom, timeTo]
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
    const { renderCell, dataMaps } = this.table.settings
    key = this.table.settings[`${key}Key`]
    if (typeof renderCell === 'function') {
      const obj = renderCell(data)
      return obj ? obj[key] : null
    }

    if (!data) {
      return null
    }

    let map
    if (dataMaps) {
      map = dataMaps[key]
    }
    if (map) {
      const obj = map.find((o) => o.key === data[key])
      return obj ? obj.value : null
    }

    return data[key]
  }

  getHighlightConfigs() {
    const { cellWidth } = this.parent
    const cellHeight = this.getColHeight(false)
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
    const { data, rowIdx } = this
    const { cellWidth } = this.parent
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
    this.height = this.getColHeight(true) - cellBorderWidth

    this.draw.rect({
      ...this.getCoords(),
      width: this.width,
      height: this.height,
      fill: cellColor,
      borderColor: cellBorderColor,
      borderWidth: cellBorderWidth,
      ...(this.dashLine && !this.hasData()
        ? {
            borderTop: rowIdx % (1 / 0.5) !== 0 ? 'dash' : true,
            borderBottom: rowIdx % (1 / 0.5) === 0 ? 'dash' : true,
          }
        : {}),
    })
  }

  render() {
    if (this.hidden) {
      return
    }

    const { bgColor } = this.table.settings

    const cellColor = this.getColor()

    if (!cellColor) {
      return
    }

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
      const { fontSize, fontColor, lineHeight, iconMaxWidth } = this.table.settings

      y = y - (((texts || []).length + (icon ? 1 : 0) - 1) / 2) * lineHeight

      if (icon && this.height > this.width) {
        const imgSize = Math.min(this.width - 5, iconMaxWidth)

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
        const maxFontLength = this.width / parseInt(fontSize) + 1
        const posList = texts.forEach((text) => {
          this.draw.text({
            text: String(text).slice(0, maxFontLength),
            x,
            y,
            fill: fontColor,
          })
          y += lineHeight
        })
      }
    }
  }

  setData(callback) {
    if (this.selected && this.isVisible()) {
      if (!this.data) {
        const { timeRangeKey } = this.table.settings
        this.data = {
          [timeRangeKey]: this.timeRange,
        }
      }

      let data = { ...this.data, ...(callback || {}) }

      if (typeof callback === 'function') {
        data = callback(cell.data || {})
      }

      const { colorKey, iconKey, textsKey } = this.table.settings
      const oriData = { ...this.data }
      this.data = data

      this.renderIfPropsChanged(
        {
          [colorKey]: this.getDataValue('color', data),
          [iconKey]: this.getDataValue('icon', data),
          [textsKey]: this.getDataValue('texts', data),
        },
        oriData
      )

      return true
    }
    return false
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
    const cellsToRender = []

    ;[...oriMergedCells, ...cellsToMerge]
      .filter(cell => cell !== actualCell)
      .forEach(cell => {
        if (!cellsToRender.find(c => c.isSamePosition(cell))) {
          cell.init()
          cell.unMerge()
          cellsToRender.push(cell)
        }

        if (cellsToMerge.includes(cell)) {
          cell.__actualCell = actualCell
        }
      })

    actualCell.mergedCells = [...cellsToMerge]
    actualCell.__actualCell = actualCell
    cellsToRender.push(actualCell)
    cellsToRender.forEach(cell => cell.render())

    actualCell.setTimeRange()

    return actualCell
  }

  unMerge() {
    this.mergedCells = [this]
    this.setTimeRange()
    return this
  }

  getColHeight(includesMerged) {
    const cellHeight = this.parent.cellHeight
    const _cell = this.isCrossCol() ? this.getCell() : this
    return includesMerged
      ? _cell.mergedCells.filter((cell) => cell.colIdx === this.colIdx).length *
          cellHeight
      : cellHeight
  }

  getRowSpan() {
    return this.mergedCells.length
  }

  getRowIdxOfLastCell() {
    const mergedCells = this.getMergedCells()
    return mergedCells[mergedCells.length - 1].rowIdx
  }

  clear() {
    const cellsToUnMerge = []
    this.mergedCells.forEach((cell) => {
      cell.init()
      cell.render()
    })

    this.mergedCells[0].unMerge()
  }

  delete() {
    this.deselect()
    this.clear()
  }

  isBefore(cell) {
    return this.colIdx === cell.colIdx
      ? this.rowIdx < cell.rowIdx
      : this.colIdx < cell.colIdx
  }

  isSame(cell) {
    return this.getCell() === cell.getCell()
  }

  isSamePosition(cell) {
    return this.colIdx === cell.colIdx && this.rowIdx === cell.rowIdx
  }

  isVisible() {
    return this.__actualCell === this
  }

  isSelected() {
    return this.getCell().selected
  }

  hasData(includesMerged) {
    return includesMerged ? !!this.getCell().data : !!this.data
  }
}

Object.assign(Cell.prototype, eventMixin)
