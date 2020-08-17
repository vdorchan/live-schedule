import { ResizeObserver } from '@juggle/resize-observer'
import dayjs from 'dayjs'
import Table from './table'
import Cells from './cells'
import RowHeader from './rowHeader'
import ColHeader from './colHeader'

import Highlights from './highlights'
import ContextMenu from './contextMenu'
import Tooltip from './tooltip'
import eventMixin from './mixins/event'

import Events from './events'

import settingsFactory from './defaultSettings'

import './styles/_base.css'
import './styles/highlight.css'
import './styles/contextMenu.css'
import './styles/tooltip.css'

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

    this.defaultSettings = settingsFactory()

    this.settings = { ...this.defaultSettings, ...this.userSettings }

    this.settings.contextMenuItems = this.combineContextMenuItems(
      userSettings.contextMenuItems || [],
      [{ action: 'delete', title: '删除' }]
    )

    this.yearMonth = dayjs(userSettings.yearMonth || dayjs().format('YYYY-MM'))
    this.settings.numberOfCols = this.yearMonth.daysInMonth()

    const items = this.getItemsFromData(this.settings.data)

    // Create table renderer for the schedule.
    this.table = new Table(this, items, {
      cells: new Cells(this),
      rowHeader: new RowHeader(this),
      colHeader: new ColHeader(this),
      highlights: new Highlights(this.container),
      contextMenu: new ContextMenu(this.settings.contextMenuItems),
      tooltip: new Tooltip(this.container, this.settings.tooltipColor),
    })

    this.events = new Events(this)

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

  combineContextMenuItems(...contextMenuItems) {
    const actions = []
    const _contextMenuItems = []
    contextMenuItems
      .reduce(
        (previousValue, currentValue, _) => [...previousValue, ...currentValue],
        []
      )
      .forEach(
        (item) =>
          !_contextMenuItems.find((i) => i.action === item.action) &&
          _contextMenuItems.push(item)
      )

    return _contextMenuItems
  }

  setData(data) {
    const items = this.getItemsFromData(data)
    this.table.setItems(items)
  }

  setDataAtSelectedCell(callback) {
    this.table.cellsEach((cell) => {
      cell.setData(callback)
    })
  }

  getItemsFromData(data) {
    return data.map((live) => {
      const { startTime, endTime } = live
      const time = dayjs(startTime)
      const colIdx = time.date() - 1
      const rowIdx =
        (time.hour() * 60 + time.minute()) / 60 / this.settings.timeScale
      const minutes = Math.abs(time.diff(endTime, 'minute'))
      const rowSpan = minutes / (this.settings.timeScale * 60) - 1
      return {
        colIdx,
        rowIdx,
        rowSpan,
        data: live,
      }
    })
  }

  exportData() { }

  showContextMenu(event) {
    this.table.tooltip.hide()
    this.table.contextMenu.show(event)
  }

  getCellTimeStr(cell) {
    const { timeScale } = this.settings
    const format = (date) => date.format('HH:mm')
    const timeFrom = this.yearMonth.add(cell.rowIdx * 60 * timeScale, 'minute')
    const timeTo = timeFrom.add(cell.getRowSpan() * 60 * timeScale, 'minute')

    return `${cell.colIdx + 1}, ${format(timeFrom)}~${format(timeTo)}`
  }

  /**
   *
   * @param {*} cell
   */
  getTooltipConfig(cell) {
    const { x, y } = cell.getCoords()

    const { renderTooltip } = this.settings
    const tooltipText = cell.data && renderTooltip ? renderTooltip(cell.data) : ''

    return {
      x: x + cell.width,
      y,
      text: `<p>${this.getCellTimeStr(cell)}</p>${tooltipText}`,
      color: cell.hasData() ? cell.getColor() : null,
      icon: cell.getIcon(),
    }
  }

  hideTooltip() {
    this.table.tooltip.hide()
  }

  /**
   *
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.text
   * @param {string} config.icon
   */
  showTooltip(cell) {
    if (!cell) {
      return
    }
    const config = this.getTooltipConfig(cell)
    this.table.tooltip.show(config)
  }
}

Object.assign(Schedule.prototype, eventMixin)
Schedule.settingsFactory = settingsFactory