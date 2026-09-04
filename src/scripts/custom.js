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

let lenis = null;
let tick = null;
let sliders = [];

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
  const onScroll = ({ scroll, direction }) => {
    if (scroll < HIDE_AFTER || direction === -1) {
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
  document.querySelectorAll(".embla").forEach((root) => {
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
    document.querySelectorAll(".has-parallax").forEach((container) => {
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
    document.querySelectorAll("[data-flatten]").forEach((el) => {
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
    const slides = gsap.utils.toArray(".services-stack .service-slide");

    slides.forEach((slide, i) => {
      const pin = slide.querySelector(".service-pin");
      const card = slide.querySelector(".service-card");
      if (!pin || !card) return;
      if (i === slides.length - 1) return;

      gsap.to(card, {
        scale: 0.9,
        rotationX: 12,
        ease: "power1.in",
        scrollTrigger: {
          trigger: slide,
          pin,
          start: "top top",
          end: () => "+=" + window.innerHeight,
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
          end: () => "+=" + 0.2 * window.innerHeight,
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
    document.querySelectorAll("[data-line]").forEach((el) => {
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

  document.querySelectorAll(".projects-slider").forEach((root) => {
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
    document.querySelectorAll("[data-wipe]").forEach((el) => {
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

export function initTextReveal() {
  const ctx = gsap.context(() => {});
  const splits = [];
  let cancelled = false;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.fonts.ready.then(() => {
    if (cancelled) return;
    ctx.add(() => {
      document.querySelectorAll("[data-text-reveal]").forEach((el) => {
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
   Boot everything. Returns a cleanup function.
   -------------------------------------------------------------------------- */
export function initSite() {
  initSmoothScroll();
  const destroyHeader = initHeader();
  initSliders();
  const parallaxCtx = initParallax();
  const flattenCtx = initFlatten();
  const stackCtx = initStackCards();
  const linesCtx = initLines();
  const wipesCtx = initWipes();
  const destroyProjects = initProjectsSlider();
  const destroyTextReveal = initTextReveal();

  // Recalculate trigger positions once images have loaded
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);

  return () => {
    window.removeEventListener("load", onLoad);
    destroyHeader();
    destroyTextReveal();
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
