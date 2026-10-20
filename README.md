# Hale Arden — architecture & interiors template

A minimal editorial studio site, built as a structural study of a public architecture website and as the coded preview for a Framer template. All branding, copy, projects, typography and images here are original placeholders.

## Pages
- `/` home: cover, about, three selected projects, all-work grid, pinned vision section, process rows
- `/works/` project index: category filter, list and grid views, hover image that follows the cursor (desktop)
- `/work/<slug>/` project page: title and details table, full-width images, image pair, quote, next project
- `/studio/` intro, team list with hover portrait, values, awards and press tables
- `/process/` four stacked sticky cards
- `/contact/` details and enquiry form (demo only, nothing is sent)

## How it works
- `src/data.mjs` holds every piece of content. Edit it to change projects, team, awards or copy.
- `build.mjs` renders each page to `dist/` and bundles `src/main.js` with esbuild.
- `src/styles.css`: fluid rem (1rem = 10px at 375, 768, 1024 and 1440 wide), 6-column grid on phones and 12 columns from 768px, one typeface (Inter Tight 500).
- `src/main.js`: Lenis smooth scroll, GSAP ScrollTrigger reveals, a first-visit loader, Taxi page transitions, and the scroll pieces (parallax, full-width image open, pinned vision, stack cards, footer reveal).
- Images and the font are hosted on a public bucket (`b468214e2f9f.blob.upstash.io`).

## Run it
```
npm install
npm run build
npx serve dist
```

Reduced-motion users get no loader, no transitions and no scroll animation.
