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

export function diffOwnProperties(a, b) {
  if (a === b) {
    return {
      changed: 'equal',
      value: a
    }
  }

  const diff = {}
  let equal = true
  let keys = Object.keys(a)

  for (let i = 0, length = keys.length; i < length; i++) {
    const key = keys[i]
    if (b.hasOwnProperty(key)) {
      if (a[key] === b[key]) {
        diff[key] = {
          changed: 'equal',
          value: a[key]
        }
      } else {
        const typeA = typeof a[key]
        const typeB = typeof b[key]
        if (
          a[key] &&
          b[key] &&
          (typeA == 'object' || typeA == 'function') &&
          (typeB == 'object' || typeB == 'function')
        ) {
          const valueDiff = diffOwnProperties(a[key], b[key])
          if (valueDiff.changed == 'equal') {
            diff[key] = {
              changed: 'equal',
              value: a[key]
            }
          } else {
            equal = false
            diff[key] = valueDiff
          }
        } else {
          equal = false
          diff[key] = {
            changed: 'primitive change',
            removed: a[key],
            added: b[key]
          }
        }
      }
    } else {
      equal = false
      diff[key] = {
        changed: 'removed',
        value: a[key]
      }
    }
  }

  keys = Object.keys(b)

  for (let i = 0, length = keys.length; i < length; i++) {
    let key = keys[i]
    if (!a.hasOwnProperty(key)) {
      equal = false
      diff[key] = {
        changed: 'added',
        value: b[key]
      }
    }
  }

  if (equal) {
    return {
      value: a,
      changed: 'equal'
    }
  } else {
    return {
      changed: 'object change',
      value: diff
    }
  }
};