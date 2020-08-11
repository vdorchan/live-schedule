export function objHasChanged(obj, props) {
  return obj !== props || Object.keys(props).some((prop) => props[prop] !== obj[prop])
}
