import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const VISITED = 'archimedes-pi-visited'   // the same key as the original page, so returning visitors aren't shown it again

// "About this activity": the history and what to try. The browser's own modal dialog (focus stays in
// it, Escape closes it), opened by the (i) button and, once, on a first visit. Closing always puts
// focus back on the (i) button.
const AboutDialog = forwardRef(function AboutDialog({ returnFocusTo }, ref) {
  const dialogRef = useRef(null)
  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close()
    returnFocusTo.current?.focus()
  }
  useImperativeHandle(ref, () => ({ open: () => dialogRef.current?.showModal() }))

  useEffect(() => {
    const dialog = dialogRef.current
    const onCancel = (e) => { e.preventDefault(); close() }   // Escape
    dialog.addEventListener('cancel', onCancel)
    try {
      if (!localStorage.getItem(VISITED)) {
        localStorage.setItem(VISITED, '1')
        dialog.showModal()
      }
    } catch { /* storage blocked: just don't open it unasked */ }
    return () => dialog.removeEventListener('cancel', onCancel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <dialog ref={dialogRef} className="about" aria-labelledby="about-title"
            onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="about-inner">
        <button type="button" className="about-close" onClick={close}>Close</button>
        <p className="about-eyebrow">About this activity</p>
        <h2 id="about-title">Squeezing <em>π</em> by exhaustion</h2>

        <p>
          Around <strong>250 BCE</strong>, the Greek mathematician <strong>Archimedes</strong> found a way to pin down
          the value of π without ever measuring a circle directly. He trapped the circle between two polygons: one drawn
          just inside it (<strong>inscribed</strong>) and one drawn just outside it (<strong>circumscribed</strong>).
        </p>
        <p>
          The circle’s true perimeter must lie <em>between</em> the two polygons’ perimeters. The more sides each polygon
          has, the tighter the squeeze, and the closer both come to π.
        </p>

        <h3>The triangle decomposition</h3>
        <p>Each polygon is a fan of identical triangles meeting at the centre. Archimedes used them to find its area:</p>
        <p className="formula">Area = ½ × perimeter × apothem</p>
        <p>
          For the outer polygon, the apothem is the radius <em>r</em>, so its area is exactly <strong>½ × perimeter × r</strong>.
          As the number of sides grows, both polygons’ areas close in on the circle’s: <strong>πr²</strong>.
        </p>

        <h3>What to try</h3>
        <ul>
          <li>Drag the slider, or use the arrow keys, to add sides and watch the polygons squeeze the circle. Page Up and Page Down jump by 8.</li>
          <li>Use the buttons under the slider to jump to <strong>Archimedes’ own steps</strong>: 6, 12, 24, 48, 96.</li>
          <li>Watch the inner and outer bounds close in on π = 3.14159…</li>
        </ul>

        <h3>Why 96?</h3>
        <p>
          Archimedes started with a regular hexagon, whose inscribed perimeter is exactly 6r, and doubled the sides four
          times to reach a <strong>96-gon</strong>. From it he proved that <strong>3 + 10/71 &lt; π &lt; 3 + 1/7</strong>,
          the bound <strong>π &lt; 22/7</strong> still taught today, worked out entirely by hand without decimals, algebra
          or trigonometry.
        </p>
      </div>
    </dialog>
  )
})

export default AboutDialog
