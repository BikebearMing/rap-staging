// WordPress data layer. Everything on the site comes from the headless
// WordPress at WORDPRESS_GRAPHQL_URL (WPGraphQL + Secure Custom Fields, see
// the field groups under SCF in wp-admin). Responses are cached for a minute
// and tagged "wordpress" so POST /api/revalidate can flush them on demand.

const ENDPOINT = process.env.WORDPRESS_GRAPHQL_URL || "https://rap.mydemobb.com/graphql";

// wp-admin page IDs. The SCF field groups are attached to these IDs, so they
// only change if the pages are recreated in WordPress.
export const PAGE_IDS = {
  home: 8,
  "plant-rental": 9,
  landscaping: 10,
  "event-design": 11,
  maintenance: 12,
  works: 13,
  blog: 14,
  contact: 15,
};

export async function wpQuery(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60, tags: ["wordpress"] },
  });
  if (!res.ok) throw new Error(`WordPress responded ${res.status} for ${ENDPOINT}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("\n"));
  return data;
}

// ---- Selections ----------------------------------------------------------

const IMAGE = "node { sourceUrl altText }";
const IMAGES = "nodes { sourceUrl altText }";

export const SERVICE_BANNER = `serviceBannerFields { bannerHeading bannerHighlight bannerText bannerImage { ${IMAGE} } }`;
export const SERVICE_FAQ = "serviceFaqFields { faqs { question answer } }";

const WORK = `
  title slug date
  workTags { nodes { name } }
  workFields {
    projectDate description
    variants { service { nodes { name slug } } image { ${IMAGE} } }
  }
`;
const WORK_FULL = `${WORK} workFields { overview { paragraph } gallery { ${IMAGES} } }`;

const POST = `title slug date excerpt isSticky featuredImage { ${IMAGE} }`;

// ---- Normalisers ---------------------------------------------------------

const src = (edge) => edge?.node?.sourceUrl || "";
const srcs = (conn) => (conn?.nodes || []).map((n) => n.sourceUrl).filter(Boolean);
const first = (conn) => conn?.nodes?.[0] || null;

// "/event-design/" from WordPress becomes the Next.js route "/event-design"
export const localPath = (uri) => (uri ? uri.replace(/\/+$/, "") || "/" : "#");

const asDate = (value) => {
  if (!value) return null;
  // WordPress local times carry no offset; read them as UTC so the calendar
  // date never shifts.
  const d = new Date(/[Z+-]\d{2}:?\d{2}$|Z$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fmt = (value, options) => {
  const d = asDate(value);
  return d ? d.toLocaleDateString("en-US", { timeZone: "UTC", ...options }) : "";
};
export const monthYear = (value) => fmt(value, { month: "short", year: "numeric" });
export const year = (value) => fmt(value, { year: "numeric" });
export const longDate = (value) => fmt(value, { month: "long", day: "numeric", year: "numeric" });

const stripTags = (html) =>
  (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/\[&hellip;\]|&hellip;/g, "…")
    .trim();

export function normalizeWork(node) {
  const f = node.workFields || {};
  return {
    slug: node.slug,
    title: node.title,
    date: monthYear(f.projectDate),
    year: year(f.projectDate),
    sortKey: f.projectDate || node.date || "",
    variants: (f.variants || []).map((v) => ({
      category: first(v.service)?.name || "",
      service: first(v.service)?.slug || "",
      image: src(v.image),
    })),
    tags: (node.workTags?.nodes || []).map((t) => t.name),
    description: f.description || "",
    overview: (f.overview || []).map((o) => o.paragraph).filter(Boolean),
    gallery: srcs(f.gallery),
  };
}

export function normalizePost(node) {
  return {
    slug: node.slug,
    title: node.title,
    date: longDate(node.date),
    sortKey: node.date || "",
    image: src(node.featuredImage),
    excerpt: stripTags(node.excerpt),
    featured: !!node.isSticky,
    content: node.content || "",
  };
}

// A work as a slide for ProjectsSlider. `service` picks which variant's
// photo and tag to show; defaults to the first variant.
export function projectSlide(work, service) {
  const variant = work.variants.find((v) => v.service === service) || work.variants[0] || {};
  return {
    title: work.title,
    date: work.date,
    tag: variant.category || "",
    image: variant.image || "",
    href: `/works/${work.slug}`,
  };
}

const byNewest = (a, b) => (a.sortKey < b.sortKey ? 1 : a.sortKey > b.sortKey ? -1 : 0);

// ---- Queries -------------------------------------------------------------

export async function getPage(slug, selection) {
  const data = await wpQuery(
    `query Page($id: ID!) { page(id: $id, idType: DATABASE_ID) { title ${selection} } }`,
    { id: PAGE_IDS[slug] }
  );
  return data.page || {};
}

export async function getHome() {
  const { homeFields: h = {} } = await getPage(
    "home",
    `homeFields {
      heroHeading heroHighlight heroText heroSlides { ${IMAGES} }
      historyLabel historyImage { ${IMAGE} } historyHeading historyHighlight
      historyButtonLabel historyButtonLink { nodes { uri } }
      servicesHeading
      services { title page { nodes { uri } } featuredWork { nodes { ... on Work { title } } } image { ${IMAGE} } }
      featuredWorks { nodes { ... on Work { ${WORK} } } }
    }`
  );
  return {
    hero: {
      heading: h.heroHeading || "",
      highlight: h.heroHighlight || "",
      text: h.heroText || "",
      slides: srcs(h.heroSlides),
    },
    history: {
      label: h.historyLabel || "",
      image: src(h.historyImage),
      heading: h.historyHeading || "",
      highlight: h.historyHighlight || "",
      buttonLabel: h.historyButtonLabel || "",
      buttonHref: localPath(first(h.historyButtonLink)?.uri),
    },
    servicesHeading: h.servicesHeading || "Our Services",
    services: (h.services || []).map((s) => ({
      title: s.title || "",
      project: first(s.featuredWork)?.title || "",
      image: src(s.image),
      href: localPath(first(s.page)?.uri),
    })),
    projects: (h.featuredWorks?.nodes || []).map((w) => projectSlide(normalizeWork(w))),
  };
}

export async function getServicePage(slug, selection = "") {
  const page = await getPage(slug, `${SERVICE_BANNER} ${SERVICE_FAQ} ${selection}`);
  const b = page.serviceBannerFields || {};
  return {
    ...page,
    banner: {
      heading: b.bannerHeading || "",
      highlight: b.bannerHighlight || "",
      text: b.bannerText || "",
      image: src(b.bannerImage),
    },
    faqs: page.serviceFaqFields?.faqs || [],
  };
}

export async function getPageHeader(slug) {
  const { pageHeaderFields: h = {} } = await getPage(slug, "pageHeaderFields { heading subtitle }");
  return { heading: h.heading || "", subtitle: h.subtitle || "" };
}

export async function getContact() {
  const { contactFields: c = {} } = await getPage(
    "contact",
    `contactFields { heroHeading heroImage { ${IMAGE} } scrollLabel formHeading }`
  );
  return {
    heroHeading: c.heroHeading || "",
    heroImage: src(c.heroImage),
    scrollLabel: c.scrollLabel || "",
    formHeading: c.formHeading || "",
  };
}

export async function getSiteSettings() {
  const data = await wpQuery(
    `{ siteSettings { siteSettingsFields {
      email phone phoneLink address locationUrl whatsappUrl facebookUrl instagramUrl
      ctaHeading footerBlurb companyLine
    } } }`
  );
  const s = data.siteSettings?.siteSettingsFields || {};
  return {
    email: s.email || "",
    phone: s.phone || "",
    phoneLink: s.phoneLink || "",
    address: s.address || "",
    locationUrl: s.locationUrl || "#",
    whatsappUrl: s.whatsappUrl || "#",
    facebookUrl: s.facebookUrl || "#",
    instagramUrl: s.instagramUrl || "#",
    ctaHeading: s.ctaHeading || "",
    footerBlurb: s.footerBlurb || "",
    companyLine: s.companyLine || "",
  };
}

export async function getWorks() {
  const data = await wpQuery(`{ works(first: 100) { nodes { ${WORK} } } }`);
  return (data.works?.nodes || []).map(normalizeWork).sort(byNewest);
}

export async function getWork(slug) {
  const data = await wpQuery(
    `query Work($slug: ID!) { work(id: $slug, idType: SLUG) { ${WORK_FULL} } }`,
    { slug }
  );
  return data.work ? normalizeWork(data.work) : null;
}

// Works delivered as a given service (by service term slug), as slides
export const worksForService = (works, service) =>
  works
    .filter((w) => w.variants.some((v) => v.service === service))
    .map((w) => projectSlide(w, service));

export async function getPosts() {
  const data = await wpQuery(`{ posts(first: 100) { nodes { ${POST} } } }`);
  return (data.posts?.nodes || []).map(normalizePost).sort(byNewest);
}

export async function getPost(slug) {
  const data = await wpQuery(
    `query Post($slug: ID!) { post(id: $slug, idType: SLUG) { ${POST} content } }`,
    { slug }
  );
  return data.post ? normalizePost(data.post) : null;
}
