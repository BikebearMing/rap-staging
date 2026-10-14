// The public address of the Next.js site (not the WordPress backend at
// rap.mydemobb.com). Used for the sitemap, robots.txt, llms.txt and canonical
// URLs. Set SITE_URL on a staging deploy so links point there instead.
export const SITE_URL = (process.env.SITE_URL || "https://www.rap.com.my").replace(/\/+$/, "");

export const SITE_NAME = "Rent-A-Pot";
export const SITE_DESCRIPTION =
  "Plant rental, landscaping, event greenery and garden maintenance in Malaysia since 1982. Green spaces for offices, homes and events.";

// Full page metadata: title, description, canonical URL and the Open Graph /
// Twitter tags used when a link is shared. Pages without a photo of their own
// share the homepage banner.
const DEFAULT_IMAGE = "/hp-banner-1.jpg";

export function pageMeta({ title, description = SITE_DESCRIPTION, path = "/", image }) {
  const images = [image || DEFAULT_IMAGE];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_MY",
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

// Routes that come from a page.js rather than from WordPress posts/works
export const STATIC_ROUTES = [
  "/",
  "/about",
  "/plant-rental",
  "/landscaping",
  "/event-design",
  "/maintenance",
  "/works",
  "/blog",
  "/contact",
];
