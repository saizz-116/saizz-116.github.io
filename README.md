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

- Choose **首页元素** for **姓名**, **副标题**, **CV 入口**, and **邮箱**, or choose a project and its **封面**, **标题**, or **说明**. You can also select any of these directly on the complete homepage canvas.
- Drag it to move. Covers and the CV button have handles on all four corners and four sides; **保持比例** preserves cover proportions, with the opposite corner/side anchored. Text boxes have left/right width handles and automatic text height. The CV button also has editable typography. Handles keep a usable screen size when the canvas is zoomed out.
- Adjust position, width, font size, and line spacing in the right panel. Arrow keys move one design pixel; Shift plus an arrow moves ten.
- **撤销 / 重做** step through changes. **恢复原布局** returns to the original composition and can itself be undone.
- Click **保存**, then **返回首页** to see the result. Resetting a previously saved custom layout also requires **保存**.

Saving writes `public/home-layout.json` and the running preview's `dist/home-layout.json`, so changes survive refreshes, browser restarts, and future builds. They are not stored only in one browser. Include `public/home-layout.json` when handing the project to another agent or publishing it. The editor adjusts the entire desktop homepage, including its masthead and contact link, and does not edit project copy, the separate CV page, or source artwork.

The complete homepage uses a version-2, 1440 × 900 design canvas with sixteen independently positioned elements. The editor and desktop website render the same `LayoutScene`. The project composition scales to fit the available space; the name, subtitle, navigation button, and email retain readable physical sizes and follow the shared content edges. Their saved positions act as offsets from the reference canvas. CV uses the same name and subtitle geometry, and all page navigation follows the saved CV control's dimensions and typography. The shared content frame grows smoothly from 1280px to 1400px on larger screens, with symmetric gutters on smaller screens. An empty `items` object resets to the full-page defaults. Version-1 project-only layouts are migrated without resetting project adjustments; a copy of the pre-migration file is kept locally in `.qa/home-layout-before-full-page.json`. Mobile and tablet layouts reflow automatically and do not use these desktop coordinates.

The entry and save API are available only on the loopback development/preview server. A published static site displays the saved composition without an editing entry or writable service. The save API accepts only the fixed layout file, validates every element, and checks the local host, origin, and session token.

## Edit project pages visually

