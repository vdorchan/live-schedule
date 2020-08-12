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
      icon: null
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
    const { color, text, icon, x, y } = typeof callback === 'function' ? callback(this._config) : callback
    this.showIcon(icon)
    this.setBackgroundColor(color)
    this.setText(text)
    const distanceToCol = 3
    this.tooltip.style.left = `${x + distanceToCol}px`
    this.tooltip.style.top = `${y}px`
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
    this.text.innerText = this._config.text
  }

  hide() {
    this.tooltip.style.visibility = 'hidden'
  }
}
