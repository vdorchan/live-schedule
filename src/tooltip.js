import dayjs from 'dayjs'

export default class Tooltip {
  constructor(container, color) {
    this.color = color
    this.container = container
    this.tooltip = document.createElement('div')
    this.tooltip.className = 'schedule-tooltip'

    this.icon = document.createElement('img')
    this.icon.className = 'schedule-tooltip-icon'

    this.text = document.createElement('div')
    this.text.className = 'schedule-tooltip-text'

    this.tooltip.appendChild(this.text)
    this.tooltip.appendChild(this.icon)

    container.appendChild(this.tooltip)
  }

  show({ x, y, color, text, icon }) {
    const distanceToCol = 3
    this.tooltip.style.left = `${x + distanceToCol}px`
    this.tooltip.style.top = `${y}px`
    this.tooltip.style.visibility = 'visible'
    this.showIcon(icon)
    this.setBackgroundColor(color)
    this.text.innerText = text
  }

  setBackgroundColor(color) {
    this.tooltip.style.backgroundColor = color || this.color
  }

  showIcon(icon) {
    this.icon.style.display = icon ? 'block' : 'none'
    if (icon) {
      this.icon.src = icon
    }
  }
}
