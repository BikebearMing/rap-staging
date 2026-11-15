/** @type {import('next').NextConfig} */
const nextConfig = {
  // CMS photos go through the image optimiser (src/components/Img.js), which
  // serves resized AVIF/WebP from this domain. Only the CMS's media library
  // may be optimised, so the endpoint can't be used to fetch other sites.
  // The largest width offered is 1920 (full-screen photos at 2x on a laptop);
  // the 2048/3840 defaults would only add weight. 1440 fills the jump from
  // 1200 for photos around 600-700px wide at 2x. Optimised files are kept a
  // year: WordPress gives a re-uploaded photo a new file name, so a cached
  // copy never goes stale. 75 is the default quality; 60 is for the
  // full-screen photos (quality={60} on the hero and banner images), which
  // are the heaviest files and look the same at 60.
  images: {
    remotePatterns: [new URL("https://cms.rap.com.my/wp-content/uploads/**")],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    qualities: [60, 75],
    minimumCacheTTL: 31536000,
  },

  // The artwork and fonts in public/ are cached for a year (Next serves
  // public/ files with max-age=0 otherwise). Their URLs carry no hash, so a
  // changed file must be saved under a new name or visitors keep the old
  // one. Only top-level images and /fonts: icon.png and apple-icon.png are
  // left out (Next builds them from src/app), and pages, robots.txt,
  // sitemap.xml and /_next/* never match.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/:file((?!icon\\.png$|apple-icon\\.png$)[^/]+\\.(?:svg|png|jpg))", headers: cache },
      { source: "/fonts/:file*", headers: cache },
    ];
  },

  // Permanent (308) redirects from the old WordPress / WooCommerce site so its
  // indexed URLs and rankings carry over instead of hitting a 404.
  async redirects() {
    return [
      // Old service pages
      { source: "/rent", destination: "/plant-rental", permanent: true },
      { source: "/landscape", destination: "/landscaping", permanent: true },
      { source: "/event", destination: "/event-design", permanent: true },
      { source: "/decor", destination: "/event-design", permanent: true },
      { source: "/rentapot", destination: "/about", permanent: true },

      // Retired shop: products, categories and shop pages go to plant rental,
      // the nearest equivalent now that plants are no longer sold online
      { source: "/product/:slug*", destination: "/plant-rental", permanent: true },
      { source: "/product-category/:slug*", destination: "/plant-rental", permanent: true },
      { source: "/shop", destination: "/plant-rental", permanent: true },
      { source: "/buy/:slug*", destination: "/plant-rental", permanent: true },
      { source: "/gift", destination: "/plant-rental", permanent: true },
      { source: "/cart", destination: "/plant-rental", permanent: true },
      { source: "/checkout", destination: "/plant-rental", permanent: true },
      { source: "/my-account/:slug*", destination: "/contact", permanent: true },
      { source: "/track-order", destination: "/contact", permanent: true },

      // Old blog taxonomies
      { source: "/category/:slug*", destination: "/blog", permanent: true },
      { source: "/tag/:slug*", destination: "/blog", permanent: true },

      { source: "/terms", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
