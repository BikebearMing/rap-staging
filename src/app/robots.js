import { SITE_URL } from "@/lib/site";

// Served at /robots.txt. Set NO_INDEX=1 on staging deploys to keep them out
// of search results.
export default function robots() {
  if (process.env.NO_INDEX) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
