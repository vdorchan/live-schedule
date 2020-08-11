import { ResizeObserver } from '@juggle/resize-observer'
import moment from 'moment'
import Table from './table'
import Cells from './cells'
import RowHeader from './rowHeader'
import ColHeader from './colHeader'

import Highlights from './highlights'

import './styles/_base.css'
import './styles/highlight.css'

/**
 * Schedule.
 *
 * @class Schedule.
 */
export default class Schedule {
  /**
   *
   * @param {HTMLElement} rootNode The elment which the Schedule instance is injected.
   * @param {object} userSettings The user defined options.
   */
  constructor(rootNode, userSettings) {
    /**
     * The root node to which newly created table will be inserted.
     * @type {HTMLElement}
     */
    this.rootNode = rootNode

    /**
     * Cache the canvas element.
     * @type {HTMLElement}
     */
    this.canvas = null

    /**
     * The container which newly created element.
     * @type {HTMLElement}
     */
    this.container = null

    this.userSettings = userSettings

    this.createCanvas()

    this.settings = {
      numberOfCols: 31,
      numberOfRows: 24,

      /**
       * Table background color.
       * @type {String}
       */
      bgColor: '#fff',

      /**
       * Some table cell config.
       */
      cellBorderColor: '#EBEEF5',
      cellBorderWidth: 1,
      cellSelectedColor: '#EBEEF5',
      cellActiveColor: '#D9D6EE',

      /**
       * Width of the col header
       * @type {number}
       */
      colHeaderWidth: 50,

      /**
       * Height of the col header
       * @type {number}
       */
      rowHeaderHeight: 0,

      /**
       * Some font config.
       */
      fontSize: 12,
      fontFamily:
        'PingFang SC,Helvetica Neue,Helvetica,microsoft yahei,arial,STHeiTi,sans-serif',
      lineHeight: 20,
      cellTextColor: '#fff',
      headerTextColor: '#606266',

      colorKey: 'color',
      iconKey: 'icon',
      textsKey: 'texts',

      dataMaps: {},

      timeScale: 1,

      ...userSettings,
    }

    const items = this.getItemsFromData()

    // Create table renderer for the schedule.
    this.table = new Table(this.canvas, this.settings, items, {
      cells: new Cells(this),
      rowHeader: new RowHeader(this),
      colHeader: new ColHeader(this),
      highlights: new Highlights(this.container),
    })

    this.render()
  }

  /**
   * Create the canvas element and insert to the root node.
   */
  createCanvas() {
    this.canvas = document.createElement('canvas')

    this.container = document.createElement('div')
    this.container.className = 'schedule-canvas-container'
    this.container.appendChild(this.canvas)
    this.rootNode.appendChild(this.container)
  }

  render() {
    const ro = new ResizeObserver((entries, _) => {
      const { width, height } = entries[0].contentRect
      this.table.render(width, height)
    })

    ro.observe(this.rootNode)
  }

  setDataAtCell(callback) {
    let data = callback
    this.table.cellsEach((cell) => {
      if (typeof callback === 'function') {
        data = callback(cell.data || {})
      }
      cell.setData(data)
    })
  }

  getItemsFromData() {
    return this.settings.data.map((live) => {
      const { startTime, endTime } = live
      const m = moment(startTime)
      const colIdx = m.date() - 1
      const rowIdx = (m.hours() * 60 + m.minutes()) / 60 / this.settings.timeScale
      const minutes = Math.abs(m.diff(endTime, 'minutes'))
      const rowSpan = minutes / (this.settings.timeScale * 60) - 1
      return {
        colIdx,
        rowIdx,
        rowSpan,
        data: live,
      }
    })
  }

  exportData() {}
}
