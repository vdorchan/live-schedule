import BaseRender from './_base'
import Cell from './cell'

/**
 * Table render and managing.
 * @class {rederer}
 */
export default class ColHeader extends BaseRender {
  constructor() {
    super()

    this._cells = []

    /**
     * Reference to the starting coords of cell.
     */
    this.startingCoords = {
      x: 0,
      y: 0,
    }
  }

  init() {
    for (
      let rowIdx = 0;
      rowIdx < this.table.settings.numberOfRows + 1;
      rowIdx++
    ) {
      this._cells[rowIdx] = []
      const cell = new Cell({
        colIdx: 0,
        rowIdx,
        label: rowIdx === 0 ? '' : `${rowIdx - 1}-${rowIdx}`,
        parent: this,
      })
      cell.setRenderer(this.draw)
      cell.setTable(this.table)
      this._cells[rowIdx] = cell
    }
  }

  renderCornerLeft() {
    this.draw.text({
      text: '时',
      x: this.cellWidth * 0.3,
      y: this.cellHeight * 0.75,
    })
    this.draw.text({
      text: '日',
      x: this.cellWidth * 0.75,
      y: this.cellHeight * 0.4,
    })
    const { cellBorderColor, cellBorderWidth } = this.table.settings
    this.draw.ctx.save()
    this.draw.ctx.strokeStyle = cellBorderColor
    this.draw.ctx.lineWidth = cellBorderWidth
    this.draw.ctx.beginPath()
    this.draw.ctx.moveTo(0, 0)
    this.draw.ctx.lineTo(this.cellWidth, this.cellHeight)
    this.draw.ctx.stroke()
    this.draw.ctx.restore()
  }

  adjust() {
    const { cellHeight, settings } = this.table
    const { cellBorderWidth, colHeaderWidth } = settings
    this.startingCoords = {
      x: cellBorderWidth,
      y: cellBorderWidth,
    }
    this.cellWidth = colHeaderWidth
    this.cellHeight = cellHeight
  }

  render() {
    if (!this._cells.length) this.init()
    this.adjust()
    this._cells.forEach((cell) => cell.render())
    this.renderCornerLeft()
  }
}
