export const events = {
  CONTEXT_MENU_ITEM_SELECT: 'contextMenuItemSelect',
  CELL_SELECT: 'cellSelect',
  DATA_CHANGE: 'dataChange',
}

const eventMixin = {
  /**
   * Subscribe to event, usage:
   *  schdule.on('select', (item) => { ... }
   */
  on(eventName, handler) {
    if (!this._eventHandlers) this._eventHandlers = {}
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = []
    }
    this._eventHandlers[eventName].push(handler)
  },

  /**
   * Cancel the subscription, usage:
   *  schdule.off('select', handler)
   */
  off(eventName, handler) {
    const handlers = this._eventHandlers[eventName]
    if (!handlers) return
    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i] === handler) {
        handlers.splice(i--, 1)
      }
    }
  },

  /**
   * Generate an event with the given name and data
   *  this.emit('select', ...)
   */
  emit(eventName, ...args) {
    if (!this._eventHandlers && !this._eventHandlers[eventName]) {
      return // no handlers for that event name
    }

    // call the handlers
    this._eventHandlers[eventName].forEach((handler) =>
      handler.apply(this, args)
    )
  },
}

export default eventMixin
