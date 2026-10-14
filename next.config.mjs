/** @type {import('next').NextConfig} */
const nextConfig = {
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
