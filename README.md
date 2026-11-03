# Xueyao Jiang - portfolio

A portfolio built with React, TypeScript, Vite, React Router, and plain CSS. It is a static website with no required backend, database, or paid service.

## GitHub Pages publication

The deployment target is the root user site `https://saizz-116.github.io/`, from the repository `saizz-116/saizz-116.github.io`. In repository Settings → Pages, choose **GitHub Actions** as the source. `.github/workflows/deploy.yml` installs the locked dependencies, builds the site, and publishes only `dist/` after pushes to `main`. Check Actions for the successful deployment before sharing a new version.

To update: save edits locally (including **保存** in the layout editor), review the local preview, commit the intended source changes, then push `main`. The deployment uses the saved `public/home-layout.json`. Editing locally does not automatically update the public site.

`scripts/build-pages.mjs` creates static HTML entry files for CV, all four project routes, and legacy aliases so opening and refreshing those paths works on GitHub Pages. Directory-index URLs may include a trailing slash; the app normalizes it for layout decisions. This deployment assumes a root user site, not a repository subfolder.

Keep `material/`, `.qa/`, `.preview/`, local environment files, private CV originals, and original video footage outside Git. Only the web assets under `public/` are deployed. The local editing API is part of the preview service and is not published by GitHub Pages.

## Open the portfolio

