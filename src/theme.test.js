// npm test: the colours meet WCAG AA. Text 4.5:1; the edges of controls 3:1.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
// A see-through tint over black, as an opaque colour
const over = (r, g, b, a) => `#${[r, g, b].map((v) => Math.round(v * a).toString(16).padStart(2, '0')).join('')}`
const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')
const token = (name) => css.match(new RegExp(String.raw`--${name}:\s*(#[0-9a-f]{6})`, 'i'))[1]
const T = Object.fromEntries(['bg', 'panel', 'gold', 'gold-lt', 'gold-dim', 'blue', 'blue-lt', 'red', 'red-lt', 'green-lt', 'white', 'muted', 'edge', 'focus'].map((n) => [n, token(n)]))
const INNER_BG = over(74, 144, 196, 0.1)
const OUTER_BG = over(196, 74, 58, 0.1)
const check = (fg, bg, min) => assert.ok(contrast(fg, bg) >= min, `${fg} on ${bg}: ${contrast(fg, bg).toFixed(2)} < ${min}`)

test('text reads at 4.5:1 on the page and the panels', () => {
  for (const fg of ['white', 'muted', 'gold', 'gold-lt', 'gold-dim', 'green-lt']) for (const bg of ['bg', 'panel']) check(T[fg], T[bg], 4.5)
})

test("the bounds' labels and values on their tinted rows", () => {
  for (const fg of [T['blue-lt'], T.white, T.muted]) check(fg, INNER_BG, 4.5)
  for (const fg of [T['red-lt'], T.white, T.muted]) check(fg, OUTER_BG, 4.5)
})

test("black on the pressed step and the switch's gold", () => {
  check('#000000', T.gold, 4.5)
})

test('the edges of controls show at 3:1', () => {
  for (const edge of [T.edge, T.gold, T.focus, T.muted]) for (const bg of [T.bg, T.panel]) check(edge, bg, 3)
})
