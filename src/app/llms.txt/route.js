import { getPosts, getServicePage, getSiteSettings, getWorks } from "@/lib/wp";
import { SITE_URL } from "@/lib/site";

// Served at /llms.txt (https://llmstxt.org): a plain markdown map of the site
// for AI assistants. Service blurbs are the banner text from each service page.
const SERVICES = ["plant-rental", "landscaping", "event-design", "maintenance"];

export async function GET() {
  const [services, works, posts, settings] = await Promise.all([
    Promise.all(SERVICES.map((slug) => getServicePage(slug))),
    getWorks(),
    getPosts(),
    getSiteSettings(),
  ]);

  const link = (title, path, note) => `- [${title}](${SITE_URL}${path})${note ? `: ${note}` : ""}`;

  const text = [
    "# Rent-A-Pot",
    "",
    "> Rent-A-Pot provides plant rental, landscaping, event design and plant maintenance in Malaysia.",
    "",
    "## Services",
    ...services.map((s, i) => link(s.title, `/${SERVICES[i]}`, s.banner.text)),
    "",
    "## Company",
    link("About", "/about"),
    link(
      "Contact",
      "/contact",
      [settings.email, settings.phones.map((p) => p.label).join(" / ")].filter(Boolean).join(", ")
    ),
    "",
    "## Works",
    ...works.map((w) => link(w.title, `/works/${w.slug}`, w.description)),
    "",
    "## Blog",
    ...posts.map((p) => link(p.title, `/blog/${p.slug}`, p.excerpt)),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
