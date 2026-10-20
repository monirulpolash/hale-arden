# Hale Arden vs Telha Clarke — home page gap list (Part 1 audit)

Hale Arden's home page differs from the real Telha Clarke site in 13 places, and the six most visible are now fixed in the local code but not deployed.

Real site: https://telhaclarke.com.au (Laravel + Vite, custom elements, Tailwind v4, GSAP + ScrollTrigger, Lenis on `#app`, Taxi.js page transitions).
Ours: https://hale-arden.vercel.app (code in /home/sprite/telha-site, built by build.mjs).

How this was measured (Oct 20, 2026): both sites loaded in headless Chromium at 1440×900, 810×1080 and 390×844 (`compare/capture.mjs`, `compare/measure.mjs`). Screenshots: `compare/home-<width>/real-NN.jpg` and `hale-NN.jpg` (one per 0.8 screen of scroll, plus loader frames), side-by-side pairs in `compare/home-<width>/pairs/`. Computed type and boxes for every section: `compare/measure-<site>-<width>_.json`. Exact values come from the real site's own CSS (`/home/sprite/telha/app.css`), markup (`/home/sprite/telha/p_home.html`) and JS (`/home/sprite/telha/app.js`, `chunks/*.js`).

Rem base on both sites: `html{font-size:calc(10*(100vw/var(--size)))}` (10px at 1440, 10.55px at 810, 10.4px at 390). Ours already matches this, so every value below is in rem.

Order = how visible the difference is. Each heading says OPEN, or DONE (Part 1) when it's fixed in the local code. Nothing has been deployed: the live preview still shows the old version.

> Update Oct 20, 2026 (Part 3a, interactions): the home page fixes and the Work/project rebuild are live. The interaction parity work is tracked in the "Interactions" section at the end of this file: what Part 3a matched, and what Parts 3b (Studio + Team) and 3c (Process) still need.

---

## 1. Hero / cover: the two-stage intro is missing — DONE (Part 1)

**Real:**
- Body background is pure black `#000`. After the loader the page rests in an *intro state*: a huge white full-width wordmark (the loader logo SVG) sits at the top on black; below it the whole page `#wrapper` is a white card scaled to `1 - 4rem/100vw` and pushed down by the logo height, so a thin black frame shows on the left and right.
- Inside that card: the cover image is inset — `clip-path: inset(25vh 30vw 0)` with the inner image scaled 0.8 — so it reads as a small centred picture on white. A dark title (body-48 = 4.8rem/110%, one column of 3, `col-start-1`, top 25vh) sits at the left, and at the bottom-left a black row with `[ Scroll down ]` + the tagline.
- On the first wheel or touch scroll (`onHomeScroll`), a 1.2s `gl.fastInOut` timeline: card scale → 1 and y → 0, clip → `inset(0)`, image scale → 1, a black overlay fades to 0.9 over the logo, the logo moves up 12vh, the dark title moves down 15rem and the dark bottom row 16rem, the header turns white at about 28% of the way through (`header-light`), and the header logo letters rise in (stagger 0.02). The cover is now a full-bleed video under a black/24 overlay, with the white title at the left (body-48, top 25vh on desktop), the tagline as the h1 at `col-start-10 col-end-13` (body-20, 2rem/130%) and a `[ Scroll down ]` bracket at the bottom-left. Lenis is stopped until the intro finishes.
- Phones (the reference's `isMobile`): same card and wordmark, but the cover image is not inset; only the logo moves up 6vh and the image's parallax layer settles to scale 1.

**Hale Arden:** cover is full-bleed from the first frame; big bold "Hale Arden" (t-100, weight 700, -0.04em) bottom-left; no intro state, no wordmark band, no black frame, no expand on first scroll.

**Fix:** `build.mjs` cover markup → add `.intro-logo` (SVG wordmark of "HALE ARDEN", white), `.cover-dark` (dark title + bottom row), and wrap the page in `#wrapper`. `src/main.js` → `homeIntro()` timeline with the exact values above (clip/scale/overlay/logo/header), triggered once by wheel/touchmove/keydown/scroll; skip straight to the end state when `prefers-reduced-motion` or when arriving by page transition. `src/styles.css` → `body{background:#000}`, `#wrapper{background:#fff}`.

## 2. Typography: wrong weight and tracking everywhere — DONE (Part 1)

**Real:** one face, one weight: Europa Grotesk No2 Medium served as weight 400. `letter-spacing: normal` everywhere (the only tracking is the animated `--letter-spacing` on titles). Scale (font-size / line-height): 14/120% (uppercase labels), 16/110% (body + nav), 20/130%, 24/110%, 32/110%, 36/110%, 48/110%, 60/110%, 72/100%, 100rem-only on 404. Measured at 1440: about headline 72px/72px, Selected Works titles 100px/110px (`body-48 md:body-72 lg:body-100`; 50px at 390), cover tagline 20px/26px, labels 16px uppercase (14px on phones), body 16px/17.6px.

**Hale Arden:** Inter Tight with headings at weight **700** (the font file only covers 400–600, so the browser fakes bold), negative tracking -0.02 to -0.04em on every heading, body 14px/1.3 at weight 500. Our hero has a 54–100px bold "Hale Arden" headline that the real site doesn't have at all (the real cover's only big text is the body-48 title at the left, and the h1 is the 20px tagline).

