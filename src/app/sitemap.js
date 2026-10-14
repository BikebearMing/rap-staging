import { getPosts, getWorks } from "@/lib/wp";
import { SITE_URL, STATIC_ROUTES } from "@/lib/site";

export default async function sitemap() {
  const [posts, works] = await Promise.all([getPosts(), getWorks()]);

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      changeFrequency: "monthly",
      priority: path === "/" ? 1 : 0.8,
    })),
    ...works.map((work) => ({
      url: `${SITE_URL}/works/${work.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.sortKey ? post.sortKey.slice(0, 10) : undefined,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
  ];
}
