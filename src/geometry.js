// Archimedes' method of exhaustion: trap the circle between a polygon drawn inside it (inscribed) and
// one drawn around it (circumscribed). Their perimeters, divided by the diameter, are a lower and an
// upper bound for π, and the more sides, the tighter the squeeze.

export const MIN_SIDES = 4
export const MAX_SIDES = 96
// Archimedes started from a hexagon and doubled four times, to the 96-gon
export const ARCHIMEDES_STEPS = [6, 12, 24, 48, 96]

// Inscribed n-gon: each side is 2r·sin(π/n), so perimeter ÷ diameter = n·sin(π/n) (< π)
export const innerBound = (n) => n * Math.sin(Math.PI / n)
// Circumscribed n-gon: each side is 2r·tan(π/n), so perimeter ÷ diameter = n·tan(π/n) (> π)
export const outerBound = (n) => n * Math.tan(Math.PI / n)
// The estimate shown: halfway between the two bounds
export const estimate = (n) => (innerBound(n) + outerBound(n)) / 2
// Close enough to call it converged, for the display
export const CONVERGED = 0.001
export const isConverged = (n) => Math.abs(estimate(n) - Math.PI) < CONVERGED

const NAMES = {
  3: 'Triangle', 4: 'Square', 5: 'Pentagon', 6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon', 9: 'Nonagon',
  10: 'Decagon', 12: 'Dodecagon', 16: 'Hexadecagon', 20: 'Icosagon', 24: 'Icositetragon',
  32: 'Triacontadigon', 48: 'Tetracontaoctagon', 96: 'Enneacontahexagon',
}
export const shapeName = (n) => NAMES[n] ?? `${n}-gon`

export const clampSides = (n) => Math.min(MAX_SIDES, Math.max(MIN_SIDES, Math.round(n)))

// What a screen reader hears as the sides change: at Archimedes' steps and every 8 sides.
export const isMilestone = (n) => [4, 6, 8, 12, 16, 24, 32, 48, 96].includes(n) || n % 8 === 0