**Fix (`src/styles.css`):** `--fw:500` for everything incl. h1–h3 (`font-weight:500`, never 600/700); delete every `letter-spacing:-…` on `.t-*` classes; `.t-14{font-size:1.4rem;line-height:1.2;text-transform:uppercase}`, `.t-16{1.6rem/1.1}`, `.t-20{2rem/1.3}`, `.t-24{2.4rem/1.1}`, `.t-32{3.2rem/1.1}`, `.t-36{3.6rem/1.1}`, `.t-48{4.8rem/1.1}`, `.t-60{6rem/1.1}`, `.t-72{7.2rem/1}`; body `font-size:1.6rem;line-height:1.1`. Inter Tight stays as the free substitute for Europa Grotesk (closest licence-free match; Europa is a paid font).

## 3. Colours — DONE (Part 1)

**Real:** `#000` text and footer, `#fff` page, one accent grey `--color-mist:#cacfcb` (used for numbers like "01", "02", the dimmed time in the header, inactive process items, footer labels). Opacity tokens `/24` and `/32` for overlays and lines.
**Hale Arden:** warm off-white `#fbfaf7` page, `#0d0d0c` ink, `rgba(...,.45)` greys.
**Fix:** `--bg:#fff; --ink:#000; --mist:#cacfcb;` replace the faded greys with `--mist`.

## 4. Header — DONE (Part 1)

**Real:** height 3.8rem, 12-col grid with page margins (2rem desktop, 1.6rem phone, 1rem gutter), items aligned to the bottom (`content-end`, `-mb-4`), body-16. Col 1–2: logo wordmark SVG, 14.5rem wide (letters rise in on load). Col 3–9: nav written as a comma list "Work, Process, Studio" (no Contact here). Col 10–11: live time at 24% opacity + city ("South Yarra, AUS"). Col 12: "Contact", right-aligned. Colour follows the section under it (white over the cover/vision, black elsewhere) via `--text-color`, not mix-blend. Phone: logo + "Menu" only; the menu is a full-screen overlay.
**Hale Arden:** fixed header with `mix-blend-mode:difference`, text logo, centred clock, 4 links on the right at 14px.
**Fix:** `build.mjs` `header()` → 12-col grid as above ("Work, Process, Studio", time + "Lisbon, PT", "Contact"); `styles.css` `.site-header{color:var(--header-color)}`; `main.js` toggles `--header-color` with ScrollTrigger on sections marked `data-dark`.

## 5. Selected Works section: wrong layout, and broken images on phones — DONE (Part 1)

