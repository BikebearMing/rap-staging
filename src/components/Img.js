"use client";

import { getImageProps } from "next/image";

// A CMS photo, served through the Next.js image optimiser (resized WebP/AVIF
// from this site's own domain instead of the WordPress original). image is
// { src, alt, width, height } from imageFrom in wp.js; alt is the fallback
// used when the media item has no Alt text of its own. sizes says how wide
// the photo shows (see the image usages in custom.css) so the browser picks
// the smallest file that stays sharp.
//
// getImageProps rather than <Image> so this stays one plain <img> with the
// caller's class and data attributes on it, exactly where the old one was:
// custom.css and custom.js own its size and position (parallax, swaps,
// slider clones), so no fill and no wrapper. width/height are the original's,
// which only set the aspect ratio: a lazy image reserves its box before it
// loads and ScrollTrigger measures the final layout. Nothing is rendered
// when the field is empty.
//
// One image per page, the one that paints first (the hero), is `priority`:
// loaded straight away at high priority, and React adds a preload for it to
// the page's <head>. Every other photo loads lazily as it nears the viewport.
//
// A client component on purpose. React puts a preload hint for every
// non-lazy <img> a server component renders into that page's prefetch
// data, and the header prefetches every page, so as a server component each
// page's hero was downloaded on every other page too. Rendered here, the
// hint only goes in the HTML of the page that shows it.
export default function Img({ image, alt = "", sizes, priority = false, ...rest }) {
  if (!image?.src) return null;

  // Uploads WordPress has no size for still get resized; they just don't
  // reserve a box, as before. The optimiser only needs a width to build
  // srcset when there is no sizes, and every caller passes sizes.
  const sized = image.width > 0 && image.height > 0;
  const { props } = getImageProps({
    ...rest,
    src: image.src,
    alt: image.alt || alt,
    width: sized ? image.width : 1920,
    height: sized ? image.height : 1080,
    sizes,
    ...(priority && { loading: "eager", fetchPriority: "high" }),
  });
  if (!sized) {
    delete props.width;
    delete props.height;
  }

  return <img {...props} alt={props.alt} />;
}
