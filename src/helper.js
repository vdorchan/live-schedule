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
    array.splice(itemIndex, 1)
  }
}