**Real (`c-works`):** label row in body-14/md:body-16 uppercase: "Selected Works" left, `02` (mist) in the centre, `17 - 25'` right, 15rem below it (5.2rem on phones). Items are spaced 5.2rem (desktop) / 10rem (tablet) / 3.2rem (phone). Each project is a full-width link: the name centred in `body-48 md:body-72 lg:body-100` (100px/110px at 1440) between square brackets that sit in flex-1 columns on desktop, with a short 1px tick at each page edge on the title's centre line (0.8/1.2rem wide). The image sits 3rem up under the title in columns 4–9 at 1440 (3–10 on tablet, full on phones), fixed `height:46.4rem` on desktop and `padding-top:66%` below 1280. Under the image a body-16 row: category left, date/status right, 2rem gap. The works grid then overlaps upward by 40vh.
**Hale Arden:** left label + an alternating image/text list. **At 390 every Selected Work image renders 36×27px** because `.selected-item .media` keeps a desktop `grid-column` that collapses on the 6-column phone grid. Very visible bug.
**Fix:** rebuild `selected()` in `build.mjs`: `<a class="works-item">` → title row `[` + `<h3 class="works-item-title">Name</h3>` + `]` at 4.8/7.2/10rem with edge ticks; `.works-item-media` in `grid-column:4/10; height:46.4rem` (xl), `3/11` with `padding-top:66%` (md), `1/-1` (phone); meta row category/year.

## 6. About / Studio intro — DONE (Part 1)

**Real (`c-about`):** small crop-mark corners (four L-shaped 1px black ticks, 1.6rem / 2rem box, 0.8–1.2rem arms) at the section corners. Grid: a portrait image (ratio 120%) in col 1–2 that sticks at `top:6.2rem`; at col 7–10 the subtitle `01 Studio` (number in mist, body-14 uppercase) and a body-16 paragraph. Below: a huge offset headline (body-72 at xl, 60 lg, 48 md, 36 phone) whose first line is indented by 3 columns (`w-col-offset-3` spacer), pulled up by -5.7rem; under it a 2-line body-16 label at col 4–6 and a body-16 paragraph at col 7–10 with 15rem bottom padding.
**Hale Arden:** "(01)About" label, a 48px bold headline in col 4–12, a 20px paragraph, no image, no corner marks, no offset first line.
**Fix:** rebuild `about()` with the real grid above; add `.crop-marks` helper (four corners) in CSS.

## 7. "All Work" grid — OPEN

**Real (`c-works-grid`):** sticky, centred "All Work (31)" link in body-48/72 with a superscript count, while a loose scatter of small project images (varied sizes 45–155px wide on phones, larger on desktop) scrolls past it at different speeds (parallax). Height about 2300px on phones.
**Hale Arden:** no equivalent (a plain "View all work" link).
**Fix (Part 2):** add `worksGrid()` section: sticky title, 10–12 absolutely positioned images with `data-speed` parallax via ScrollTrigger.

## 8. Vision (dark pinned section) — OPEN

**Real (`c-vision`, 4.25 screens tall):** black/24-dimmed full-screen image behind; a sticky stage with a portrait image (ratio 130%) in the centre column, three titles on one line ("Design integrity / Innovation / Enhanced living", body-36 → lg:body-60, inactive ones at 32% opacity) that slide horizontally as you scroll, a rule line with `03` (mist) and `VISION` (body-14/16 uppercase), and three paragraphs at col 8–10 that swap as each title activates.
**Hale Arden:** values section is a static list.
**Fix (Part 2):** pinned section with a ScrollTrigger timeline (scrub) moving the titles row by one column per step and cross-fading `.vision-content`.

## 9. Process list — OPEN

**Real (`c-process`):** crop-mark corners; the six steps are one running sentence in body-36/48, separated by " / ", each with a superscript number `(01)`…`(06)` in body-20/32; inactive steps in mist, active one black; hovering/tapping a step swaps the image (one image slot, ratio about 72%, full width on phones) and its description.
**Hale Arden:** numbered stacked list.
**Fix (Part 2):** rebuild `process()` as an inline list with hover-to-swap.

## 10. Footer — OPEN

