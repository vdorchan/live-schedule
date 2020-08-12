export default class ContextMenu {
  constructor(items) {
    this.onSelect = () => {}

    const ul = document.createElement('ul')
    ul.className = 'schedule-contextmenu'

    items.forEach((m) => {
      const li = document.createElement('li')
      li.className = 'schedule-contextmenu-item'
      li.innerText = m.title
      li.dataset.action = m.action
      ul.appendChild(li)
    })

    this.menu = ul
    this.hide = this.hide.bind(this)
    this.hide()

    window.addEventListener('click', this.hide)

    ul.onclick = (event) => {
      this.hide()
      const action = event.target.dataset.action
      if (action) {
        this.onSelect(
          action,
          items.find((item) => item.action === action)
        )
      }
    }

    document.body.appendChild(this.menu)
  }

  onContextMenuItemSelect(onSelect) {
    this.onSelect = onSelect
  }

  isVisible() {
    return this.menu.style.visibility === 'visible'
  }

  show(event) {
    const { pageX: left, pageY: top } = event

    const contextmenuWidth = this.menu.clientWidth
    const contextmenuHeight = this.menu.clientHeight

    if (contextmenuHeight + top >= window.innerHeight) {
      top -= contextmenuHeight
    }
    if (contextmenuWidth + left >= window.innerWidth) {
      left -= contextmenuWidth
    }

    this.menu.style.visibility = 'visible'
    this.menu.style.left = `${left}px`
    this.menu.style.top = `${top}px`
  }

  hide() {
    this.menu.style.visibility = 'hidden'
  }
}
