export function objHasChanged(obj, props) {
  return (
    obj !== props ||
    Object.keys(props).some((prop) => props[prop] !== obj[prop])
  )
}

export function numberEach(cb, from, to) {
  const iterate = from > to ? () => from-- : () => from++
  const isEnd = from > to ? () => from < to : () => from > to
  let isStop = false
  while (!isEnd() && !isStop) {
    isStop = cb(iterate(from)) === false
  }
}

export function hex2rgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getAlphaFromHex(hex) {
  return parseInt(hex.slice(7, 9), 16) / 255
}

export function getHexAlpha(alpha) {
  return Math.round(alpha * 255).toString(16)
}

export function hexHasAlpha(hex) {
  return hex.length > 7
}

export function arrayRemoveItem(array, callback) {
  const itemIndex = array.findIndex(callback)
  if (itemIndex > -1) {
    return array.splice(itemIndex, 1)[0]
  }
}

export function isSame(a, b) {
  const aType = typeof a
  const bType = typeof b
  if (aType !== bType) {
    return false
  }
  const type = aType
  if (
    ['string', 'number', 'undefined'].includes(type) ||
    a === null ||
    b === null
  ) {
    return a === b
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((item, idx) => isSame(item, b[idx]))
  }
  if (type === 'object') {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) => isSame(a[key], b[key]))
    )
  }
  return true
}

export function diff(a, b) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  const changedKeys = []

  new Set([...aKeys, ...bKeys]).forEach((key) => {
    if (
      !aKeys.includes(key) ||
      !bKeys.includes(key) ||
      !isSame(a[key], b[key])
    ) {
      changedKeys.push({ key, value: [ a[key], b[key] ] })
    }
  })
  return changedKeys
}

export function formatTimeRange(timeRange, formatStr) {
  return timeRange.map(t => t.format(formatStr))
}