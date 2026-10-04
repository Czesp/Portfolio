# Prashant Bhattarai — engineering portfolio

A Next.js portfolio with a rotating vehicle assembly, a mechanical startup sequence, perspective-driven chapters, and engineering case studies. The visual direction combines graphite, warm white, muted green, editorial typography, and original technical illustrations.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm start` serves the production build. The site requires no API keys or backend service.

On Windows PowerShell, use `npm.cmd` in place of `npm` if script execution is restricted.

Browser verification uses Playwright:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

The tests cover the scroll loop, loader replay rules, mobile navigation, reduced motion, the downloadable resume, every detail route, and local document/model previews. The test runner starts its own production server on port 3002 so an older preview does not affect the results. Set `PLAYWRIGHT_PORT` to use a different test port.

## Content and architecture

- `src/app/page.tsx` mounts the portfolio; `src/app/layout.tsx` defines page metadata.
- `src/components/portfolio.tsx` coordinates the main page, navigation, loading presentation, and scroll experience.
- `src/components/depth-section.tsx` moves chapters toward the viewer through a perspective camera while keeping native document scrolling. Longer chapters remain readable before their exit transition.
- `src/components/car-scene.tsx` renders the interactive vehicle and animates its parts with Three.js and React Three Fiber.
- `src/components/engineering-overlay.tsx` adds responsive mechanical drawings throughout the car journey: gears, structural projections, exploded guides, rotation arcs, toolpaths, and a closing reassembly frame. The drawings crossfade between chapters and move with scroll; their visibility stays independent of the car's opacity.
- `src/components/project-visual.tsx` contains original SVG illustrations for the three project covers.
- `src/components/detail-visual.tsx` supplies topic-specific experience illustrations; project detail pages reuse their matching project artwork.
- `src/components/detail-view.tsx` and `detail-view.module.css` provide the experience and project detail layout and attachment previews. `stl-viewer.tsx` renders STL models.
- `src/app/projects/[slug]/page.tsx` and `src/app/experience/[slug]/page.tsx` provide shareable detail pages.
- `src/data/portfolio.ts` is the content source for the profile, education, experiences, projects, leadership, skills, and attachment links.
- `src/app/globals.css` defines layout, responsive styles, and visual treatments.
- `src/app/journey.css` defines the perspective scene, portrait space, and editorial home styling.
- `public/` holds the downloadable resume and any future photos or project files.

The vehicle completes a full 360° turn, travels through the scene, separates in stages, and reassembles toward the end. Chapters approach from the distance and pass forward as the visitor scrolls. Continuing to scroll at the end loops the journey; the replay button also returns to the beginning. Scrolling backward reverses the sequence.

The introduction plays on a fresh page load, every reload, and when “Take another spin” is clicked. Returning from a project or experience using the site’s links or browser Back skips it. Completion is kept only in the current document’s JavaScript memory, so a page reload resets it. The automatic end-of-scroll loop returns directly to the beginning without interrupting scrolling with another intro.

Reduced-motion preference or the Motion control switches to a conventional document layout and a static assembled vehicle. Navigation, projects, contact links, and replay remain available.

The portfolio content comes from the supplied resume. GitHub and email use its actual contact details. A LinkedIn destination and headshot were not provided, so their profile fields are empty until real assets are added.

## Add a headshot, LinkedIn, or resume

1. Put a headshot at `public/images/prashant.jpg`. The prominent portrait card in About currently shows a placeholder.
2. In `src/data/portfolio.ts`, set `profile.headshot` to `"/images/prashant.jpg"`.
3. Set `profile.linkedin` to the actual full LinkedIn profile URL.
4. Replace `public/resume_Bhattarai_Prashant.pdf` when the resume changes, or update `profile.resume` to the new public path.

Public asset paths begin with `/` and omit the `public` directory. Keep contact fields empty when a real destination is unavailable.

## Edit experience and project details

Both `experiences` and `projects` use `PortfolioEntry`. Edit the title, organization, period, summary, paragraphs in `details`, and the `skills` array. Each `slug` must be unique and URL-friendly. Add new entries to the appropriate exported array.

The existing resume includes project descriptions but no supporting project media. Add actual files to `public/work/` and populate the entry’s `attachments` array:

```ts
attachments: [
  {
    label: "Integrated prototype",
    url: "/work/vehicle/prototype.jpg",
    type: "image",
  },
  {
    label: "Project presentation",
    url: "/work/vehicle/presentation.pptx",
    type: "presentation",
  },
  {
    label: "Sensor mount — 3D model",
    url: "/work/vehicle/sensor-mount.stl",
    type: "stl",
  },
  {
    label: "Sensor mount — source CAD",
    url: "/work/vehicle/sensor-mount.step",
    type: "cad",
  },
  {
    label: "Design report",
    url: "/work/vehicle/design-report.pdf",
    type: "pdf",
  },
],
```

This configuration works for both experience and project entries. Images can be previewed in the detail view. STL models use the interactive 3D viewer. CAD source files such as STEP, SLDPRT, and NX files are available as downloads for their respective design applications. PowerPoint files are downloadable; export a presentation to PDF and add it as `type: "pdf"` when a browser-readable version is useful.

The detail view also offers **Preview a local file**. Selecting a file previews it within the current browser session; it does not upload or persist the file. To publish an attachment, put the file in `public/`, add its path to `src/data/portfolio.ts`, and deploy the updated site.

## Deployment

Deploy as a standard Next.js application to a compatible host, using `npm run build` as the build command. Review the profile fields, metadata, and actual attachment paths before publishing.