**Real:** full screen tall on desktop (`xl:h-screen`), white panel sliding over a dark reveal; col 1–5: "Talk to us about your project" (mist) + "Contact us" (underline link) in body-24/36, newsletter field with an arrow button and a 1px bottom border; col 7–8: Home/Work/Studio/Process/Contact list + "Back to top" (mist, hover black); col 10–12: address/socials; large wordmark at the bottom.
**Hale Arden:** black footer block with different columns.
**Fix (Part 2):** match the columns and white panel; keep black only for the reveal behind it.

## 11. Floating "Discover" widget — OPEN

**Real:** a sticky pill at the bottom centre (`a.widget`, body-16) that shows the current section's name and links to its page ("Discover Studio", "Discover Vision"…), driven by `data-widget-title` / `data-widget-url` on each section.
**Hale Arden:** none.
**Fix (Part 2):** add the pill + an IntersectionObserver that swaps its label and href.

## 12. Loader — OPEN

**Real:** black screen; white full-width wordmark letters rise in (`yPercent 100 → 0`); small white text top-left "Design studio / Architecture & interior", centre the location, right "Loading" + counter 0→100 over about 3s (`power2.inOut`); then the white panel fades (0.35s) and `#app` opens from the bottom (`clip-path: inset(100% 30vw 0) → inset(0)`), handing over to the intro state in gap 1.
**Hale Arden:** a light loader with a counter; no wordmark, wrong colours.
**Fix (Part 2):** reuse the intro wordmark from gap 1 as the loader logo.

## 13. Smaller details — OPEN

- Links: real underline is a 1px line that draws from left on hover (`link-underline` / `link-underline-hover`); ours fades.
- Image reveals: real images use a clip-path wipe plus 1.1→1 scale (`expo.out`, about 1.2s); ours fade up.
- Section spacing: real uses 15rem (`pb-150`) between big sections and 10rem (`mb-100`) inside them; ours uses 12rem.
- Page transitions (Taxi): black panel slide; covered in Part 3 with the inner pages.

---

## Done in Part 1 (local code only, not deployed)

Files changed: `build.mjs`, `src/main.js`, `src/styles.css`. Backups of the previous versions: `compare/styles.before-part1.css`, `compare/build.before-part1.mjs.bak`. Rebuilt with `node build.mjs` and checked locally at 1440, 810 and 390 (`compare/test-local.mjs`): no script errors, no sideways scrolling on home, Work, Studio, a project page or Contact.

- Gap 1: intro state + first-scroll expand (`homeIntro()` in `src/main.js`), using the reference's own timings from `app.js`: 1.2s `fastInOut`, overlay 0.9 over 0.6s, logo up 12vh (6vh on phones), dark title down 15rem and dark bottom row down 16rem, header turns white at about 28%, header logo letters stagger 0.02. Desktop insets the cover to `inset(25vh 30vw 0)` with inner scale 0.8; phones keep the cover full inside the scaled card. Page scroll is locked until it finishes. Checked by pixel sampling: at 1440 the intro frame now matches the real one band for band (black wordmark band at top, black side frame, white card, small centred image), and both sites show the black frame on phones. Pairs: `compare/home-1440/pairs-local/` and `compare/home-390/pairs-local/`.
- Gap 2: one weight (500) on every heading, all negative tracking removed, type scale set to the reference values.
- Gap 3: `#000` / `#fff` / mist `#cacfcb`; page background black behind the white page.
- Gap 4: 12-column header (logo col 1–2, "Work, Process, Studio" col 3–9, time at 24% + "Lisbon, PT" col 10–11, Contact col 12) at 1280px and up; logo + Menu below that. Colour switches to white over sections marked `data-dark` (cover, vision) instead of the old blend mode. The mobile menu background is now mist with black text, like the reference.
- Gap 5: Selected Works rebuilt (label row, centred 100px bracket titles with edge ticks, image col 4–9 at 46.4rem tall, category / year row). Phone images now fill the full width (357×235 at 390 instead of 36×27).
- Gap 6: About rebuilt with crop marks, sticky portrait image, `01 Studio` subtitle, 3-column offset headline and the label / lead row.

