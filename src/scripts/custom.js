/* ==========================================================================
   Rent-A-Pot — global client-side script
   Lenis smooth scroll + GSAP + ScrollTrigger setup.
   Only ever runs in the browser (called from <SiteScripts /> after mount).
   ========================================================================== */

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import EmblaCarousel from "embla-carousel";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// iOS Safari resizes the window every time its toolbars slide in or out
// while scrolling. Each resize would refresh every trigger mid-scroll and
// jump the pinned cards; layout uses svh, which does not move, so ignore it.
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis = null;
let tick = null;
let sliders = [];

// Elements on the live page only. While a page transition runs, a clone of
// the previous main sits in .pt-ghost (see initPageTransitions) and nothing
// here may bind to it, or the new page would pin, split and slide the ghost.
const live = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector)).filter((el) => !el.closest(".pt-ghost"));

/* --------------------------------------------------------------------------
   Lenis + ScrollTrigger sync
   -------------------------------------------------------------------------- */
export function initSmoothScroll() {
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    autoRaf: false, // driven from GSAP's ticker below so both share one rAF
  });

  // Keep ScrollTrigger in sync with Lenis' virtual scroll position
  lenis.on("scroll", ScrollTrigger.update);

  tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroySmoothScroll() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
  tick = null;
}

export function getLenis() {
  return lenis;
}

/* --------------------------------------------------------------------------
   Header
   Hides .site-header when scrolling down past HIDE_AFTER px and brings it
   back on any scroll up (or when back near the top). Listens to Lenis so
   direction is reliable through the smoothed scroll.
   -------------------------------------------------------------------------- */
export function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header || !lenis) return () => {};

  const HIDE_AFTER = 120;
  const onScroll = ({ scroll, direction, velocity }) => {
    // The hamburger lives in the header: keep it on screen while the menu is open
    if (document.documentElement.classList.contains("menu-open")) return;
    if (scroll < HIDE_AFTER) {
      header.classList.remove("is-hidden");
      return;
    }
    // A jump (back/forward restore, anchor) has no velocity and direction
    // is whatever the last real scroll left behind: never react to it
    if (velocity === 0) return;
    if (direction === -1) {
      header.classList.remove("is-hidden");
    } else if (direction === 1) {
      header.classList.add("is-hidden");
    }
  };
  lenis.on("scroll", onScroll);

  return () => {
    lenis?.off("scroll", onScroll);
    header.classList.remove("is-hidden");
  };
}

/* --------------------------------------------------------------------------
   Embla sliders
   Any element with the .embla class becomes a slider.
   Markup: .embla > .embla__viewport > .embla__container > .embla__slide
   Per-slider options can be passed as JSON in data-embla-options.

   Progress pagination: add an empty .embla__dots inside the .embla and it is
   filled with one dot per slide. The active dot stretches into a pill whose
   bar fills over the autoplay duration; when it completes the slider moves on
   and the next dot takes over. Dragging pauses the bar; clicking a dot jumps.
   Autoplay duration in ms via data-embla-autoplay on the .embla (default 5000).
   -------------------------------------------------------------------------- */
function initProgressDots(root, embla) {
  const dotsWrap = root.querySelector(".embla__dots");
  if (!dotsWrap) return () => {};

  const autoplayMs = parseInt(root.dataset.emblaAutoplay, 10) || 5000;
  const count = embla.scrollSnapList().length;

  dotsWrap.innerHTML = "";
  const dots = [];
  const bars = [];
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "embla__dot";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    const bar = document.createElement("span");
    bar.className = "embla__dot-bar";
    dot.appendChild(bar);
    dot.addEventListener("click", () => embla.scrollTo(i));
    dotsWrap.appendChild(dot);
    dots.push(dot);
    bars.push(bar);
  }

  let progress = null;
  let pausedByDrag = false;

  const start = () => {
    const i = embla.selectedScrollSnap();
    progress?.kill();
    dots.forEach((d, n) => d.classList.toggle("is-active", n === i));
    // Drain the other bars while their pills shrink instead of snapping empty
    gsap.to(
      bars.filter((_, n) => n !== i),
      { scaleX: 0, duration: 0.4, ease: "power2.out" }
    );
    gsap.set(bars[i], { scaleX: 0 });
    progress = gsap.to(bars[i], {
      scaleX: 1,
      duration: autoplayMs / 1000,
      ease: "none",
      onComplete: () => embla.scrollNext(),
    });
  };

  const onPointerDown = () => {
    if (progress?.isActive()) {
      progress.pause();
      pausedByDrag = true;
    }
  };
  const onSettle = () => {
    if (pausedByDrag) {
      pausedByDrag = false;
      progress?.resume();
    }
  };
  const onSelect = () => {
    pausedByDrag = false;
    start();
  };

  embla.on("select", onSelect);
  embla.on("pointerDown", onPointerDown);
  embla.on("settle", onSettle);
  start();

  return () => {
    progress?.kill();
    embla.off("select", onSelect);
    embla.off("pointerDown", onPointerDown);
    embla.off("settle", onSettle);
    dotsWrap.innerHTML = "";
  };
}

export function initSliders() {
  live(".embla").forEach((root) => {
    const viewport = root.querySelector(".embla__viewport");
    if (!viewport) return;

    let options = { loop: true };
    if (root.dataset.emblaOptions) {
      try {
        options = { ...options, ...JSON.parse(root.dataset.emblaOptions) };
      } catch {
        console.warn("Invalid data-embla-options JSON on", root);
      }
    }

    const embla = EmblaCarousel(viewport, options);

    root.querySelector(".embla__prev")?.addEventListener("click", () => embla.scrollPrev());
    root.querySelector(".embla__next")?.addEventListener("click", () => embla.scrollNext());

    const destroyDots = initProgressDots(root, embla);

    sliders.push({
      embla,
      destroy: () => {
        destroyDots();
        embla.destroy();
      },
    });
  });
}

export function destroySliders() {
  sliders.forEach((s) => s.destroy());
  sliders = [];
}

export function getSliders() {
  return sliders.map((s) => s.embla);
}

/* --------------------------------------------------------------------------
   Parallax
   Any .has-parallax container: every .parallax-image inside drifts vertically
   while the container travels through the viewport. Scrub is tied directly to
   scroll position; Lenis already smooths the scroll, so the motion is fluid
   without adding a second lag on top.
   Optional data-parallax-speed on the container (default 1).
   -------------------------------------------------------------------------- */
