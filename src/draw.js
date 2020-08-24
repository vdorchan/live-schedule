import { getAlphaFromHex } from './helper'

function dpr() {
  return window.devicePixelRatio || 1
}

function npx(px) {
  return parseInt(px * dpr(), 10)
}

export default class Draw {
  constructor(el, width, height) {
    this.el = el
    this.ctx = el.getContext('2d')
    this.resize(width, height)

    this.__cacheImgs = []
  }

  _getImage(src) {
    return new Promise((resolve) => {
      let img = this.__cacheImgs.find((i) => i.src === location.origin + src)
      if (img) {
        return resolve(img)
      }
      img = new Image()
      img.onload = () => {
        this.__cacheImgs.push(img)
        resolve(img)
      }
      img.src = src
    })
  }

  resize(width, height) {
    this.el.style.width = `${width}px`
    this.el.style.height = `${height}px`
    this.el.width = npx(width)
    this.el.height = npx(height)
    this.ctx.scale(dpr(), dpr())
  }

  rect(config = {}) {
    const { ctx } = this
    const {
      x,
      y,
      width,
      height,
      borderColor,
      borderWidth,
      borderTop,
      borderRight,
      borderBottom,
    } = config
    let { fill } = config
    ctx.save()
    const alpha = getAlphaFromHex(fill)
    if (alpha < 1) {
      ctx.globalAlpha = alpha
      fill = fill.slice(0, 7)
    }

    ctx.beginPath()
    ctx.fillStyle = fill
    ctx.rect(x, y, width, height)
    ctx.clip()
    ctx.fill()
    ctx.restore()

    if (borderColor) {
      this.border({
        ...config,
        x: config.x - borderWidth,
        y: config.y - borderWidth,
        borderWidth,
        borderColor,
        borderTop,
        borderRight,
        borderBottom,
      })
    }
  }

  text(config = {}) {
    const { x, y, maxWidth, fill, text, fontSize, fontFamily } = config
    this.ctx.save()
    if (fontSize) this.ctx.fontSize = fontSize
    if (fontFamily) this.ctx.fontFamily = fontFamily
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = fill
    this.ctx.fillText(text, x, y, maxWidth)
    this.ctx.restore()
  }

  async image(config = {}) {
    const { x, y, width, height, src } = config
    const img = await this._getImage(src)

    this.ctx.drawImage(img, Math.floor(x), Math.floor(y), width, height)
  }

  border(config = {}) {
    const { ctx } = this
    const {
      width,
      height,
      x,
      y,
      borderTop = true,
      borderRight = true,
      borderBottom = true,
      // borderLeft = true,
      fill,
      borderWidth,
      borderColor,
    } = config

    ctx.save()
    ctx.lineWidth = borderWidth

    const drawLine = (border, from, to) => {
      ctx.beginPath()
      ctx.strokeStyle = border ? borderColor : fill
      ctx.moveTo(...from)
      ctx.lineTo(...to)
      ctx.stroke()
      if (border === 'dash') {
        ctx.setLineDash([5, 6])
        drawLine(false, from, to)
        ctx.setLineDash([])
      }
    }

    const right = x + borderWidth * 2 + width
    const bottom = y + borderWidth * 2 + height

    const halfBorderWidth = borderWidth / 2

    drawLine(borderTop, [x, y + halfBorderWidth], [right, y + halfBorderWidth])
    drawLine(
      borderRight,
      [right - halfBorderWidth, y],
      [right - halfBorderWidth, bottom]
    )
    drawLine(
      borderBottom,
      [right, bottom - halfBorderWidth],
      [x, bottom - halfBorderWidth]
    )
    drawLine(
      borderRight,
      [x + halfBorderWidth, bottom],
      [x + halfBorderWidth, y]
    )

    ctx.restore()
  }
}
