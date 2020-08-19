export const CONTEXTMENU_CLASS = 'schedule-contextmenu'
export const CONTEXTMENU_ITEM_CLASS = 'schedule-contextmenu-item'

export default class ContextMenu {
  constructor(container,items) {
    this.container = container
    this.onSelect = () => {}

    const ul = document.createElement('ul')
    ul.className = CONTEXTMENU_CLASS

    items.forEach((m) => {
      const li = document.createElement('li')
      li.className = CONTEXTMENU_ITEM_CLASS
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

    this.container.appendChild(this.menu)
  }

  onContextMenuItemSelect(onSelect) {
    this.onSelect = onSelect
  }

  isVisible() {
    return this.menu.style.visibility === 'visible'
  }

  show({x, y}) {
    this.menu.style.visibility = 'visible'
    this.menu.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  hide() {
    this.menu.style.visibility = 'hidden'
  }
}