On this Windows computer, double-click **`Start Portfolio.cmd`** in this folder. It builds the latest source, starts the preview in the background, and opens [the local homepage](http://127.0.0.1:4173/). You can close the launcher window after it finishes. Running it again reuses the existing preview server.

After restarting Windows, run the launcher again. If the browser says **connection refused**, start the launcher before refreshing. This local address works only on this computer. The published site is [saizz-116.github.io](https://saizz-116.github.io/). Preview logs are saved in `.preview/server.log`.

The launcher needs installed dependencies and Node.js 22.12 or newer. It can use the Codex bundled Node.js runtime on this computer when Node is not on `PATH`.

## Edit the homepage visually

Open [the local layout editor](http://127.0.0.1:4173/edit), or choose **编辑排版** beside CV on the local homepage. Run `Start Portfolio.cmd` first if the service is not running. The launcher upgrades an older managed preview automatically after verifying its PID, executable, command line, and listening port.

- Choose a project and its **封面**, **标题**, or **说明**, or click that element on the canvas.
- Drag it to move. Covers have handles on all four corners and four sides; **保持比例** preserves their proportions, with the opposite corner/side anchored. Text boxes have left/right width handles and automatic text height. Handles keep a usable screen size when the canvas is zoomed out.
- Adjust position, width, font size, and line spacing in the right panel. Arrow keys move one design pixel; Shift plus an arrow moves ten.
- **撤销 / 重做** step through changes. **恢复原布局** returns to the original composition and can itself be undone.
- Click **保存**, then **返回首页** to see the result. Resetting a previously saved custom layout also requires **保存**.

Saving writes `public/home-layout.json` and the running preview's `dist/home-layout.json`, so changes survive refreshes, browser restarts, and future builds. They are not stored only in one browser. Include `public/home-layout.json` when handing the project to another agent or publishing it. The editor does not edit project copy, CV content, or source artwork.

An empty `items` object uses the original CSS layout. A saved custom layout uses independent cover/title/description coordinates on a 1200 × 700 design canvas and scales the whole composition to fit the desktop. To return to editing the original grid rules in `src/styles.css`, restore and save the original layout first.

The entry and save API are available only on the loopback development/preview server. A published static site displays the saved composition without an editing entry or writable service. The save API accepts only the fixed layout file, validates every element, and checks the local host, origin, and session token.

## Current design and content rules

The homepage follows the owner's sketch: a landscape composition designed to fit one desktop screen, with four asymmetrical project cards. The work and the owner's name are the focus. The current scope is **desktop development and desktop QA only**; do not spend this iteration tuning phone layouts or make mobile review a completion requirement.

The gallery keeps its irregular arrangement and shifts right by approximately 37–52 px across typical 1346–1920 px desktop widths. The offset is bounded so right-side captions remain visible. The outside Mixed Lives heading stays on one line in a wider caption column; it is separate from the handwritten title within the artwork.

Keep these rules when editing:

- Keep exactly four primary projects: **Mixed Lives**, **Gaudí-Inspired Procedural House**, **Emotional Vacuum**, and **DKU Campus Tour**.
- Mixed Lives uses the owner's supplied artwork. Emotional Vacuum uses the approved frame from the supplied demo. The remaining covers stay solid colors until real images are supplied. Do not generate substitute artwork or screenshots.
- Do not add illustrative-placeholder badges, tiny placeholder labels, gratuitous taglines, or filler descriptions.
- Emotional Vacuum has an authored case study based on supplied project materials. Keep the remaining project pages empty apart from their heading and navigation until their materials are supplied.
- On project pages, the project title replaces the name at the upper-left masthead position, with CV at the right and the return-home button directly below the title. Do not leave an empty brand row above it.
- Verify desktop layout visually after layout changes: assess spacing, alignment, type hierarchy, and overall balance as well as functional behavior.
- Keep the web CV concise and curated. Exclude GPA, scholarships, and telephone numbers.
- Do not publish the original CV PDF or add a download link to it. The public CV is HTML rendered from the curated content data.
- Do not publish the website or push it to a remote repository without the owner's permission.

## Routes

| Route | Content |
| --- | --- |
| `/` | Four-project homepage |
| `/cv` | Combined profile and curated web CV |
| `/edit` | Local graphical homepage layout editor |
| `/work/mixed-lives` | Mixed Lives |
| `/work/pcg-project` | Gaudí-Inspired Procedural House |
| `/work/emotional-vacuum` | Emotional Vacuum: full English design and development case study |
| `/work/dku-campus-tour` | DKU Campus Tour |

The house project's existing `pcg-project` slug is retained so its URL stays stable. Legacy `/about` and `/resume` links redirect to `/cv`; `/contact` also leads to the combined profile/CV page.

## Edit content and covers

`src/data/portfolio.ts` is the central content file. `profile` contains the name, email, introduction, education, experience, grouped skills, and curated project entries used by the web CV. `projects` contains the four project titles, summaries, media labels, years, and covers. `src/types.ts` defines the content shapes. Move project records within the `projects` array to change their order, keeping the existing slugs. CV project entries refer to those same slugs.

Cover colors are set in each project record. For the two covers still awaiting images, leave their image sources unset. Mixed Lives uses the two-image component described below rather than the generic cover source. Emotional Vacuum uses its approved demo frame. When another approved cover is ready:

1. Put it in the corresponding `public/media/<project-slug>/` folder.
2. Set that project's cover source in `src/data/portfolio.ts` to its root-relative URL and provide descriptive alternative text.
3. Run the launcher again to build and view the change.

For example, a file at `public/media/pcg-project/cover.webp` is served at `/media/pcg-project/cover.webp`. Do not include `public` in the URL. Use compressed images sized for the page; do not load large originals unnecessarily.

```ts
cover: {
  src: '/media/pcg-project/cover.webp',
  alt: 'Describe the actual artwork or game screenshot.',
  color: '#d4dfcd',
},
```

Omit `src` to show only `cover.color`. `homeTitle` is optional when a shorter card title is needed; `title` remains the full project name.

The media folders remain:

```text
public/media/
  mixed-lives/
  pcg-project/
  emotional-vacuum/
  dku-campus-tour/
```

Do not populate the blank project pages with speculative case studies. Add verified text, contribution credits, images, and videos when the owner provides those materials. Older unused assets are not approved covers for this redesign.

The original CV contains personal information intentionally omitted from the website. Keep it outside `public/` and the production output. Make future public CV edits in the curated data rather than embedding or uploading the original document.

## Emotional Vacuum case study

The owner approved a complete English case study and the homepage cover taken at 01:13 of the supplied project film. Its independent visual treatment moves from a warm room palette to a night-sky palette, while preserving the saved homepage layout and the other project pages.

- `src/components/EmotionalVacuumPage.tsx` contains the page, the six-stage player journey, YouTube chapter controls, image enlargement, and two-moment comparison.
- `src/components/emotional-vacuum.css` scopes its visual styles to the project page.
- `src/data/emotionalVacuum.ts` holds the concept, design decisions, development stages, credits, and reflection.
- `src/data/emotionalVacuumEnvironment.ts` holds the environment authorship and film-reference readings. Furniture and prop modeling in 3ds Max and the hand-drawn posters are credited to Xueyao, as confirmed by the owner. Scene arrangement and material integration are credited separately in Unity. The film connections are visual readings, with primary film references linked on the page; do not mislabel House/Hausu as Monster House or later distributor covers as original theatrical posters.
- `public/media/emotional-vacuum/` holds optimized real photos, demo frames, and drawings. The full film streams from the owner's YouTube upload, `https://youtu.be/qHm_HIUTsws`. A local poster is shown first; the YouTube player loads only after a play or chapter click. A direct YouTube link remains available. Do not add the large local video files back to `public/`.
- `.qa/emotional-vacuum/media-manifest.json` records source files, timestamps, dimensions, and crops. Media validation and browser screenshots are retained beside it.
- The environment section uses stills from the supplied Unity gameplay recording, with editor chrome cropped away. Firework launch/burst/trails are shown as a static image sequence, with a link to the release chapter of the YouTube film. `new-media-manifest.json` and `drawing-exports.json` record the frame selections and drawing exports. Original footage, drawings, and Unity scene placement are preserved. Former local MP4 exports are archived under the Git-ignored `.qa/emotional-vacuum/local-video-archive/`, outside the published assets. The final firework frames are actual recorded game effects.

Present the completed work with its owner-confirmed development period, Sep–Oct 2026. Do not label the game a prototype or ongoing development. Workshop instruction and project guidance by Xiao Tan, Senior Adjunct Teaching Associate at NYU Shanghai, are credited alongside the workshop context near the beginning, using the supplied syllabus; the final credits list the four team members. The mixed-emotion phase adds load that slows captures and contracts capture range. Do not describe reduced walking speed or inventory-based fireworks. Design interpretation remains distinct from observed playtest results. The project was submitted to alt.ctrl.GDC 2027; submission does not mean selection. Audio sources have been checked: the three external fault/firework effects are CC0, and the owner confirmed the opening and emotion effects are the team's sound designer's work. Keep the team sound-design credit; no additional CC0 attribution is required. See `.qa/emotional-vacuum/audio-attribution-audit.json` for the source record.

## Mixed Lives cover

`src/components/MixedLivesCover.tsx` displays the supplied PNG above a static merged export of the supplied PSD. Each image keeps its original 16:9 proportions; together they form an 8:9 cover. The owner canceled the bottle-floating effect; keep this artwork static. Desktop placement is defined in `src/styles.css`. The Mixed Lives detail page remains blank.

The browser loads optimized exports from `public/media/mixed-lives/`:

| File | Purpose |
| --- | --- |
| `cover-top.webp` | Upper character artwork |
| `cover-bottom-fallback.webp` | Complete static lower composition |
| `title-handwritten.png` | Ivory Mixed Lives lettering rasterized from Bradley Hand |

The WebP artwork uses 1200×675 canvases and retains the source Display P3 color profile. No artwork was repainted or reconstructed. The title is a separate transparent raster image, mechanically generated from the font; no AI-generated artwork was added.

The `objects/*.webp` layer exports, `manifest.json`, and older `cover-bottom-back.webp`, `cover-bottom-float.webp`, and `cover-bottom-front.webp` files are retained for reference and are not loaded by this component.

The original PNG and PSD remain untouched in `material/`. The roughly 29 MB PSD is not a public asset and is not loaded by the browser. No PSD-reading library or additional website dependency is needed. Re-export from the originals when changing artwork; preserve their proportions.

## Development commands

For live editing, open a terminal in this folder and run:

```powershell
pnpm install
pnpm dev
```

Open the URL printed by Vite. This development server refreshes as source files are saved; keep its terminal open and press `Ctrl+C` to stop it. It is separate from the background production preview started by `Start Portfolio.cmd`.

If pnpm is not on `PATH` in Codex, use the bundled executable:

```powershell
& 'C:\Users\amy_j\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' install
& 'C:\Users\amy_j\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dev
```

Build the static production files or check TypeScript with:

```powershell
pnpm build
pnpm check
```

`pnpm build` writes the deployable site to `dist/`. Do not edit generated files there. `pnpm preview` serves the latest build in its terminal; the Windows launcher is the convenient option for a preview that runs in the background. The equivalent npm scripts are `npm run dev`, `npm run build`, `npm run check`, and `npm run preview`.

## Folder structure

```text
src/
  data/portfolio.ts    Curated profile/CV and four project records
  types.ts             Shared content types
  App.tsx              Pages, routes, and navigation
  components/          Reusable components
  editor/              Local layout editor, shared schema, and saved-layout renderer
  styles.css           Layout and visual styles
public/
  home-layout.json     Saved homepage layout (include with source and publication)
  media/               Owner-supplied project assets
  _headers             Cloudflare Pages response headers
scripts/preview.mjs    Builds and starts the local preview
scripts/layout-editor-plugin.ts  Local layout save middleware for Vite
Start Portfolio.cmd    Double-click Windows launcher
index.html             Base document and SEO metadata
package.json           Development and build commands
pnpm-lock.yaml         Locked dependency versions
dist/                  Generated production output
```

## Future Cloudflare Pages deployment

Local preview does not publish the site. When publication is authorized, Cloudflare Pages can build the source or accept the generated `dist/` directory.

For a repository-connected Pages project:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Root directory | This project folder |
| Node.js | 22.12 or newer |

This site uses browser routes. [Cloudflare Pages provides a single-page application fallback](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering) when there is no top-level `404.html`. Keep that behavior so refreshing a project route serves the app. Other static hosts need an equivalent fallback to `index.html` for routes that are not files.

`public/_headers` supplies basic security headers and caching for generated assets. Before sharing, review the curated public CV, confirm that private source documents are absent from `public/` and `dist/`, run a production build, and check the routes at the desktop sizes under review. Mobile tuning is outside the current requested scope.
