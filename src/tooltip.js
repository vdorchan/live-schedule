import dayjs from 'dayjs'

export default class Tooltip {
  constructor(container, color) {
    this._color = color
    this.container = container
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'schedule-tooltip'

    this.icon = document.createElement('img')
    this.icon.className = 'schedule-tooltip-icon'

    this.text = document.createElement('div')
    this.text.className = 'schedule-tooltip-text'

    this.tooltip.appendChild(this.text)
    this.tooltip.appendChild(this.icon)

    this._config = {
      color,
      text: null,
      icon: null,
    }

    container.appendChild(this.tooltip)
  }

  /**
   *
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {string} config.color
   * @param {string} config.text
   */
  show(config) {
    this.tooltip.style.visibility = 'visible'
    this.refresh(config)
  }

  /**
   *
   * @param {object||Function} callback
   */
  refresh(callback) {
    let { color, text, icon, x, y, cellWidth } =
      typeof callback === 'function' ? callback(this._config) : callback
    
    this.showIcon(icon)
    this.setBackgroundColor(color)
    this.setText(text)

    const tooltipWidth = this.tooltip.getBoundingClientRect().width
    const edgePadding = 100
    const distanceToCol = 3
    if (x + this.container.getBoundingClientRect().x + tooltipWidth + edgePadding > window.innerWidth) {
      x -= tooltipWidth + cellWidth + distanceToCol
    }
    x = Math.floor(x)
    y = Math.floor(y)
    this.tooltip.style.transform = `translate3d(${x + distanceToCol}px, ${y}px, 0)`
  }

  setBackgroundColor(color) {
    this._config.color = color || this._color
    this.tooltip.style.backgroundColor = this._config.color
  }

  showIcon(icon) {
    this._config.icon = icon || null
    this.icon.style.display = this._config.icon ? 'block' : 'none'
    if (this._config.icon) {
      this.icon.src = this._config.icon
    }
  }

  setText(text) {
    this._config.text = text
    this.text.innerHTML = this._config.text
  }

  hide() {
    this.tooltip.style.visibility = 'hidden'
  }
}
