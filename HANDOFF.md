# Handoff: page transition keeps the old scroll position

Written 2026-09-20. Point a new chat at this file to pick up where the last
one stopped. Nothing in the repo has been changed yet: the bug is diagnosed,
the fix is not applied.

## The bug

Clicking an internal link runs the page transition, and the new page comes
in at the scroll position of the page that was left instead of at the top.
Reported on Event Designs, Landscaping, Plant Rental and Maintenance.

## Root cause (confirmed in headless Chromium)

The scroll to top does happen. Lenis undoes it one frame later.

1. Next's router scrolls the document to the top when the new route commits
   (`htmlElement.scrollTop = 0` in
   `node_modules/next/dist/client/components/layout-router.js`).
2. Lenis is still in its easing tail from the last wheel input. While
   `isScrolling === "smooth"` it ignores native scroll changes
   (`onNativeScroll` in `node_modules/lenis/dist/lenis.mjs`) and on its next
   animation frame writes its own eased position back.
3. The new page's ScrollTriggers are then created, refreshed and snapshotted
   at that old position, so the card slides in already scrolled down.

Instrumented log from the repro, landscaping -> maintenance:

```
6364ms HTML.scrollTop=0 from 1508      <- Next
6368ms scrollTo(1507) from 0           <- Lenis.setScroll, 4ms later
6506ms scrollTo(0) from 1507           <- ScrollTrigger.refresh reverting
6509ms scrollTo(1507) from 0           <- ScrollTrigger.refresh restoring
```

Final state: `/maintenance y=1505`.

## Why it looks page specific (it is not)

The header hides on scroll-down, so reaching any nav link means scrolling up
a little first and then clicking. With `lerp: 0.07` Lenis keeps easing for
well over a second after the wheel stops, so the click nearly always lands
inside that window. The same flow keeps the scroll on /works too
(`/works y=1507`). When the repro waited for Lenis to settle before
clicking, every page landed at `y=0`. The four service pages are simply the
links reached this way most often.

## The fix (not applied yet)

In `initPageTransitions` in `src/scripts/custom.js`, the transition swallows
new wheel/touch/key input during a visit but never halts the easing already
in flight. In `onRouteChange` (around line 1466), for the link case only
(`fromLink` true), before the state classes are added:

```js
lenis?.scrollTo(0, { immediate: true, force: true });
```

Why there:

- It runs from the layout effect in `src/components/PageTransition.js`,
  before `initSite()` boots the new page's scripts, so triggers are created
  and measured at the top and mid-page reveals do not fire while the page is
  still hidden.
- `immediate` resets Lenis's internal `animatedScroll`/`targetScroll`, so
  nothing is left to write back. Next's own scroll becomes a no-op.
- Must not run for back/forward: `release()` already restores
  `pendingScroll` for the `is-popstate` case with the same call. The two
  paths end up consistent.

After applying, rerun the repro below for landscaping -> maintenance and
landscaping -> works with the short wait, and check back/forward still
restores the saved position.

## Separate thing to check by hand

On the home page's stacked service cards (`.services-stack`), hit-testing at
the centre of the LEARN MORE button returned `IMG.parallax-image` instead of
the link, and the click did nothing in headless Chromium at that scroll
position (scrollY 2800, second slide covering the pinned first). Could be a
headless or 3D-transform hit-testing quirk (`.service-card` uses
`transform-style: preserve-3d` with a scrubbed `rotationX`). Verify in a
real browser before treating it as a bug.

## Relevant code

- `src/scripts/custom.js`
  - `initSmoothScroll` (~line 42): Lenis, `lerp: 0.07`, driven by GSAP's ticker
  - `initPageTransitions` (~line 1305): `leave`, `onRouteChange`, `release`,
    `onPopState`, per-entry scroll saved in `history.state.ptScroll`
  - `initSite` (~line 1744): boots everything; cleanup kills all ScrollTriggers
- `src/components/PageTransition.js`: layout effect -> `onRouteChange`,
  passive effect -> `onRouteReady` -> `document.fonts.ready` -> `release`
- `src/components/SiteScripts.js`: reruns `initSite()` on every pathname change
- `src/styles/custom.css`: "Page transitions" section (~line 1281),
  durations `--pt-leave-ms` 550, `--pt-slide-ms` 650, `--pt-grow-ms` 550

## Project rules

- Next.js 16.3.4 with breaking changes versus older versions: read the
  relevant guide in `node_modules/next/dist/docs/` before writing code
  (see AGENTS.md).
- No Tailwind. All CSS goes in `src/styles/custom.css`, all JS and animation
  in `src/scripts/custom.js`. Match the existing comment style.
- Headless WordPress CMS at rap.mydemobb.com (SCF + WPGraphQL).

## Repro recipe

Dev server on http://localhost:3000. Playwright lives in the npx cache, not
the repo. Save the script below as `repro.js` outside the project and run:

```
NODE_PATH="C:/Users/Kar Ming/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules" node repro.js landscaping maintenance 2500 150
```

Pass slugs without a leading slash: Git Bash rewrites `/landscaping` into
`C:/Program Files/Git/landscaping`.

```js
// repro.js <startSlug> <targetSlug> <settleMs> <upWaitMs>
// upWaitMs 150 = click while Lenis is still easing (bug), 3000 = settled (fine)
const { chromium } = require("playwright");
(async () => {
  const [start = "", slug = "landscaping", settle = "2500", upWait = "150"] = process.argv.slice(2);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.__log = [];
    const t0 = performance.now();
    const short = () => (new Error().stack || "").split("\n").slice(2, 6)
      .map((s) => s.trim().replace(/^at /, "")).join(" | ");
    const orig = window.scrollTo.bind(window);
    window.scrollTo = function (...a) {
      const y = typeof a[0] === "object" ? a[0].top : a[1];
      if (Math.round(y) !== Math.round(window.scrollY))
        window.__log.push(`${(performance.now() - t0).toFixed(0)}ms scrollTo(${Math.round(y)}) from ${Math.round(window.scrollY)} :: ${short()}`);
      return orig(...a);
    };
    const d = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop");
    Object.defineProperty(Element.prototype, "scrollTop", {
      get: d.get,
      set(v) {
        window.__log.push(`${(performance.now() - t0).toFixed(0)}ms ${this.tagName}.scrollTop=${v} from ${Math.round(window.scrollY)} :: ${short()}`);
        return d.set.call(this, v);
      },
    });
  });
  await page.goto("http://localhost:3000/" + start, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.mouse.move(700, 450);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(30); }
  await page.waitForTimeout(+settle);
  await page.mouse.wheel(0, -300); // the header hides on scroll-down: bring it back
  await page.waitForTimeout(+upWait);
  const box = await page.locator(`.site-header a[href="/${slug}"]`).first().boundingBox();
  await page.evaluate(() => window.__log.push("---- CLICK ----"));
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const frames = await page.evaluate(() => new Promise((res) => {
    const out = []; const t0 = performance.now(); let last = "";
    const tick = () => {
      const s = `${location.pathname} y=${Math.round(window.scrollY)} html=[${document.documentElement.className}]`;
      if (s !== last) { out.push(`${(performance.now() - t0).toFixed(0)}ms ${s}`); last = s; }
      if (performance.now() - t0 < 4000) requestAnimationFrame(tick); else res(out);
    };
    tick();
  }));
  console.log(frames.join("\n"));
  const log = await page.evaluate(() => window.__log);
  console.log(log.slice(log.indexOf("---- CLICK ----")).join("\n"));
  await browser.close();
})();
```

Pass: the last frame line reads `/<target> y=0`.
