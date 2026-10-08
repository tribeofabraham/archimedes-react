import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ARCHIMEDES_STEPS, MAX_SIDES, MIN_SIDES, clampSides, estimate, innerBound, isConverged, outerBound, shapeName } from './geometry.js'

test('the bounds always trap π, for every number of sides', () => {
  for (let n = MIN_SIDES; n <= MAX_SIDES; n++) {
    assert.ok(innerBound(n) < Math.PI, `inner ${n}`)
    assert.ok(outerBound(n) > Math.PI, `outer ${n}`)
  }
})

test('more sides, a tighter squeeze', () => {
  for (let n = MIN_SIDES; n < MAX_SIDES; n++) {
    assert.ok(outerBound(n + 1) - innerBound(n + 1) < outerBound(n) - innerBound(n), `gap ${n}`)
  }
})

test("known values: the square, and the hexagon Archimedes started from", () => {
  assert.equal(innerBound(4).toFixed(6), (2 * Math.SQRT2).toFixed(6))   // 2√2
  assert.equal(outerBound(4).toFixed(6), '4.000000')
  assert.equal(innerBound(6).toFixed(6), '3.000000')                    // the hexagon's perimeter is 6r
})

test("the 96-gon gives Archimedes' own result: 3 10/71 < π < 3 1/7", () => {
  assert.ok(innerBound(96) > 3 + 10 / 71)
  assert.ok(outerBound(96) < 3 + 1 / 7)
})

test('steps, names, clamping and convergence', () => {
  assert.deepEqual(ARCHIMEDES_STEPS, [6, 12, 24, 48, 96])
  assert.equal(shapeName(6), 'Hexagon')
  assert.equal(shapeName(96), 'Enneacontahexagon')
  assert.equal(shapeName(37), '37-gon')
  assert.equal(clampSides(2), 4)
  assert.equal(clampSides(200), 96)
  assert.equal(isConverged(4), false)
  assert.equal(isConverged(96), true)
  assert.ok(Math.abs(estimate(96) - Math.PI) < 0.001)
})