Open a project in the local preview and choose **编辑本页排版** at the lower left. The homepage editor also has a **项目页排版** button. Direct entry: [PCG project editor](http://127.0.0.1:4173/work/pcg-project/?edit=layout). The bottom toolbar switches between all four projects.

Click a heading, paragraph, caption, image, video, or section to select it. Drag the element or its green **移动** tab to reposition it; images have handles on all four corners and sides, while text and content blocks have width handles and natural height. Image resizing preserves the opposite edge/corner even for the PCG houses anchored at the bottom right. Use the settings panel for width, offsets, typography, line height, bottom spacing, and container gaps. **选择外层区块** selects a containing section. Search the element list to jump through long case studies. Move the panel to the other side or collapse it if it covers the artwork. Arrow keys move one pixel; Shift moves ten; Ctrl+Z/Shift+Ctrl+Z undo/redo. Page links and video playback are paused during desktop editing so clicking selects content.

**保存** writes the current project's settings to `public/project-layout.json` and the running preview's matching `dist/` file. Saves merge only that project into the document, preserving other projects. **恢复此元素** clears a selection's changes; **恢复本页** clears the current project. Both support undo and require saving. Temporary verification adjustments have been removed. Include `public/project-layout.json` when handing off or publishing the site. Changes are local until an authorized deployment; the public site has no editing entry or writable API.

Adjustments apply only above 1100px. Phone/tablet pages retain their existing automatic layouts. The tool edits layout, not project text or artwork. It uses semantic element keys in `src/editor/project-layout.ts`; changing source copy/markup can give that element a new key, so review saved custom layouts after content changes. The local save API validates a fixed set of numeric style properties, project slugs, origins, and session tokens; it never accepts arbitrary CSS or filesystem paths. The editor UI is loaded only when the local editing mode is opened. Run the launcher once to upgrade an older preview service to API version 3.

## Current design and content rules

The desktop homepage follows the owner's sketch: a landscape composition designed to fit one screen, with four asymmetrical project cards. The work and the owner's name are the focus. Support mobile as well: at widths up to 1100px, reflow the homepage into readable project cards instead of shrinking the saved desktop canvas. Phones use one column, tablets use two. Keep the saved desktop coordinates intact.

The complete desktop canvas preserves the irregular project arrangement, while the owner can now position the name, Portfolio subtitle, CV button, and contact email together with the project elements. The outside Mixed Lives heading stays on one line in a wider caption column; it is separate from the handwritten title within the artwork.

Keep these rules when editing:

- Keep exactly four primary projects: **Mixed Lives**, **Gaudí-Inspired Procedural House**, **Emotional Vacuum**, and **DKU Campus Explorer**.
- Mixed Lives uses the owner's supplied artwork. Emotional Vacuum uses the approved frame from the supplied demo. DKU Campus Explorer uses a real frame from the owner's gameplay recording. The house cover stays a solid color until real images are supplied. Do not generate substitute artwork or screenshots.
- Do not add illustrative-placeholder badges, tiny placeholder labels, gratuitous taglines, or filler descriptions.
- Emotional Vacuum and DKU Campus Explorer have authored case studies based on supplied project materials. Keep the other project pages empty apart from their heading and navigation until their materials are supplied.
- Project pages use one fixed top bar: Portfolio on the left, the project title in the middle, and CV on the right. Align the two buttons with the centered body and hero's outer edges, using the same content frame as the homepage and CV; their size and typography follow the saved homepage CV control. Keep generous symmetric gutters; do not reserve a left sidebar or place controls against the viewport edges. When Emotional Vacuum's original chapter strip has scrolled above the top bar, show its chapters in the bar's middle area and mark the current section. Mobile uses a chapter selector (a menu icon on very narrow screens). Reserve space for the fixed header and anchor targets.
- Verify desktop and mobile layouts visually after layout changes: assess spacing, alignment, type hierarchy, touch targets, horizontal overflow, and overall balance as well as functional behavior. The local graphical layout editor remains a desktop tool.
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
| `/work/dku-campus-tour` | DKU Campus Explorer: campus guide game project |

The house project's existing `pcg-project` slug is retained so its URL stays stable. Legacy `/about` and `/resume` links redirect to `/cv`; `/contact` also leads to the combined profile/CV page.

## Edit content and covers

`src/data/portfolio.ts` is the central content file. `profile` contains the name, email, introduction, education, experience, grouped skills, and curated project entries used by the web CV. `projects` contains the four project titles, summaries, media labels, years, and covers. `src/types.ts` defines the content shapes. Move project records within the `projects` array to change their order, keeping the existing slugs. CV project entries refer to those same slugs.

Homepage covers use smaller WebP delivery copies under `public/media/optimized/`, with content hashes in their filenames. `src/data/cover-images.json` supplies 480/800/1200px variants through `srcset`; the handwritten title has 160/320/640px variants and preserves transparency. Browsers choose a size for the screen width and pixel density. Both desktop and mobile use these copies. Keep the supplied originals intact; after changing them, run `python scripts/prepare-cover-images.py` (requires Pillow), then build and check the result visually. The first cover has high loading priority; below-fold mobile cards load lazily.

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

- `src/components/EmotionalVacuumPage.tsx` contains the page, the six-stage player journey, a click-to-load native video player and chapter controls, image enlargement, and two-moment comparison.
- `src/components/emotional-vacuum.css` scopes its visual styles to the project page.
- `src/data/emotionalVacuum.ts` holds the concept, design decisions, development stages, credits, and reflection.
- `src/data/emotionalVacuumEnvironment.ts` holds the environment authorship and film-reference readings. Furniture and prop modeling in 3ds Max and the hand-drawn posters are credited to Xueyao, as confirmed by the owner. Scene arrangement and material integration are credited separately in Unity. The film connections are visual readings, with primary film references linked on the page; do not mislabel House/Hausu as Monster House or later distributor covers as original theatrical posters.
- `public/media/emotional-vacuum/` holds optimized real photos, demo frames, drawings, and the approved `demo.mp4` web export. The primary player uses this self-hosted MP4 at `/media/emotional-vacuum/demo.mp4`. A local poster is shown first; the video loads only after a play or chapter click. The owner's YouTube upload, `https://youtu.be/qHm_HIUTsws`, remains available as a fallback link. Keep original footage and other large video exports outside `public/`.
- `.qa/emotional-vacuum/media-manifest.json` records source files, timestamps, dimensions, and crops. Media validation and browser screenshots are retained beside it.
- The environment section uses stills from the supplied Unity gameplay recording, with editor chrome cropped away. Firework launch/burst/trails are shown as a static image sequence, with a link to the film's release chapter. `new-media-manifest.json` and `drawing-exports.json` record the frame selections and drawing exports. Original footage, drawings, and Unity scene placement are preserved. The Git-ignored `.qa/emotional-vacuum/local-video-archive/` preserves the local MP4 exports; only the approved `demo.mp4` web export is also copied into the published assets for playback. The final firework frames are actual recorded game effects.

Present the completed work with its owner-confirmed development period, Sep–Oct 2026. Do not label the game a prototype or ongoing development. Workshop instruction and project guidance by Xiao Tan, Senior Adjunct Teaching Associate at NYU Shanghai, are credited alongside the workshop context near the beginning, using the supplied syllabus; the final credits list the four team members. The mixed-emotion phase adds load that slows captures and contracts capture range. Do not describe reduced walking speed or inventory-based fireworks. Design interpretation remains distinct from observed playtest results. The project was submitted to alt.ctrl.GDC 2027; submission does not mean selection. Audio sources have been checked: the three external fault/firework effects are CC0, and the owner confirmed the opening and emotion effects are the team's sound designer's work. Keep the team sound-design credit; no additional CC0 attribution is required. See `.qa/emotional-vacuum/audio-attribution-audit.json` for the source record.

## DKU Campus Explorer

`/work/dku-campus-tour` presents the complete two-person campus guide game, with the owner's interaction and creative design contributions highlighted through actual gameplay. The existing route slug is retained. The masthead and homepage display the game's title, **DKU Campus Explorer**.

- `src/components/DKUCampusExplorerPage.tsx` and `dku-campus-explorer.css` provide the independent campus-atlas layout, guide overview, local video, interaction details, day/night comparison, iteration, and contribution credits.
- `public/media/dku-campus-tour/` contains optimized stills, the edited `campus-demo.mp4`, its poster, and English WebVTT captions. The video plays directly from the static site; no video platform is required.
- Media is derived from the owner's `Q:\DKUCampusTour\Demo Video.mp4`. The original recording, survey frames, edit recipe, and media provenance stay outside the public site, under `.qa/dku-campus-tour/` where applicable.
- The walkthrough places the residential courtyard before the landmark conversation so all nighttime footage stays together. Its soundtrack uses the original `carefree.wav` continuously during daytime, then switches once to a continuous `dream-culture.wav` at the visible night transition. Do not restore the recording's per-cut music. `.qa/dku-campus-tour/compose-campus-demo.py` and `media-manifest.json` retain the current edit and music timing; the earlier pavilion-only helper is historical.
- The project remains credited as a two-person collaboration. The other contributor's name is omitted from this public portfolio for privacy. Their map, movement, collision, and keyboard work is credited by role. Do not publish the original report or author-credits footage containing their identity.
- Personal contributions follow the supplied report: NPC interactions, campus descriptions and dialogue, building and character details, music integration, and gameplay refinement. The report documents internal developer playthroughs; do not invent external user-study findings.
- Campus information and images are credited to Duke Kunshan University. The soundtrack is credited to Kevin MacLeod (incompetech.com), with the original track and CC BY 4.0 links and an indication of audio editing.

This iteration is prepared locally. The owner will handle GitHub deployment; do not commit or push as part of this task.

## PCG project background

The PCG detail page uses three equal vertical background panels, ordered left to right: mosaic, blue roof texture, and pale yellow wall. Supplied PNG originals stay in `material/pcg/`. Run `python scripts/prepare-pcg-critical-media.py` (Pillow required) to bake the existing silhouette masks into transparent WebP crops and create smaller texture tiles under `src/assets/pcg/`. Subject pixels are preserved from the supplied screenshots; there is no generative reconstruction.

The blue and pale brown watercolor textures repeat as 320px tiles. Tiny inline previews of all five visuals are bundled with the page code, so image subrequests cannot leave the displayed page empty. `usePCGMedia.ts` upgrades them together through one route-specific media chunk (about 151 KB compressed), also prefetched on hover/focus of the homepage PCG links. If that chunk fails, the previews remain visible. Ordinary `<img>` elements replace SVG-nested external images. The main bundle carries only about 12 KB of preview image bytes; full media loads only for PCG. The project title stays directly on the background. Description and progress note each have a compact warm white backing with softly blurred edges.

`PCGProjectOverview.tsx` uses the supplied introduction and technical-detail update notice. The two houses retain their static staggered composition. `src/data/pcg-cutout-outlines.json` preserves the original code-defined silhouettes for reproducible alpha export. The clean rectangular render remains the homepage cover through `cover-images.ts`; `python scripts/prepare-pcg-overview.py` regenerates its hashed delivery variants. No node-network panel is displayed. Old supplied artwork and public exports stay intact.

## Mixed Lives cover

`src/components/MixedLivesCover.tsx` displays the supplied PNG above a static merged export of the supplied PSD. Each image keeps its original 16:9 proportions; together they form an 8:9 homepage cover. The owner canceled the bottle-floating effect; keep this artwork static. Desktop placement is defined in `src/styles.css`.

The Mixed Lives detail page uses `MixedLivesPage.tsx` and scoped `mixed-lives.css`: a dark background, title and factual gameplay introduction, the first supplied cover only, and a large native gameplay video. Design rationale and a longer case study are intentionally reserved for the owner's forthcoming writing. `scripts/prepare-mixed-lives-cover.py` exports the complete first PNG without cropping or repainting to sRGB `cover-one.webp` and `cover-one-800.webp`. The page plays `/media/mixed-lives/demo.mp4` with `/media/mixed-lives/demo-poster.webp`; retain the original recording under ignored `material/`.

The video's collapsible Audio credits lists the music and twelve sound-effect sources from the Unity project's `CREDITS.txt`, with creator, source, CC0 links, and an editing note covering the demo's continuous music mix; the structured credits live in `src/data/mixedLivesAudio.ts`.

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

`public/_headers` supplies basic security headers and caching for generated assets. Before sharing, review the curated public CV, confirm that private source documents are absent from `public/` and `dist/`, run a production build, and check the routes at both desktop and mobile sizes.
