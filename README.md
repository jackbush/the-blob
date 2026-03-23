# The Blob
A browser-based generative art project using [p5.js](https://p5js.org/).

## Commands

```bash
npm install      # Install dependencies (first time)
npm run dev      # Dev server with HMR (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview the dist/ build locally
```

## Architecture
**Sketch pattern**: `blob.js` is a p5.js instance-mode sketch (`new p5(sketch)`). `setup()` creates the canvas; `draw()` runs the animation loop.
**Object hierarchy**: `Cluster` → `Blob[]` → `Point[]`.
- Each `Blob` has 5 vertices that oscillate between min/max radii using acceleration physics.
- `Cluster` holds multiple `Blob` layers drawn with low opacity to create depth.

## Key config (in `blob.js`)
| Parameter | Value | Effect |
|---|---|---|
| `layers` | 5 | Number of overlapping blobs |
| `spread` | 0.1 | Oscillation range as fraction of radius |
| `speed` | 20 | Units/frame for point movement |
| `acceleration` | 100 | Physics acceleration |
