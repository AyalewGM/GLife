# GLife — Interactive Mathematics Lab

GLife is an independent mathematics playground for exploring **Conway's Game of Life** and **the Mandelbrot set**.

## Technology

React + TypeScript + Vite. The original vanilla-JavaScript simulators continue to run inside dedicated React studio pages while their mathematical engines are migrated and tested independently.

## Local development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Visit the local address printed by Vite. Check types and create the production bundle with:

```bash
npm run check
npm run build
npm run preview
```

The production build copies `GL/`, `Manibrot/` and `img/` into `dist/` so all legacy simulation scripts and image URLs still resolve.

## Publishing on GitHub Pages

In **Settings → Pages**, set **Build and deployment → Source → GitHub Actions**. The deployment workflow runs on pushes to `master`; it uses `GITHUB_PAGES=true` to emit URLs under `/GLife/`. The local development server uses `/`.

## Pre-merge manual testing

1. Run the production build; check for TypeScript and Vite errors.
2. On the homepage, open both experiments and use the back navigation.
3. In Game of Life: play, stop, step, randomize, and click grid cells.
4. In Mandelbrot: zoom in/out, change iterations/palette, restore defaults.
5. Check narrow/mobile layouts and GitHub Pages base-path URLs.
6. Check keyboard navigation, focus states, and reduced-motion preferences.

The existing mathematical simulation code is intentionally **not** refactored in this initial React UI migration. Browser smoke checks are required before merging.

Originally created by Ayalew Mersha.