Still not checked: real phones and tablets, Safari and Firefox. The new home sections have not been compared screenshot by screenshot below the About section, only measured.

## What part 2 should fix first

1. All Work sticky grid (gap 7) and the Discover widget (gap 11) — both are signature moments users notice right after the hero.
2. Vision pinned section (gap 8) and the Process sentence list (gap 9).
3. Loader wordmark (gap 12) and footer (gap 10).
4. Then the inner pages (Work, Studio, Process, Contact, project detail) section by section with the same scripts: `node compare/capture.mjs <page> <width>` and `node compare/measure.mjs <width> real|hale <path>`.

---

## Interactions (Part 3a, Oct 20, 2026): Home + Work page

Paul's ask: every text interaction, card animation, hover and scroll effect the same as Telha Clarke. Part 3a covers the desktop nav after the preloader, the home Selected Work section, the Work page card hover and the Work page list hover. Everything was measured in headless Chromium (simulated browser), side by side against telhaclarke.com.au, with `compare/t4.mjs` (header + Selected Work), `compare/t5.mjs` (Work card + list) and `compare/t6.mjs` (phone regression). Not checked on a real device or by eye on a real phone.

### DONE (Part 3a) — 1. Desktop nav after the preloader
Source: `app.js` loader `initAnimations` / `onHomeScroll`, `detectDarkSections`, header `setActiveLink`, `.list-o` CSS.
- The header is now visible (with its items masked) during the home load on desktop, like the reference, where the header lives inside the clipped app. Before, it was hidden until the loader finished and then popped in.
- Links, time, location and Contact sit at `yPercent:100` in overflow-hidden masks and rise in at the reference "reveal-content" moment (0.6s into the cover settle), `expo.out` 1.2s, 0.05s stagger, each link separately.
- The link group starts parked at the left margin (where the logo will be): `x = logo.left - links.left` (-235px at 1440 on both sites). On the first scroll it slides to its column with the logo letters (logo `yPercent 120 -> 0`, 1s, 0.02 stagger), `fastInOut` 1.2s. Measured 0.4s after the wheel: reference -31px, ours -29px; both 0 after 2s.
- Header turns white at 28% of the intro (0.34s) with its 0.45s colour transition. Before, an `.is-intro` rule held it black until the whole intro finished (1.2s). At +0.4s the reference reads rgb(111) mid-fade, ours rgb(141).
- Light/dark switch over dark sections uses the reference offsets: `start: top-=3rem top`, `end: bottom-=3rem top`.
- Hover: hovering one link dims the others to .52 (.24 on a dark header); the hovered link stays 1; the current page link stays full and the rest dim (exact URL match). Old underline hover removed from nav and Contact; Contact hover is the reference's instant .24.
- Links are `Work,` `Process,` `Studio` with the comma inside the link and 0.6rem gap, as on the reference.

### DONE (Part 3a) — 2. Home Selected Work (scroll-driven, desktop >= 1200px only, as on the reference)
Source: `chunks/Works-BGiIIN-8.js` (`c-works`).
- Enter timeline (`top bottom -> top 10%`, scrub 0.1): brackets open to `xPercent ∓90`, title letter-spacing 0 -> .04em, image frame scale .4 -> 1, photo scale 1.75 -> 1.
- Leave timeline (`top top -> bottom top`, scrub 0.1): everything reverses; the block sinks 35rem, the frame shrinks to .2 and rises 40%; category and date slide out (`yPercent -100`, 0.8s expo.out) and slide back in when you scroll back up (from 100, 1.1s expo.out).
- Added the `.works-item-wrapper` the reference animates; category/date are now in an overflow mask.
- Removed our own bracket hover (the reference has none) and our phone scale effect (the reference keeps phones static below 1200px).
- Measured at 7 scroll positions (item top at 100%, 60%, 30%, 10%, 0, -30%, -60% of the screen) on both sites: letter-spacing, bracket xPercent, frame scale, photo scale, wrapper y and image-wrapper y matched at each position.