export function initParallax() {
  return gsap.context(() => {
    live(".has-parallax").forEach((container) => {
      const images = container.querySelectorAll(".parallax-image");
      if (!images.length) return;

      const speed = parseFloat(container.dataset.parallaxSpeed) || 1;
      // Image is 120% tall, so ±8.33% of its own height keeps it fully covered
      const shift = 8.33 * speed;

      // If the container lives inside something ScrollTrigger pins, name that
      // ancestor with data-parallax-pinned so positions account for the pin.
      const pinnedContainer = container.closest("[data-parallax-pinned]") || undefined;

      // If the container's own size/position changes (e.g. slider cards),
      // data-parallax-trigger names a stable ancestor to measure against so a
      // ScrollTrigger refresh doesn't shift the image.
      const trigger =
        (container.dataset.parallaxTrigger &&
          container.closest(container.dataset.parallaxTrigger)) ||
        container;

      gsap.fromTo(
        images,
        { yPercent: -shift },
        {
          yPercent: shift,
          ease: "none",
          force3D: true, // stays on the compositor between frames (Safari repaints otherwise)
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
            pinnedContainer,
          },
        }
      );
    });
  });
}

/* --------------------------------------------------------------------------
   Flatten
   Add data-flatten to a block with rounded bottom corners. As its bottom edge
   scrolls up from the viewport bottom to 55% of the viewport, the bottom radii
   scrub to 0 so it squares off against the next section. Reverses on the
   way back. The starting radius comes from CSS, nothing is hardcoded here.
   -------------------------------------------------------------------------- */
