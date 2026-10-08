import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { innerBound, outerBound, shapeName } from '../geometry.js'

// The picture: a circle trapped between an inscribed polygon (blue) and a circumscribed one (red),
// each a fan of identical triangles meeting at the centre, as Archimedes divided them. Drawn on a
// canvas at the screen's pixel density, square, as large as its space allows. A text description of
// what's drawn goes with it, since a canvas is only pixels to a screen reader.
const COLORS = {
  glow: 'rgba(201,168,76,0.04)',
  outerFill: ['rgba(196,74,58,0.08)', 'rgba(196,74,58,0.04)'],
  innerFill: ['rgba(74,144,196,0.12)', 'rgba(74,144,196,0.06)'],
  radial: 'rgba(201,168,76,0.12)',
  outer: '#c44a3a',
  circle: '#c9a84c',
  inner: '#4a90c4',
  centre: 'rgba(201,168,76,0.5)',
  radius: 'rgba(201,168,76,0.25)',
  label: 'rgba(201,168,76,0.55)',
}

function draw(ctx, size, n) {
  const c = size / 2
  const R = size * 0.385
  ctx.clearRect(0, 0, size, size)

  const glow = ctx.createRadialGradient(c, c, 0, c, c, R * 1.4)
  glow.addColorStop(0, COLORS.glow)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  const outerR = R / Math.cos(Math.PI / n)
  const offset = -Math.PI / n   // so an even polygon sits on a flat edge
  const at = (r, i) => {
    const a = (2 * Math.PI * i) / n + offset
    return [c + r * Math.cos(a), c + r * Math.sin(a)]
  }
  const fan = (r, fills) => {
    for (let i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.moveTo(c, c)
      ctx.lineTo(...at(r, i))
      ctx.lineTo(...at(r, i + 1))
      ctx.closePath()
      ctx.fillStyle = fills[i % 2]
      ctx.fill()
    }
  }
  const outline = (r, color, alpha) => {
    ctx.beginPath()
    for (let i = 0; i < n; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, ...at(r, i))
    ctx.closePath()
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  fan(outerR, COLORS.outerFill)
  fan(R, COLORS.innerFill)
  for (let i = 0; i < n; i++) {   // the triangles' edges, out to the outer polygon
    ctx.beginPath()
    ctx.moveTo(c, c)
    ctx.lineTo(...at(outerR, i))
    ctx.strokeStyle = COLORS.radial
    ctx.lineWidth = 0.75
    ctx.stroke()
  }
  outline(outerR, COLORS.outer, 0.8)
  ctx.beginPath()
  ctx.arc(c, c, R, 0, 2 * Math.PI)
  ctx.strokeStyle = COLORS.circle
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.globalAlpha = 1
  outline(R, COLORS.inner, 0.9)

  ctx.beginPath()
  ctx.arc(c, c, 3, 0, 2 * Math.PI)
  ctx.fillStyle = COLORS.centre
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(c, c)
  ctx.lineTo(c + R, c)
  ctx.strokeStyle = COLORS.radius
  ctx.lineWidth = 1
  ctx.setLineDash([3, 5])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = COLORS.label
  ctx.font = `italic ${Math.max(12, Math.round(size * 0.028))}px 'Cormorant Garamond', serif`
  ctx.fillText('r', c + R / 2 - 4, c - 8)
}

export default function Diagram({ sides }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const [size, setSize] = useState(0)

  // As large a square as the space allows
  useLayoutEffect(() => {
    const box = boxRef.current
    const measure = () => setSize(Math.max(120, Math.floor(Math.min(box.clientWidth, box.clientHeight))))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw(ctx, size, sides)
    // The label font may arrive after the first draw
    document.fonts?.ready.then(() => draw(ctx, size, sides))
  }, [size, sides])

  const description = `A circle trapped between two ${sides}-sided polygons (${shapeName(sides).toLowerCase()}s): ` +
    `one inside it, with perimeter ${innerBound(sides).toFixed(4)} diameters, and one around it, with perimeter ` +
    `${outerBound(sides).toFixed(4)} diameters. Each is drawn as ${sides} triangles meeting at the centre.`

  return (
    <div className="diagram" ref={boxRef}>
      <canvas ref={canvasRef} role="img" aria-label={description} style={{ width: size, height: size }} />
    </div>
  )
}