### DONE (Part 3a) — 3. Work page card hover (desktop >= 1280px, hover devices)
Source: `p_works.html` `card-work` markup + `chunks/FollowMouse-DfeGA_ze.js` + `Mousemove`.
- Photo sits at scale 1.05 and eases to 1 while the pointer is over the image (0.7s `cubic-bezier(.23,1,.32,1)`); the meta text alone doesn't zoom it, as on the reference.
- Black wash 0 -> .24 over the image.
- Follow-mouse preview: a 12.5rem × 121% image trails the cursor 2rem right / 2.5rem below it (`quickTo` 0.6s expo.out), scales in 0 -> 1 with the photo 1.8 -> 1 (0.8s expo.out), scales out on leave (0.6s), and switches to the next project image every 7.5vw of mouse travel. Measured box relative to the card: 228,303 125×151 on both sites; after a 144px move both at 372,323.
- Category and date slide up 100% to reveal "Open project" and the arrow (0.7s, date 75ms later), with the same arrow SVG.
- Card ratios now follow the reference: half-width pairs alternate 100% / 66%, thirds are square, the full-width card is 16:9 (695×695 first card on both sites).
- Cursor is the normal pointer on both sites (the reference has no custom cursor on Work).

### DONE (Part 3a) — 4. Work page list view hover
Source: `list-works-item` markup.
- Note: the reference's list preview does NOT follow the cursor. It's a fixed 125% image in grid columns 8–9, centred on the row, shown instantly on hover. Ours now does the same.
- Row hover: background #952c16, text white, instant (no transition), as on the reference.
- Columns: Project / Typology / Type / Location / Date (3/3/3/2/1 of 12, Location -3rem right), header row with mist bottom border, rows 0.8rem / 0.5rem padding. Measured: row 1440×38, preview image at x 970, 216×270, vertically centred, identical on both sites.
- Ours fills Type with the project status (Completed / In progress), because our CMS has no second category; the reference repeats its typology there.

### Still differs on Home/Work (not in Part 3a)
- Work page grid/list switch animation and the filter animation (`PageWorks` chunk: `onTermEnter/Leave`, grid fade) are still our simpler versions.
- The follow-mouse preview cycles 4 images per project (gallery + cover); the reference has 5 because it has more photos.
- Mobile header toggler reveal on home (reference: `yPercent 100 -> 0` at 0.25s of the intro) isn't replicated.
- Non-home pages: header still fades in after the loader instead of the masked item reveal.

### For Part 3b — Studio page + Team section
Reference markup `p_studio.html`, components: `c-cover-about` (`chunks/CoverAbout-CcM4pzVi.js`), `c-stack-cards` ×2 (`chunks/StackCards-D2uTrpLS.js`), `c-team` (`chunks/Team-Bzbnn-um.js`), `c-awards` (`chunks/Awards-B7I0GJTi.js`), `c-split-reveal` ×6, `c-video-player` ×4, `c-parallax`, `c-loading-image` ×6, `c-pinnable-element`.
- Stack cards (desktop only): each card pins at `top = 6rem + 8rem × index`, container height = sum of card heights, last-card scroll offset, inner `--top-offset` / `--card-height` CSS vars.
- Team: built as its own component with its own scroll/hover behaviour; ours is a plain grid. Needs a full read of `Team-Bzbnn-um.js` and the `c-team` markup.
- Awards list, split-text reveals on every heading (`revealTitle` on wrapped lines), video players, parallax image.
- Studio still has the old Hale Arden layout (see the mobile repair job notes).

### For Part 3c — Process page
Reference markup `p_process.html`, components: `c-cover-manifesto` (title lines `yPercent 100` revealed with `revealTitle`, then class `a` at 40%), `c-values-vision` (`chunks/ValuesVision-BzIAJzYy.js`: values image inner parallax `yPercent -15 -> 15` scrubbed, cards pinned with offsets, last card image group `yPercent 15` on leave), `c-stack-vision` (`chunks/StackVision-DAuAPXr8.js`), `c-split-reveal` ×4, `c-loading-image` ×2, `c-pinnable-element`.
- Process still has the old Hale Arden layout.