export function initFlatten() {
  return gsap.context(() => {
    live("[data-flatten]").forEach((el) => {
      gsap.to(el, {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "bottom bottom",
          end: "bottom 55%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Stacked cards (services)
   Markup: .services-stack > .service-slide > .service-pin > .service-card
   Each slide is 100svh. When a slide's top hits the viewport top, its
   .service-pin is pinned for another viewport height while the next slide
   scrolls over it. During the pin the card scales down and tilts back a
   little (scrubbed), then fades out once it has scrolled well above the
   viewport. The last slide is not pinned so there is no dead scroll at the
   end. Ported from madewithgsap effect 031 minus the random Z rotation.
   -------------------------------------------------------------------------- */
export function initStackCards() {
  return gsap.context(() => {
    const slides = live(".services-stack .service-slide");

    slides.forEach((slide, i) => {
      const pin = slide.querySelector(".service-pin");
      const card = slide.querySelector(".service-card");
      if (!pin || !card) return;
      if (i === slides.length - 1) return;

      // The pin distance must equal one slide, so an unpinned card lands
      // exactly under the slide that covered it. The slides are 100svh; on
      // phones window.innerHeight is the taller, toolbars-hidden viewport,
      // and pinning for that pushed the cards down over the next section.
      gsap.to(card, {
        scale: 0.9,
        rotationX: 12,
        ease: "power1.in",
        force3D: true,
        scrollTrigger: {
          trigger: slide,
          pin,
          start: "top top",
          end: () => "+=" + slide.offsetHeight,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      gsap.to(card, {
        autoAlpha: 0,
        ease: "power1.in",
        scrollTrigger: {
          trigger: card,
          start: "top -80%",
          end: () => "+=" + 0.2 * slide.offsetHeight,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Lines
   Add data-line to an element whose ::before is a rule scaled by --line-scale
   (see .service-meta in custom.css). The rule draws from left to right when
   it enters the viewport, once. If the element sits low inside a larger block,
   set data-line-trigger to a selector for that block (closest ancestor) so
   the draw is timed to the block arriving instead, and data-line-start to a
   ScrollTrigger start (e.g. "bottom 105%") for when in that block's travel.
   -------------------------------------------------------------------------- */
export function initLines() {
  return gsap.context(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    live("[data-line]").forEach((el) => {
      if (reduced) {
        gsap.set(el, { "--line-scale": 1 });
        return;
      }
      const trigger = (el.dataset.lineTrigger && el.closest(el.dataset.lineTrigger)) || el;
      const start = el.dataset.lineStart || "top 90%";
      gsap.to(el, {
        "--line-scale": 1,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger, start, once: true },
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Projects slider (looped)
   Markup: .home-projects > .projects-slider > .projects-track > .project-slide
   The first slide in the DOM is always the main (wide) one; the rest are
   small. The track never moves.

   Next: the main card is cloned as a ghost that slides off to the left and
   shrinks, the real node is moved to the end of the queue, and GSAP Flip
   animates the remaining cards from their old to new size/position, so the
   second card grows into the main slot. Flip runs in absolute mode so a
   card changing width can't shove its siblings around mid-animation.
   Prev: the last card is moved to the front as main and slides in from the
   left while Flip shifts the others right and shrinks the old main.

   Controls: drag/swipe (pointer events), click a small card, or the arrow box
   of the Button in .projects-actions.
   Autoplays every 4.5s while in view (data-autoplay="ms" on .projects-slider
   to change, 0 to disable); any manual change restarts the countdown.
   -------------------------------------------------------------------------- */
export function initProjectsSlider() {
  const cleanups = [];

  live(".projects-slider").forEach((root) => {
    const section = root.closest(".home-projects") || root;
    const track = root.querySelector(".projects-track");
    if (!track || track.children.length < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 0 : 1.1;
    const EASE = "power3.inOut";
    let animating = false;

    const slides = () => gsap.utils.toArray(".project-slide", track);
    const gapPx = () => parseFloat(getComputedStyle(track).gap) || 0;

    // Flip the cards plus their media and caption so aspect ratio, radius
    // and caption position all animate instead of snapping with the class.
    const flipTargets = (cards) =>
      cards.flatMap((c) => [
        c,
        c.querySelector(".project-media"),
        c.querySelector(".project-caption"),
      ]);
    const FLIP = { absolute: true, nested: true, props: "borderRadius", ease: EASE };

    const finish = () => {
      animating = false;
      ScrollTrigger.refresh();
      schedule();
    };

    // Autoplay: advance every AUTOPLAY_MS while the slider is in view. Any
    // manual change restarts the countdown (via finish -> schedule).
    const AUTOPLAY_MS = parseInt(root.dataset.autoplay, 10) || 4500;
    let inView = false;
    let timer = null;
    const schedule = () => {
      timer?.kill();
      timer = null;
      if (!inView || AUTOPLAY_MS <= 0) return;
      timer = gsap.delayedCall(AUTOPLAY_MS / 1000, () => next());
    };
    const inViewTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        inView = self.isActive;
        schedule();
      },
    });

    const next = () => {
      if (animating) return;
      animating = true;

      const all = slides();
      const main = all[0];
      const others = all.slice(1);
      const mainW = main.offsetWidth;
      const smallW = others[0].offsetWidth;
      const rootRect = root.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();

      // Ghost of the outgoing main card: exits left while shrinking
      const ghost = main.cloneNode(true);
      ghost.classList.add("is-ghost");
      ghost.removeAttribute("data-text-reveal");
      gsap.set(ghost, {
        position: "absolute",
        left: mainRect.left - rootRect.left,
        top: mainRect.top - rootRect.top,
        width: mainW,
        pointerEvents: "none",
        zIndex: 0,
      });
      root.appendChild(ghost);
      gsap.to(ghost, {
        x: -(smallW + gapPx()) - (mainRect.left - rootRect.left),
        width: smallW,
        duration: DURATION,
        ease: EASE,
        onComplete: () => ghost.remove(),
      });

      // Real node joins the back of the queue as a small card. It stays
      // hidden while the others animate (they're absolute during the Flip,
      // so it would otherwise sit at the front of the flow) and fades in
      // in place afterwards.
      const state = Flip.getState(flipTargets(others), { props: "borderRadius" });
      main.classList.remove("is-main");
      track.appendChild(main);
      others[0].classList.add("is-main");
      gsap.set(main, { autoAlpha: 0 });

      Flip.from(state, {
        ...FLIP,
        duration: DURATION,
        onComplete: () => {
          gsap.to(main, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
          finish();
        },
      });
    };

    const prev = () => {
      if (animating) return;
      animating = true;

      const all = slides();
      const main = all[0];
      const last = all[all.length - 1];
      const others = all.slice(0, -1);
      const mainW = main.offsetWidth;

      const state = Flip.getState(flipTargets(others), { props: "borderRadius" });
      main.classList.remove("is-main");
      last.classList.add("is-main");
      track.prepend(last);

      Flip.from(state, { ...FLIP, duration: DURATION, onComplete: finish });
      gsap.fromTo(
        last,
        { x: -(mainW + gapPx()), autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: DURATION, ease: EASE }
      );
    };

    // Clicking a small card advances, one hop per card, until it is main
    let pendingHops = 0;
    let hopTimer = null;
    const runHops = () => {
      if (pendingHops <= 0) return;
      if (animating) {
        hopTimer = setTimeout(runHops, 60);
        return;
      }
      pendingHops--;
      next();
      hopTimer = setTimeout(runHops, 60);
    };
    const onSlideClick = (e) => {
      const slide = e.target.closest(".project-slide");
      if (!slide || slide.classList.contains("is-main")) return;
      e.preventDefault();
      pendingHops = slides().indexOf(slide);
      runHops();
    };
    track.addEventListener("click", onSlideClick);

    // The arrow box of the header's Button doubles as the slider's next
    // control; the pill itself stays a normal link.
    const nextBtn = section.querySelector(".projects-actions .custom-button .button-arrow");
    const onNext = (e) => {
      e.preventDefault();
      next();
    };
    nextBtn?.addEventListener("click", onNext);

    // Swipe: measure total pointer travel between press and release.
    // Horizontal travel past SWIPE_PX wins; mostly-vertical movement is left
    // to the page scroll. A click right after a swipe is swallowed.
    const SWIPE_PX = 40;
    let press = null;
    let swiped = false;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      press = { x: e.clientX, y: e.clientY };
      swiped = false;
    };
    const onPointerUp = (e) => {
      if (!press) return;
      const dx = e.clientX - press.x;
      const dy = e.clientY - press.y;
      press = null;
      if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
      swiped = true;
      if (dx < 0) next();
      else prev();
    };
    const onClickCapture = (e) => {
      if (!swiped) return;
      swiped = false;
      e.preventDefault();
      e.stopPropagation();
    };
    // Native image/link drag would capture the pointer and kill the swipe
    const onDragStart = (e) => e.preventDefault();

    root.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    root.addEventListener("click", onClickCapture, true);
    root.addEventListener("dragstart", onDragStart);

    cleanups.push(() => {
      timer?.kill();
      inViewTrigger.kill();
      clearTimeout(hopTimer);
      root.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("click", onClickCapture, true);
      root.removeEventListener("dragstart", onDragStart);
      track.removeEventListener("click", onSlideClick);
      nextBtn?.removeEventListener("click", onNext);
      root.querySelectorAll(".is-ghost").forEach((g) => g.remove());
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/* --------------------------------------------------------------------------
   Wipe reveal
   Add data-wipe to an element and it is uncovered left to right (clip-path)
   once when it enters the viewport, like being drawn in. data-wipe="var"
   animates a --wipe property instead, for ::after artwork (.squiggle). Options:
   data-wipe-delay="0.5" seconds, data-wipe-trigger=".selector" (closest
   ancestor to time it from), data-wipe-start="top 90%".
   -------------------------------------------------------------------------- */
export function initWipes() {
  return gsap.context(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    live("[data-wipe]").forEach((el) => {
      // data-wipe="var": drive a --wipe custom property (for ::after art such
      // as .squiggle) instead of clipping the element itself.
      const useVar = el.dataset.wipe === "var";
      const shown = useVar ? { "--wipe": "0%" } : { clipPath: "inset(0 0% 0 0)" };
      // For var mode inside split text, set the property on the split heading
      // (never replaced by SplitText) and let the word inherit it.
      const target = (useVar && el.closest("[data-text-reveal]")) || el;
      if (reduced) {
        gsap.set(target, shown);
        return;
      }
      // Explicit start so GSAP doesn't read the unset property as 0
      if (useVar) gsap.set(target, { "--wipe": "100%" });
      const trigger = (el.dataset.wipeTrigger && el.closest(el.dataset.wipeTrigger)) || el;
      gsap.to(target, {
        ...shown,
        duration: 1.1,
        ease: "power2.inOut",
        delay: parseFloat(el.dataset.wipeDelay) || 0,
        scrollTrigger: { trigger, start: el.dataset.wipeStart || "top 90%", once: true },
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Editor content
   HTML from the WordPress editor (.blog-content on a blog post) has no
   data-* hooks, so stamp the text reveal on it before initTextReveal runs:
   headings lift, everything else reveals per line. Attributes already set
   by hand are left alone.
   -------------------------------------------------------------------------- */
export function initEditorContent() {
  live(".blog-content").forEach((root) => {
    root.querySelectorAll("h2, h3, h4, h5").forEach((el) => {
      if (!el.hasAttribute("data-text-reveal")) el.setAttribute("data-text-reveal", "lift");
    });
    root.querySelectorAll("p, li, blockquote, figcaption").forEach((el) => {
      if (!el.hasAttribute("data-text-reveal")) el.setAttribute("data-text-reveal", "");
    });
  });
}

/* --------------------------------------------------------------------------
   Text reveal
   Add data-text-reveal to any text element. Each line is wrapped in a
   clipping mask; the pieces rise out of it slightly rotated and scaled from
   their bottom-left corner, so the edge reads as a diagonal cut before it
   settles flat. Fades in at the same time.

   data-text-reveal            -> per line   (body copy)
   data-text-reveal="words"    -> per word
   data-text-reveal="chars"    -> per character, still masked by line
   data-text-reveal="lift"     -> per line, straight rise, no rotation (headings)
   data-text-reveal="blur"     -> per word, soft blur-to-sharp drift, no mask
   data-text-reveal="shuffle"  -> per character, straight rise, random order
   data-text-reveal="smog"     -> per character, blur + fade sweep left to right
   data-text-reveal="wipe"     -> per line, clip edge sweeps left to right
   data-text-reveal="flip"     -> per letter swing in, once, line by line
   data-text-reveal-delay="0.4" -> seconds to hold before starting (sequencing)
   data-text-reveal-start="top 100%" -> ScrollTrigger start override (default
   "top 90%", flip uses "top 92%"); use it for elements at the very end of
   the page that never reach the default line.

   A sibling placed right before the element and marked data-inline-pop (see
   .history-image) is a picture slot: after the lift, the first line slides
   right by the slot width plus its margin-right to open a gap, and the
   picture pops up out of it with a scale + rise bounce.

   Masks get extra clip room for ascenders/descenders in custom.css, which is
   why the yPercent starts are above 100: the piece must begin fully below
   the padded clip region or its top would peek through early.

   Re-splits automatically on resize. Waits for fonts so line breaks are right.
   -------------------------------------------------------------------------- */
const TEXT_REVEAL_MODES = {
  // Angled: rises out of a mask slightly rotated + scaled (diagonal cut edge)
  lines: {
    type: "lines",
    mask: "lines",
    targets: (self) => self.lines,
    vars: { yPercent: 130, rotate: 4, scale: 0.9, duration: 1.2, stagger: 0.1, ease: "power4.out" },
  },
  words: {
    type: "lines,words",
    mask: "words",
    targets: (self) => self.words,
    vars: {
      yPercent: 130,
      rotate: 4,
      scale: 0.9,
      duration: 1.2,
      stagger: 0.03,
      ease: "power4.out",
    },
  },
  chars: {
    type: "lines,words,chars",
    mask: "lines",
    targets: (self) => self.chars,
    vars: {
      yPercent: 140,
      rotate: 8,
      scale: 0.85,
      duration: 1.4,
      stagger: 0.02,
      ease: "power4.out",
    },
  },
  // Lift: whole line rises straight out of its mask with a minimal scale-up
  // from the floor and a small overshoot bounce as it settles. No rotation.
  lift: {
    type: "lines",
    mask: "lines",
    targets: (self) => self.lines,
    vars: {
      yPercent: 130,
      scale: 0.96,
      transformOrigin: "50% 100%",
      duration: 1.3,
      stagger: 0.18,
      ease: "back.out(1.4)",
    },
  },
  // Shuffle: every character rises straight up inside its own clip, in a
  // random order. No rotation. Ported from the old Mobiuz split-text reveal.
  shuffle: {
    type: "lines,words,chars",
    mask: "chars",
    targets: (self) => self.chars,
    vars: {
      yPercent: 130,
      duration: 0.6,
      stagger: { each: 0.025, from: "random" },
      ease: "power3.out",
    },
  },
  // Smog: letters emerge from a heavy blur, fading in and sharpening while
  // easing in from the left. Sweeps left to right, top line first. No mask.
  smog: {
    type: "lines,words,chars",
    targets: (self) => self.chars,
    vars: {
      opacity: 0,
      filter: "blur(16px)",
      x: -12,
      scale: 1.08,
      duration: 1.4,
      stagger: { each: 0.035, from: "start" },
      ease: "power2.out",
    },
  },
  // Wipe: each line is uncovered left to right by a soft-edged gradient mask,
  // like light passing across the letters. Text itself never moves. The
  // gradient lives in custom.css (.tr-mode-wipe .tr-line-mask) and is driven
  // by the --wipe custom property animated here. Uses SplitText's padded line
  // masks so ascenders/descenders stay inside the masked box.
  wipe: {
    type: "lines",
    mask: "lines",
    targets: (self) => self.masks,
    vars: {
      "--wipe": "-15%",
      duration: 1.6,
      stagger: 0.25,
      ease: "power3.inOut",
    },
  },
  // Flip: every letter swings up into place from -80deg about a pivot just
  // below it (clipped per letter), with a slight overshoot. Plays once per
  // line when it enters the viewport. Ported from madewithgsap effect 058
  // (minus its swing-out on leave). Has its own per-line timelines and
  // ScrollTriggers, so it uses build() instead of the shared from-tween.
  flip: {
    type: "lines,words,chars",
    mask: "chars",
    build(self, el) {
      return gsap.context(() => {
        const START = el.dataset.textRevealStart || "top 92%";
        const startPct = (parseFloat((START.match(/(\d+(?:\.\d+)?)%/) || [])[1]) || 92) / 100;
        const LINE_GAP = 0.25; // seconds between lines that are in view together
        const vh = window.innerHeight;

        // Lines already inside the start line at build time come in one after
        // another instead of all at once. Lines entering later by scrolling
        // are naturally spaced by the scroll, so they fire immediately.
        let queued = 0;

        self.lines.forEach((line) => {
          const chars = line.querySelectorAll(".tr-char");
          if (!chars.length) return;

          gsap.set(chars, { rotate: -80, transformOrigin: "50% 120%" });

          const tl = gsap.timeline({ paused: true });
          tl.to(chars, { rotate: 0, duration: 0.8, stagger: 0.018, ease: "back.out(1.1)" });

          const inViewNow = line.getBoundingClientRect().top < vh * startPct;
          const enterDelay = inViewNow ? queued++ * LINE_GAP : 0;

          ScrollTrigger.create({
            trigger: line,
            start: START,
            once: true,
            onEnter: () => tl.delay(enterDelay).play(),
          });
        });
      });
    },
  },
  // Blur: words drift up while sharpening from a soft blur, no mask
  blur: {
    type: "lines,words",
    targets: (self) => self.words,
    vars: {
      y: 24,
      opacity: 0,
      filter: "blur(10px)",
      duration: 1.1,
      stagger: 0.04,
      ease: "power3.out",
    },
  },
};

// Picture slot beside a split text element (data-inline-pop on the previous
// sibling). Runs inside the element's reveal context so it reverts with it.
function buildInlinePop(el, self, start, delay) {
  const slot = el.previousElementSibling;
  const line = self.lines?.[0];
  if (!slot?.matches("[data-inline-pop]") || !line) return;
  const offset = slot.offsetWidth + parseFloat(getComputedStyle(slot).marginRight);

  // The slot itself pops so an image inside can still parallax on its own
  gsap.set(slot, { scale: 0, yPercent: 35, opacity: 0 });

  gsap
    .timeline({
      delay: delay + 1.2,
      scrollTrigger: { trigger: el, start, once: true },
    })
    // The pushed line runs past the heading's right edge; free its clip
    .set(line.parentElement, { overflow: "visible" })
    .to(line, { x: offset, duration: 0.8, ease: "power3.inOut" })
    .to(slot, { scale: 1, yPercent: 0, opacity: 1, duration: 0.9, ease: "back.out(1.7)" }, 0.35);
}

// How far down (in % of a piece's height) a piece must start so no part of
// it shows through its mask before the reveal. The mask keeps extra room
// under the line for descenders (padding-bottom on .tr-line-mask), and on a
// tight line-height the glyphs also overhang the line box, so a fixed 130%
// leaves the letter tops peeking on big headings. Never less than the mode's
// own value.
function hiddenYPercent(el, self, base) {
  const style = getComputedStyle(el);
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  const mask = self.masks?.[0];
  const spare = mask ? parseFloat(getComputedStyle(mask).paddingBottom) : 0;
  const overhang = Math.max(0, (fontSize * 1.25 - lineHeight) / 2);
  return Math.max(base, Math.ceil(((lineHeight + spare + overhang) / lineHeight) * 100) + 5);
}

export function initTextReveal() {
  const ctx = gsap.context(() => {});
  const splits = [];
  let cancelled = false;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.fonts.ready.then(() => {
    if (cancelled) return;
    ctx.add(() => {
      live("[data-text-reveal]").forEach((el) => {
        const modeName =
          el.dataset.textReveal in TEXT_REVEAL_MODES ? el.dataset.textReveal : "lines";
        const mode = TEXT_REVEAL_MODES[modeName];
        el.classList.add(`tr-mode-${modeName}`);
        const delay = parseFloat(el.dataset.textRevealDelay) || 0;
        const start = el.dataset.textRevealStart || "top 90%";

        if (reduced) {
          gsap.set(el, { visibility: "visible" });
          return;
        }

        const split = SplitText.create(el, {
          type: mode.type,
          mask: mode.mask,
          autoSplit: true,
          linesClass: "tr-line",
          wordsClass: "tr-word",
          charsClass: "tr-char",
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });

            // Every element manages a gsap.context so the whole choreography
            // (reveal + inline pop) is reverted together on re-split.
            el._trCtx?.revert();
            if (mode.build) {
              el._trCtx = mode.build(self, el);
              return null;
            }

            el._trCtx = gsap.context(() => {
              buildInlinePop(el, self, start, delay);
              const targets = mode.targets(self);
              if (mode.set) gsap.set(targets, mode.set);
              gsap.from(targets, {
                transformOrigin: "0% 100%",
                ...mode.vars,
                ...(mode.vars.yPercent && {
                  yPercent: hiddenYPercent(el, self, mode.vars.yPercent),
                }),
                delay,
                scrollTrigger: {
                  trigger: el,
                  start,
                  once: true,
                },
              });
            });
            return null;
          },
        });
        splits.push(split);
      });
    });
  });

  return () => {
    cancelled = true;
    splits.forEach((s) => {
      s.elements?.forEach((el) => {
        el._trCtx?.revert();
        delete el._trCtx;
      });
      s.revert();
    });
    ctx.revert();
  };
}

/* --------------------------------------------------------------------------
   Work variant toggle (see src/app/works/page.js)
   A [data-work-toggle] card holds one .work-image and one .work-toggle-tab
   per service variant, matched by data-variant. Clicking a tab moves
   .is-active to that variant's tab and image; the crossfade is CSS.
   -------------------------------------------------------------------------- */
export function initWorkToggles() {
  const cleanups = live("[data-work-toggle]").map((card) => {
    const onClick = (e) => {
      const tab = e.target.closest(".work-toggle-tab");
      if (!tab || tab.classList.contains("is-active")) return;
      const { variant } = tab.dataset;
      card.querySelectorAll(".work-toggle-tab, .work-image").forEach((el) => {
        el.classList.toggle("is-active", el.dataset.variant === variant);
      });
    };
    card.addEventListener("click", onClick);
    return () => card.removeEventListener("click", onClick);
  });
  return () => cleanups.forEach((fn) => fn());
}

/* --------------------------------------------------------------------------
   Page transitions (see src/components/PageTransition.js and the matching
   section in custom.css)
   Swup-style: the motion is described in CSS, keyed off state classes on
   <html> and on the snapshot cards, so the header (fixed, outside the page)
   never takes part.

     is-changing   whole visit, from the click until the new page has settled
     is-leaving    old page is on its way out
     is-rendering  new page has rendered; it stays hidden until the swap
     is-pending    new page's scripts have not booted yet (see release)
     is-popstate   back/forward: the router swaps the page on its own, so
                   only the enter half runs (card comes in from the left)
                   and the page is put back where it was left (see below).

   Neither real page is ever transformed. Both are stood in for by
   snapshots: viewport-sized fixed cards holding a clone of .site-page
   (main + footer, see layout.js) lined up with the scroll position. Cards
   only ever animate transform properties (scale, translate) plus the
   corner radius, so the browser can run them on the compositor.

   1. leave():       .pt-ghost.is-prev is cloned from the old page and
                     shrinks (.is-back). navigate() after --pt-leave-ms.
   2. onRouteChange: new page rendered, hidden and untransformed so the
                     page scripts that boot next measure the real layout.
   3. release():     after initSite() and document.fonts.ready (which
                     initTextReveal waits for), ScrollTrigger is refreshed
                     once, GSAP's global timeline is paused so the new page
                     freezes, and .pt-ghost.is-next is cloned from it. The
                     old card slides out (.is-out), the new one in (.is-in),
                     then grows to full size (.is-grow).
   4. swap:          cards and backdrop are removed, the real page is shown
                     and GSAP resumes. Because the page was frozen, it is
                     pixel-identical to the card it replaces.

   Scroll input (wheel, touch, keys) is swallowed for the whole visit rather
   than calling lenis.stop(): that would hide the scrollbar and reflow the
   page by its width, which shows up as a jump when the cards appear.

   Back/forward scroll positions are handled here, not by the browser. Its
   own restoration runs on popstate, before the router has swapped the
   page, so the old page would jump to the new entry's position first (and
   the header would hide on that jump). Instead every history entry keeps
   its position in history.state (Next preserves custom keys on
   back/forward), saved while scrolling and on leave(); release() moves the
   still-hidden new page there before it is snapshotted. Fresh loads
   (reload, back/forward from another site) stay with the browser: manual
   mode is only switched on after the load event.

   Elements GSAP has pinned (position: fixed inline) are re-anchored inside
   the clone so they stay where they were on screen.

   Internal link clicks are intercepted (capture phase, so next/link sees
   defaultPrevented and steps aside). Opt a link out with data-no-transition.
   External, new-tab, download, modifier-key and same-page (#hash) clicks are
   left alone.
   -------------------------------------------------------------------------- */
let pageTransitions = null;

// Top-level blocks of the page: main's sections plus anything beside main
// (the footer). Used to keep only what is on screen in a snapshot.
function pageBlocks(root) {
  return Array.from(root.children).flatMap((el) =>
    el.tagName === "MAIN" ? Array.from(el.children) : [el]
  );
}

// Clone the live page into a fixed, viewport-sized card lined up with the
// current scroll position. Only blocks that intersect the viewport are
// copied; the rest become empty spacers of the same height so offsets hold.
// Keeps the clone small enough to lay out and paint within a frame.
function createGhost(className) {
  const page = live(".site-page")[0];
  if (!page) return null;

  // Measure anything GSAP has pinned before cloning so it can be re-anchored
  const all = Array.from(page.querySelectorAll("*"));
  const fixed = all.filter((el) => el.style.position === "fixed");
  const anchors = fixed.map((el) => {
    const r = el.getBoundingClientRect();
    const p = el.parentElement.getBoundingClientRect();
    return { top: r.top - p.top, left: r.left - p.left };
  });

  const clone = page.cloneNode(true);
  // Not a .site-page any more: the transition rules must not touch the copy
  clone.classList.remove("site-page");
  clone.classList.add("pt-ghost-clone");
  clone.setAttribute("inert", "");
  clone.setAttribute("aria-hidden", "true");
  const cloneAll = Array.from(clone.querySelectorAll("*"));
  fixed.forEach((el, i) => {
    const c = cloneAll[all.indexOf(el)];
    if (!c) return;
    c.style.position = "absolute";
    c.style.top = anchors[i].top + "px";
    c.style.left = anchors[i].left + "px";
    if (getComputedStyle(el.parentElement).position === "static") {
      c.parentElement.style.position = "relative";
    }
  });

  const make = (cls) => {
    const el = document.createElement("div");
    el.className = cls;
    return el;
  };

  // Drop blocks that are off screen (margins are reset to 0 site-wide, so a
  // block's box height is all the space it takes)
  const vh = window.innerHeight;
  const cloneBlocks = pageBlocks(clone);
  pageBlocks(page).forEach((block, i) => {
    const r = block.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) return;
    const spacer = make("pt-ghost-spacer");
    spacer.style.height = r.height + "px";
    cloneBlocks[i].replaceWith(spacer);
  });

  const ghost = make(`pt-ghost ${className}`);
  const card = make("pt-ghost-page");
  const inner = make("pt-ghost-inner");
  inner.style.top = -window.scrollY + "px";
  inner.appendChild(clone);
  card.appendChild(inner);
  ghost.appendChild(card);
  document.body.appendChild(ghost);
  return ghost;
}

export function initPageTransitions({ navigate }) {
  if (pageTransitions) return pageTransitions;

  const html = document.documentElement;
  const STATES = ["is-changing", "is-leaving", "is-rendering", "is-pending", "is-popstate"];
  const readMs = (name, fallback) => {
    const v = parseFloat(getComputedStyle(html).getPropertyValue(name));
    return Number.isNaN(v) ? fallback : v;
  };
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Force a style flush so a class added right after starts a transition
  const flush = (el) => void el.offsetWidth;
  // Two frames: enough for a freshly inserted card to be painted and
  // uploaded before it starts moving, so its first frames don't stutter
  const rastered = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  let leaving = false;
  let backdrop = null;
  let prevGhost = null;
  let nextGhost = null;
  let pausedGsap = false;

  const timers = new Set();
  const after = (ms, fn) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };

  // Scroll lock: swallow the input instead of stopping Lenis (see above)
  const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);
  const swallow = (e) => {
    if (e.type === "keydown" && !SCROLL_KEYS.has(e.key)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const SCROLL_EVENTS = ["wheel", "touchmove", "keydown"];
  const lockScroll = () =>
    SCROLL_EVENTS.forEach((t) =>
      window.addEventListener(t, swallow, { capture: true, passive: false })
    );
  const unlockScroll = () =>
    SCROLL_EVENTS.forEach((t) => window.removeEventListener(t, swallow, { capture: true }));

  // Beige behind the cards; also swallows clicks while the visit runs
  const ensureBackdrop = () => {
    if (backdrop) return;
    backdrop = document.createElement("div");
    backdrop.className = "pt-backdrop";
    document.body.appendChild(backdrop);
  };

  // Scroll positions per history entry (see the section comment).
  // Fresh loads (reload, back/forward from another site) are left to the
  // browser, which keeps retrying while images push the page taller and
  // never overshoots. The mode lives on the history entry and survives a
  // reload, so it goes manual only once the document has loaded and back
  // to auto when it is left (pagehide), then manual again if the document
  // comes back from the back/forward cache (pageshow). ScrollTrigger
  // re-applies the mode it captured at boot on every refresh, so the switch
  // goes through it rather than history alone.
  const SCROLL_KEY = "ptScroll";
  const setRestoration = (mode) => ScrollTrigger.clearScrollMemory(mode);
  let pendingScroll = null; // where the incoming back/forward page was left
  let currentPath = location.pathname;
  let saveTimer = null;
  let lastSave = 0;
  const saveScroll = () => {
    clearTimeout(saveTimer);
    saveTimer = null;
    lastSave = performance.now();
    // Mid-visit the entry is already the next page's: never stamp it with
    // the old page's position. Entries the router does not own (hash links)
    // are left alone, or it would reload the page when they are revisited.
    if (html.classList.contains("is-changing")) return;
    const state = history.state;
    if (!state?.__NA || state[SCROLL_KEY] === window.scrollY) return;
    try {
      history.replaceState({ ...state, [SCROLL_KEY]: window.scrollY }, "");
    } catch {
      // Safari rate-limits replaceState; one lost position is harmless
    }
  };
  // Saved when scrolling settles, and every half second while it goes on:
  // Lenis keeps easing for a while after the wheel stops, and a back press
  // in that tail must still find a recent position. replaceState is rate
  // limited, so no more often than that.
  const onScroll = () => {
    clearTimeout(saveTimer);
    if (performance.now() - lastSave > 500) saveScroll();
    else saveTimer = setTimeout(saveScroll, 200);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // Lenis dispatches this on the window when its easing settles
  window.addEventListener("scrollend", saveScroll);

  // Also records where the browser's own restoration put a fresh load, so
  // the entry never keeps a position from an older, taller layout
  const armManual = () => {
    setRestoration("manual");
    saveScroll();
  };
  // No save here: a replaceState while unloading makes Chrome forget the
  // scroll offset it restores from, and the throttled saves are recent
  const onPageHide = () => setRestoration("auto");
  if (document.readyState === "complete") armManual();
  else window.addEventListener("load", armManual);
  window.addEventListener("pageshow", armManual);
  window.addEventListener("pagehide", onPageHide);

  const dropCards = () => {
    prevGhost?.remove();
    nextGhost?.remove();
    prevGhost = nextGhost = null;
    if (pausedGsap) {
      gsap.globalTimeline.play();
      pausedGsap = false;
    }
  };

  const clear = () => {
    clearTimers();
    html.classList.remove(...STATES);
    dropCards();
    backdrop?.remove();
    backdrop = null;
    unlockScroll();
    leaving = false;
  };

  const leave = (href) => {
    if (leaving) return;
    // A click during an enter: drop that visit and start this one from the
    // page as it is now (the new card is inserted in the same task, so the
    // real page never paints in between).
    if (html.classList.contains("is-changing")) clear();
    leaving = true;
    saveScroll();

    lockScroll();
    html.classList.add("is-changing", "is-leaving");
    if (!reduced()) {
      ensureBackdrop();
      prevGhost = createGhost("is-prev");
      // The card starts as an exact copy of the page, so waiting for it to
      // paint before shrinking is invisible
      const ghost = prevGhost;
      rastered(() => ghost === prevGhost && ghost.classList.add("is-back"));
    }

    after(readMs("--pt-leave-ms", 550), () => {
      navigate(href);
      // If the route never changes (blocked or failed), unlock the page
      after(8000, () => leaving && clear());
    });
  };

  // Route has changed, new page not painted yet. It stays hidden and
  // untransformed so the page scripts that boot next measure the real layout.
  const onRouteChange = () => {
    clearTimers();
    const fromLink = leaving;
    leaving = false;
    currentPath = location.pathname;

    if (!fromLink) {
      // Back/forward (or a push from code): no old card. If a visit was
      // still running when the route changed under it, its cards are stale
      dropCards();
      lockScroll();
    }
    html.classList.remove("is-leaving");
    html.classList.add("is-changing", "is-rendering", "is-pending");
    html.classList.toggle("is-popstate", !fromLink);
    if (!reduced()) ensureBackdrop();

    // Should never be needed, but never leave the page hidden
    after(3000, release);
  };

  // Snapshot the new page and run the slide + grow, then swap it in.
  const release = () => {
    if (!html.classList.contains("is-pending")) return;
    clearTimers();
    html.classList.remove("is-pending");

    // Back/forward: put the page where it was left while it is still
    // hidden. The header ignores the jump (no velocity, see initHeader).
    if (html.classList.contains("is-popstate")) {
      const y = pendingScroll ?? 0;
      pendingScroll = null;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        window.scrollTo(0, y);
      }
    }

    // Every ScrollTrigger of the new page exists now: measure once. This
    // also replaces the refresh GSAP queues for the next frame when
    // triggers are created after load.
    ScrollTrigger.refresh();

    if (reduced()) {
      clear();
      return;
    }

    // Freeze the new page so its snapshot still matches it at the swap
    gsap.globalTimeline.pause();
    pausedGsap = true;

    nextGhost = createGhost("is-next");
    if (!nextGhost) {
      clear();
      return;
    }
    // Painted in place but invisible first (.is-prep), then moved off screen
    // and slid in, so it arrives already rasterised
    nextGhost.classList.add("is-prep");
    const ghost = nextGhost;
    rastered(() => {
      if (ghost !== nextGhost) return;
      ghost.classList.remove("is-prep");
      flush(ghost);
      ghost.classList.add("is-in");
      prevGhost?.classList.add("is-out");

      const slide = readMs("--pt-slide-ms", 650);
      const grow = readMs("--pt-grow-ms", 550);
      after(slide, () => ghost.classList.add("is-grow"));
      after(slide + grow + 30, clear);
    });
  };

  // New page scripts have booted. initTextReveal only splits and creates its
  // triggers after document.fonts.ready, so queue behind the same promise.
  const onRouteReady = () => {
    document.fonts.ready.then(release);
  };

  const onClick = (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    if (a.hasAttribute("download") || "noTransition" in a.dataset) return;

    let url;
    try {
      url = new URL(a.href, location.href);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return; // same page, hash or query only

    e.preventDefault();
    leave(url.pathname + url.search + url.hash);
  };
  document.addEventListener("click", onClick, true);

  // Back/forward. The router swaps the page on its own (onRouteChange
  // follows); the visit starts here so the old page is covered at once,
  // even while a stale route is fetched again, and the entry's position is
  // read before anything else touches history.state.
  const onPopState = (e) => {
    if (location.pathname === currentPath) {
      // Hash or query only: same page, no visit. The browser no longer
      // restores these, so jump to the entry's position if it has one
      const y = e.state?.[SCROLL_KEY];
      if (y != null) lenis?.scrollTo(y, { immediate: true, force: true });
      return;
    }
    clearTimeout(saveTimer); // the old page's position is not this entry's
    pendingScroll = e.state?.[SCROLL_KEY] ?? 0;
    if (leaving || html.classList.contains("is-changing")) return;
    lockScroll();
    html.classList.add("is-changing", "is-popstate");
    if (!reduced()) ensureBackdrop();
    // If the router never picks the entry up, unlock the page
    after(8000, () => !html.classList.contains("is-rendering") && clear());
  };
  window.addEventListener("popstate", onPopState);

  pageTransitions = {
    leave,
    onRouteChange,
    onRouteReady,
    destroy() {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", saveScroll);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", armManual);
      window.removeEventListener("load", armManual);
      clearTimeout(saveTimer);
      setRestoration("auto");
      clear();
      pageTransitions = null;
    },
  };
  return pageTransitions;
}

/* --------------------------------------------------------------------------
   Wind leaves (see src/components/WindLeaf.js and the matching CSS)
   Every [data-wind-leaf] image swings on its stem with the scroll: the
   faster the page moves, the further the fronds bend, and when it stops
   they swing back past rest and settle, like a gust dying down. A faint
   idle breeze keeps them from ever standing still. Runs on GSAP's ticker
   (shared with Lenis) and reads Lenis' velocity, so the motion follows the
   smoothed scroll rather than raw wheel ticks.
   -------------------------------------------------------------------------- */
export function initWindLeaves() {
  const leaves = live("[data-wind-leaf]");
  if (!leaves.length || !lenis) return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  // All per-frame constants are for 60fps; the tick scales them by the real
  // frame time so the sway is the same speed on any display.
  const MAX_DEG = 10; // hardest bend
  const GAIN = 0.18; // degrees per px/frame of scroll velocity
  const GUST_EASE = 0.08; // how quickly the wind follows the scroll speed
  const STIFFNESS = 0.004; // pull back towards the target: ~1.7s per swing
  const DAMPING = 0.97; // swing kept per frame: a few slow passes, then rest
  const BREEZE_DEG = 2;

  let velocity = 0;
  let gust = 0;
  let angle = 0;
  let swing = 0;
  const onScroll = (l) => {
    velocity = l.velocity;
  };
  lenis.on("scroll", onScroll);

  const tick = (time, deltaTime) => {
    const dt = gsap.utils.clamp(0.5, 3, deltaTime / (1000 / 60));
    // Lenis only reports while moving; let the reading fade between
    // reports, and ease the wind after it so a gust builds and dies down
    velocity *= Math.pow(0.95, dt);
    gust += (velocity - gust) * (1 - Math.pow(1 - GUST_EASE, dt));
    const bend = gsap.utils.clamp(-MAX_DEG, MAX_DEG, -gust * GAIN);
    const breeze = Math.sin(time * 0.45) * BREEZE_DEG + Math.sin(time * 1.1) * BREEZE_DEG * 0.35;
    const target = bend + breeze;
    // Damped spring: swings past the target and settles softly
    swing += (target - angle) * STIFFNESS * dt;
    swing *= Math.pow(DAMPING, dt);
    angle += swing * dt;
    leaves.forEach((el) => {
      el.style.transform = `rotate(${angle.toFixed(3)}deg)`;
    });
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.off("scroll", onScroll);
    leaves.forEach((el) => el.style.removeProperty("transform"));
  };
}

/* --------------------------------------------------------------------------
   Mobile menu (see src/components/Header.js and the Menu section in
   custom.css). The hamburger (.menu-toggle) opens .site-menu, a panel that
   slides in from the right over a backdrop. State is html.menu-open so the
   header, panel and backdrop can all react in CSS. While open the page
   scroll is stopped (Lenis) so the panel can be scrolled on its own.
   Closes on the backdrop, Escape, any link inside, or when the page is
   left (cleanup), which is also the route change after a link click.
   -------------------------------------------------------------------------- */
export function initMenu() {
  const html = document.documentElement;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-menu");
  if (!toggle || !menu) return () => {};

  const isOpen = () => html.classList.contains("menu-open");

  const setOpen = (open) => {
    if (open === isOpen()) return;
    html.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.scrollTop = 0;
    if (open) {
      document.querySelector(".site-header")?.classList.remove("is-hidden");
      lenis?.stop();
    } else {
      lenis?.start();
    }
  };

  const onToggle = () => setOpen(!isOpen());
  const onClose = () => setOpen(false);
  const onKey = (e) => {
    if (e.key === "Escape") setOpen(false);
  };
  // Closed on any link so a same-page or hash link still dismisses it. A
  // route link runs the page transition; the panel is outside .site-page,
  // so it slides away over the shrinking card rather than being copied.
  const onMenuClick = (e) => {
    if (e.target.closest("a[href]")) setOpen(false);
  };
  // Leaving the phone layout with the menu open would strand the page stopped
  const mq = window.matchMedia("(max-width: 768px)");
  const onMedia = () => {
    if (!mq.matches) setOpen(false);
  };

  const closers = live("[data-menu-close]");
  toggle.addEventListener("click", onToggle);
  closers.forEach((el) => el.addEventListener("click", onClose));
  menu.addEventListener("click", onMenuClick);
  document.addEventListener("keydown", onKey);
  mq.addEventListener("change", onMedia);

  return () => {
    setOpen(false);
    toggle.removeEventListener("click", onToggle);
    closers.forEach((el) => el.removeEventListener("click", onClose));
    menu.removeEventListener("click", onMenuClick);
    document.removeEventListener("keydown", onKey);
    mq.removeEventListener("change", onMedia);
  };
}

/* --------------------------------------------------------------------------
   Boot everything. Returns a cleanup function.
   -------------------------------------------------------------------------- */
export function initSite() {
  initSmoothScroll();
  const destroyHeader = initHeader();
  const destroyMenu = initMenu();
  initSliders();
  const parallaxCtx = initParallax();
  const flattenCtx = initFlatten();
  const stackCtx = initStackCards();
  const linesCtx = initLines();
  const wipesCtx = initWipes();
  const destroyProjects = initProjectsSlider();
  const destroyWorkToggles = initWorkToggles();
  initEditorContent();
  const destroyTextReveal = initTextReveal();
  const destroyWindLeaves = initWindLeaves();

  // Recalculate trigger positions once images have loaded
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);

  return () => {
    window.removeEventListener("load", onLoad);
    destroyMenu();
    destroyHeader();
    destroyWindLeaves();
    destroyTextReveal();
    destroyWorkToggles();
    destroyProjects();
    wipesCtx.revert();
    linesCtx.revert();
    stackCtx.revert();
    flattenCtx.revert();
    parallaxCtx.revert();
    destroySliders();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    destroySmoothScroll();
  };
}

export { gsap, ScrollTrigger };
