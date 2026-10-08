import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import AboutDialog from './components/AboutDialog.jsx'
import Diagram from './components/Diagram.jsx'
import {
  ARCHIMEDES_STEPS, MAX_SIDES, MIN_SIDES, clampSides, estimate, innerBound, isConverged, isMilestone, outerBound, shapeName,
} from './geometry.js'
import { useSizer } from './sizer.js'

// The page fills the window without scrolling where it can: the diagram beside the readings on a wide
// screen, above them on a tall one. Everything is in em, scaled by the sizer.
const SIZER = { designWidth: 1060, designHeight: 800, fitHeight: true, minScale: 0.75, maxScale: 2, reflowBelow: 40 }
// A tall or narrow screen stacks everything in one column (index.css), so it's sized to that column's
// width instead, and scrolls: a tablet held upright gets bigger text, not desktop-scaled small text.
const TALL = '(max-aspect-ratio: 1/1), (max-width: 48em)'
const TALL_SIZER = { designWidth: 600, fitHeight: false, minScale: 1, maxScale: 1.35, reflowBelow: 40 }

function useMedia(query) {
  const list = useMemo(() => window.matchMedia(query), [query])
  return useSyncExternalStore(
    (onChange) => { list.addEventListener('change', onChange); return () => list.removeEventListener('change', onChange) },
    () => list.matches,
  )
}
const fmt = (v) => v.toFixed(6)

export default function App() {
  const [sides, setSides] = useState(4)
  const [fluid, setFluid] = useState(true)
  const sizerRef = useRef(null)
  const tall = useMedia(TALL)
  const scale = useSizer(sizerRef, { ...(tall ? TALL_SIZER : SIZER), enabled: fluid })
  const aboutRef = useRef(null)
  const infoRef = useRef(null)

  // What a screen reader hears as the sides change: at Archimedes' steps and every 8 sides
  const [announcement, setAnnouncement] = useState('')
  const changed = useRef(false)
  useEffect(() => {
    if (!changed.current) return
    if (isMilestone(sides)) setAnnouncement(`${sides} sides. π is about ${fmt(estimate(sides))}, within ${fmt(Math.abs(estimate(sides) - Math.PI))}.`)
  }, [sides])
  const go = (n) => { changed.current = true; setSides(clampSides(n)) }

  const inner = innerBound(sides)
  const outer = outerBound(sides)
  const mid = estimate(sides)
  const converged = isConverged(sides)
  const progress = ((sides - MIN_SIDES) / (MAX_SIDES - MIN_SIDES)) * 100

  return (
    <div className="sizer" ref={sizerRef}>
      <div className="page" style={{ fontSize: `${scale}rem` }}>
        <p className="visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</p>

        <header className="top">
          <p className="eyebrow">Open Source Math Education · Tribe of Abraham</p>
          <div className="title-row">
            <button type="button" className="info" ref={infoRef} aria-haspopup="dialog" onClick={() => aboutRef.current.open()}>
              <span aria-hidden="true">i</span><span className="visually-hidden">About this activity</span>
            </button>
            <h1>Archimedes’ Circle <em>Approaching π</em></h1>
          </div>
          <p className="subtitle">The method of exhaustion, 250 BCE</p>
        </header>

        <main className="layout">
          {/* The diagram, with what its colours mean under it */}
          <figure className="figure">
            <Diagram sides={sides} />
            <figcaption>
              <ul className="legend" aria-label="What the colours show">
                <li><span className="swatch circle" aria-hidden="true" /> Circle (the true boundary)</li>
                <li><span className="swatch inner" aria-hidden="true" /> Inscribed triangles (less area than the circle)</li>
                <li><span className="swatch outer" aria-hidden="true" /> Circumscribed triangles (more area than the circle)</li>
                <li><span className="swatch radial" aria-hidden="true" /> Radial lines (the triangle decomposition)</li>
              </ul>
            </figcaption>
          </figure>

          <section className="readings" aria-label="π, squeezed">
            <div className="sides">
              <p className="sides-num">{sides}</p>
              <p className="small-caps">Sides</p>
              <p className="shape-name">{shapeName(sides)}</p>
            </div>

            <div className={`panel estimate${converged ? ' is-converged' : ''}`}>
              <p className="small-caps">π approximation</p>
              <p className="pi-value">{fmt(mid)}</p>
              <p className="pi-true">
                {converged ? <><span aria-hidden="true">✓ </span>Within 0.001 of π · </> : null}true π = 3.14159265…
              </p>
            </div>

            <div className="bounds">
              <div className="bound inner">
                <p className="bound-label">Inner bound (inscribed)</p>
                <p className="bound-value">{fmt(inner)}</p>
                <p className="bound-note">Perimeter ÷ diameter · less than π</p>
              </div>
              <div className="bound outer">
                <p className="bound-label">Outer bound (circumscribed)</p>
                <p className="bound-value">{fmt(outer)}</p>
                <p className="bound-note">Perimeter ÷ diameter · more than π</p>
              </div>
            </div>

            <div className="panel control">
              <div className="control-head">
                <label className="small-caps gold" htmlFor="sides-slider">Add sides</label>
                <span className="range-note">{MIN_SIDES} – {MAX_SIDES}</span>
              </div>
              <input id="sides-slider" type="range" min={MIN_SIDES} max={MAX_SIDES} step={1} value={sides}
                     style={{ '--progress': `${progress}%` }}
                     aria-valuetext={`${sides} sides, ${shapeName(sides)}`}
                     onChange={(e) => go(Number(e.target.value))}
                     onKeyDown={(e) => {
                       if (e.key === 'PageUp') { e.preventDefault(); go(sides + 8) }
                       if (e.key === 'PageDown') { e.preventDefault(); go(sides - 8) }
                     }} />
              {/* Archimedes' steps: the hexagon, doubled four times */}
              <div className="steps" role="group" aria-labelledby="steps-label">
                <p id="steps-label" className="steps-label">Archimedes doubled:</p>
                {ARCHIMEDES_STEPS.map((n) => (
                  <button key={n} type="button" className="step" aria-pressed={sides === n} onClick={() => go(n)}>
                    {n}<span className="visually-hidden"> sides</span>
                  </button>
                ))}
              </div>
            </div>

          </section>
        </main>

        <footer className="foot">
          <p>© {new Date().getFullYear()} <a href="https://tribeofabraham.com">Tribe of Abraham</a> · Loud Math</p>
          {/* A switch: its name stays "Auto-scale text"; it reports on / off itself */}
          <button type="button" role="switch" aria-checked={fluid} className="scale-switch" onClick={() => setFluid(!fluid)}>
            Auto-scale text
            <span className="switch-track" aria-hidden="true"><span className="switch-knob" /></span>
            <span className="switch-state" aria-hidden="true">{fluid ? 'On' : 'Off'}</span>
          </button>
        </footer>

        <AboutDialog ref={aboutRef} returnFocusTo={infoRef} />
      </div>
    </div>
  )
}
