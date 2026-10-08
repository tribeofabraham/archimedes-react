# archimedes-react

**Archimedes' Circle: Approaching π**, a Loud Math tool, rebuilt in React. Trap a circle between a
polygon drawn inside it and one drawn around it, add sides, and watch π squeezed between their
perimeters, the way Archimedes did around 250 BCE (his 96-gon gave 3 10/71 < π < 3 1/7).

Live at **https://tribeofabraham.com/loud-math/archimedes-pi/** (the same address as the original
page; toa-site builds this repo into that folder).

- **The method:** the inscribed polygon's perimeter ÷ diameter is n·sin(π/n), below π; the
  circumscribed one's is n·tan(π/n), above it. The estimate shown is halfway between.
- **Archimedes' steps:** buttons for 6, 12, 24, 48 and 96 sides, the hexagon doubled four times.
- **WCAG 2.2 AA:** the slider and steps work by keyboard (arrows, Page Up / Page Down by 8), the
  diagram has a text description that follows the sides, milestones are announced to screen
  readers, "converged" is said in words as well as shown in green, the About dialog is the
  browser's own modal, and colour contrast is held by a test. Everything is in em and scaled by a
  sizer, with an Auto-scale text switch; short, wide frames get a compact two-column layout. axe:
  no violations.
- Its own classical look, from the original: gold on black, Cinzel and Cormorant Garamond.

## Project layout

| Path | What it is |
| --- | --- |
| `src/geometry.js` | The bounds, the estimate, the steps, the shapes' names |
| `src/components/Diagram.jsx` | The canvas drawing, and its text description |
| `src/components/AboutDialog.jsx` | "About this activity" (opens once, on a first visit) |
| `src/App.jsx` | The page: header, figure and legend, readings, slider and steps |
| `src/sizer.js` | Scales the page to the space (everything is in em) |

## Working on it

```
npm install
npm run dev       # at the address Vite prints
npm test          # the geometry (incl. Archimedes' 96-gon bounds) and colour contrast
npm run build     # dist/
```

To publish: commit and push, then deploy toa-site (`npm run deploy` there), which builds this repo
into `loud-math/archimedes-pi/`.

## License

MIT
