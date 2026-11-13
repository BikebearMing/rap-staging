// WordPress data layer. Everything on the site comes from the headless
// WordPress at WORDPRESS_GRAPHQL_URL, cms.rap.com.my by default (WPGraphQL +
// Secure Custom Fields, see the field groups under SCF in wp-admin, and Yoast
// SEO for each post's and work's SEO title and meta description). Responses
// are cached for a minute and tagged "wordpress" so POST /api/revalidate can
// flush them on demand.

import { getImageProps } from "next/image";

// index.php?graphql rather than the pretty /graphql on purpose: the CMS
// server's firewall answers 403 to some query bodies on /graphql (the posts
// list among them) and lets the identical request through on this form.
const ENDPOINT = process.env.WORDPRESS_GRAPHQL_URL || "https://cms.rap.com.my/index.php?graphql";

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
  about: 381,
};

export async function wpQuery(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60, tags: ["wordpress"] },
  });
  if (!res.ok) throw new Error(`WordPress responded ${res.status} for ${ENDPOINT}`);
  // A broken WordPress redirects to an HTML page with a 200, so check before parsing.
  const type = res.headers.get("content-type") || "";
  if (!type.includes("json")) {
    throw new Error(
      `WordPress returned ${type || "no content-type"} instead of JSON from ${ENDPOINT} (landed on ${res.url})`
    );
  }
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors.map((e) => e.message).join("\n"));
  return data;
}

// ---- Selections ----------------------------------------------------------

// A media item as the site renders it: the file, its Alt text and the
// original's size (see imageFrom). The service pages use IMAGE in their own
// page selections.
const MEDIA = "sourceUrl altText mediaDetails { width height }";
export const IMAGE = `node { ${MEDIA} }`;
const IMAGES = `nodes { ${MEDIA} }`;

export const SERVICE_BANNER = `serviceBannerFields { bannerHeading bannerHighlight bannerText bannerImage { ${IMAGE} } }`;
export const SERVICE_FAQ = "serviceFaqFields { faqs { question answer } }";

// Sections shared by the service pages and contact. Each page's own field
// group carries the same field names, so these drop into any of them; the
// matching normalisers are processFrom, costsFrom and whereFrom below.
export const PROCESS_FIELDS = "processHeading processHighlight processSteps { title text }";
export const COSTS_FIELDS = `costsHeading costsHighlight costsText costsCards { title price image { ${IMAGE} } }`;
export const WHERE_FIELDS = "whereLabel whereGroups { heading note areas rows }";

// Plant rental only: the packages and "Plants we offer" sections; the
// normalisers are packagesFrom and offerFrom below.
export const PACKAGES_FIELDS =
  "packagesHeading packagesHighlight packagesText packagesListLabel packagesList packages { title plants price note detail }";
export const OFFER_FIELDS =
  // caption must be the rendered format: WPGraphQL returns RAW as null to
  // the public, and the site queries unauthenticated. stripTags in offerFrom
  // removes the <p> wrapper.
  `offerHeading offerHighlight offerImages { nodes { caption ${MEDIA} } }`;

const WORK = `
  title slug date
  seo { title metaDesc }
  workTags { nodes { name } }
  featuredImage { ${IMAGE} }
  workFields {
    projectDate description
    variants { service { nodes { name slug } } image { ${IMAGE} } }
  }
`;
const WORK_FULL = `${WORK} workFields { overview { paragraph } gallery { ${IMAGES} } projectStory }`;

const POST = `title slug date excerpt isSticky seo { title metaDesc } featuredImage { ${IMAGE} } categories { nodes { slug } }`;

// ---- Normalisers ---------------------------------------------------------

// An image field as { src, alt, width, height }, the shape <Img> renders.
// alt is the media item's Alt text, "" when none was entered (each caller
// then supplies its own fallback). width and height are the uploaded
// file's, 0 when WordPress doesn't know them (e.g. HEIC uploads). A field
// with no image gives src "" and renders nothing.
const image = (node) => ({
  src: node?.sourceUrl || "",
  alt: node?.altText || "",
  width: node?.mediaDetails?.width || 0,
  height: node?.mediaDetails?.height || 0,
});
export const imageFrom = (edge) => image(edge?.node);
const imagesFrom = (conn) => (conn?.nodes || []).filter((n) => n.sourceUrl).map(image);
const first = (conn) => conn?.nodes?.[0] || null;

// A textarea with one entry per line, or paragraphs split by an empty line
const lines = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
const paragraphs = (text) =>
  String(text || "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

// Props for ServiceProcess, ServiceCosts and ServiceWhere from a page's fields
export const processFrom = (fields = {}) => ({
  heading: fields.processHeading || "",
  highlight: fields.processHighlight || "",
  steps: (fields.processSteps || []).map((step) => ({
    title: step.title || "",
    text: step.text || "",
  })),
});
export const costsFrom = (fields = {}) => ({
  heading: fields.costsHeading || "",
  highlight: fields.costsHighlight || "",
  text: paragraphs(fields.costsText),
  cards: (fields.costsCards || []).map((card) => ({
    title: card.title || "",
    price: card.price || "",
    image: imageFrom(card.image),
  })),
});
export const whereFrom = (fields = {}) => ({
  label: fields.whereLabel || "",
  groups: (fields.whereGroups || []).map((group) => ({
    heading: group.heading || "",
    note: group.note || "",
    areas: lines(group.areas),
    columns: group.rows || 0, // rows deep; 0 is one long column
  })),
});

// Props for ServicePackages and ServiceOffer (plant rental page)
export const packagesFrom = (fields = {}) => ({
  heading: fields.packagesHeading || "",
  highlight: fields.packagesHighlight || "",
  text: paragraphs(fields.packagesText),
  listLabel: fields.packagesListLabel || "",
  list: lines(fields.packagesList),
  items: (fields.packages || []).map((card) => ({
    title: card.title || "",
    plants: card.plants || "",
    price: card.price || "",
    note: card.note || "",
    detail: card.detail || "",
  })),
});
export const offerFrom = (fields = {}) => ({
  heading: fields.offerHeading || "",
  highlight: fields.offerHighlight || "",
  // The card label is the image's Caption in the media library
  images: (fields.offerImages?.nodes || []).map((node) => ({
    ...image(node),
    label: stripTags(node.caption),
  })),
});

// One tap-to-call link per number in "Phone (as shown)", split on " / " or
// newlines. The tel: is built from the digits (a leading 0 becomes +60);
// `override` is the old single "Phone (tel: link)" field, honoured when
// there is only one number.
const telFor = (label) => {
  let digits = label.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `60${digits.slice(1)}`;
  return `+${digits}`;
};
const phones = (text, override) => {
  const labels = lines(text)
    .flatMap((l) => l.split("/"))
    .map((s) => s.trim())
    .filter(Boolean);
  return labels.map((label) => ({
    label,
    tel: labels.length === 1 && override ? override : telFor(label),
  }));
};

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

// WordPress "rendered" text (titles, excerpts, captions) comes entity-encoded
// (&#8216; etc). React prints entities literally, so decode them all here:
// numeric ones generically, plus the named ones WP emits.
const NAMED_ENTITIES = { amp: "&", nbsp: " ", quot: '"', lt: "<", gt: ">", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—" }; // prettier-ignore
const stripTags = (html) =>
  (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(num))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\[…\]/g, "…")
    .trim();

export function normalizeWork(node) {
  const f = node.workFields || {};
  const featuredImage = imageFrom(node.featuredImage);
  const variantImages = (f.variants || []).map((v) => imageFrom(v.image));
  return {
    slug: node.slug,
    title: stripTags(node.title),
    date: monthYear(f.projectDate),
    year: year(f.projectDate),
    sortKey: f.projectDate || node.date || "",
    featuredImage,
    variants: (f.variants || []).map((v, i) => ({
      category: first(v.service)?.name || "",
      service: first(v.service)?.slug || "",
      // Fall back like projectSlide: variant rows often have no photo yet
      image:
        [variantImages[i], featuredImage, ...variantImages].find((img) => img.src) ||
        variantImages[i],
    })),
    seoTitle: stripTags(node.seo?.title),
    seoDescription: stripTags(node.seo?.metaDesc),
    tags: (node.workTags?.nodes || []).map((t) => t.name),
    description: f.description || "",
    overview: (f.overview || []).map((o) => o.paragraph).filter(Boolean),
    gallery: imagesFrom(f.gallery),
    // Editor HTML (the Project Story field), "" when not written yet. Its
    // images are as wide as .work-story.
    story: optimiseImages(httpsCms(f.projectStory || ""), "(max-width: 768px) 88vw, 66vw"),
  };
}

// Editor HTML can carry http:// links to the CMS's own uploads (the image
// block keeps whatever address the media library had when it was inserted).
// On the https site those are mixed content, so point them at https; links
// to any other site are left alone.
const CMS_HOST = new URL(ENDPOINT).host;
const httpsCms = (html) => html.replaceAll(`http://${CMS_HOST}/`, `https://${CMS_HOST}/`);

// Editor HTML's <img> tags load the WordPress originals (a post's one photo
// was a 773 KB PNG). This sends every one from the CMS's uploads through the
// image optimiser, like <Img>: getImageProps builds src/srcset from
// next.config.mjs, so the widths and quality are always ones the optimiser
// accepts. sizes is how wide the images show (the content column). The tag
// keeps every other attribute as written (alt, class, width, height...);
// loading/decoding become lazy/async.
//
// Not a full HTML parser: WordPress writes regular <img> tags, so the
// attributes are read with a strict pattern, and a tag that doesn't read
// cleanly, or isn't from the uploads, is left exactly as it was. Checked by
// scripts/check-wp-images.mjs (node scripts/check-wp-images.mjs).
const UPLOADS = `https://${CMS_HOST}/wp-content/uploads/`;
const IMG_TAG = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const ATTR = /\s+([a-z][\w:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/iy;
const fromUploads = (url) => url.startsWith(UPLOADS) && !/[\s"'<>&,]/.test(url);
const escapeAttr = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

const optimiseImg = (tag, sizes) => {
  const inner = tag.slice(4).replace(/\s*\/?>$/, "");
  const attrs = new Map();
  const kept = [];
  ATTR.lastIndex = 0;
  while (ATTR.lastIndex < inner.length) {
    const m = ATTR.exec(inner);
    if (!m) return tag;
    const name = m[1].toLowerCase();
    if (attrs.has(name)) return tag;
    attrs.set(name, m[2] ?? m[3] ?? m[4] ?? "");
    if (!["src", "srcset", "sizes", "loading", "decoding"].includes(name)) kept.push(m[0]);
  }

  const src = attrs.get("src") || "";
  if (!fromUploads(src)) return tag;

  // WordPress lists the sizes it made in srcset, the original among them.
  // The widest is the best source: the optimiser can only scale down.
  let best = { url: src, w: 0 };
  for (const candidate of (attrs.get("srcset") || "").split(",").filter((c) => c.trim())) {
    const parts = candidate.trim().split(/\s+/);
    const w = /^(\d+)w$/.exec(parts[1] || "")?.[1];
    if (parts.length !== 2 || !w || !fromUploads(parts[0])) return tag;
    if (+w > best.w) best = { url: parts[0], w: +w };
  }

  // width/height only shape the box, which the tag's own attributes still
  // set; getImageProps just needs numbers.
  const width = parseInt(attrs.get("width"), 10) || 1920;
  const height = parseInt(attrs.get("height"), 10) || 1080;
  const { props } = getImageProps({ src: best.url, alt: "", width, height, sizes });
  const added = { src: props.src, srcset: props.srcSet, sizes: props.sizes };
  const out = Object.entries(added).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`);
  return `<img${kept.join("")}${out.join("")} loading="lazy" decoding="async"${tag.endsWith("/>") ? " />" : ">"}`;
};
const optimiseImages = (html, sizes) => html.replace(IMG_TAG, (tag) => optimiseImg(tag, sizes));

export function normalizePost(node) {
  return {
    slug: node.slug,
    title: stripTags(node.title),
    date: longDate(node.date),
    sortKey: node.date || "",
    image: imageFrom(node.featuredImage),
    excerpt: stripTags(node.excerpt),
    // Category slugs; the categories are named after the services
    categories: (node.categories?.nodes || []).map((c) => c.slug),
    featured: !!node.isSticky,
    seoTitle: stripTags(node.seo?.title),
    seoDescription: stripTags(node.seo?.metaDesc),
    // Editor HTML; its images are as wide as .post-body's column
    content: optimiseImages(httpsCms(node.content || ""), "(max-width: 768px) 88vw, 74vw"),
  };
}

// A work as a slide for ProjectsSlider. `service` picks which variant's tag
// to show. For now every slide picks its photo like the homepage slider: the
// work's Featured Image, then any variant row that has a photo. (Per-service
// photos — the variant row's own image winning on its service page — were
// benched on request until the content is tidied; restore by putting
// variant.image back in front for the `service` case.)
export function projectSlide(work, service) {
  const variant = work.variants.find((v) => v.service === service) || work.variants[0] || {};
  const image = work.featuredImage.src ? work.featuredImage : work.variants[0]?.image;
  return {
    title: work.title,
    date: work.date,
    tag: variant.category || "",
    image: image || work.featuredImage,
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
      historyLabel historyImage { ${IMAGE} } historyHeading historyHighlight historyText
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
      slides: imagesFrom(h.heroSlides),
    },
    history: {
      label: h.historyLabel || "",
      image: imageFrom(h.historyImage),
      heading: h.historyHeading || "",
      highlight: h.historyHighlight || "",
      text: paragraphs(h.historyText),
      buttonLabel: h.historyButtonLabel || "",
      buttonHref: localPath(first(h.historyButtonLink)?.uri),
    },
    servicesHeading: h.servicesHeading || "Our Services",
    services: (h.services || []).map((s) => ({
      title: s.title || "",
      project: first(s.featuredWork)?.title || "",
      image: imageFrom(s.image),
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
      image: imageFrom(b.bannerImage),
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
    `contactFields { heroHeading heroImage { ${IMAGE} } scrollLabel formHeading formHighlight formServices ${WHERE_FIELDS} }`
  );
  return {
    heroHeading: c.heroHeading || "",
    heroImage: imageFrom(c.heroImage),
    scrollLabel: c.scrollLabel || "",
    formHeading: c.formHeading || "",
    formHighlight: c.formHighlight || "",
    formServices: lines(c.formServices),
    where: whereFrom(c),
  };
}

export async function getAbout() {
  const { aboutFields: a = {} } = await getPage(
    "about",
    `aboutFields {
      heroLabel heroHeading heroHighlight heroText heroImage { ${IMAGE} } scrollLabel
      introHeading introHighlight introText introImage { ${IMAGE} } introCaption
      timelineLabel timelineItems { year title text }
      peopleHeading people { name role photo { ${IMAGE} } bio }
      beliefsHeading beliefs { icon title text }
      blogsHeading
    }`
  );
  return {
    hero: {
      label: a.heroLabel || "",
      heading: a.heroHeading || "",
      highlight: a.heroHighlight || "",
      text: a.heroText || "",
      image: imageFrom(a.heroImage),
      scrollLabel: a.scrollLabel || "",
    },
    intro: {
      heading: a.introHeading || "",
      highlight: a.introHighlight || "",
      text: paragraphs(a.introText),
      image: imageFrom(a.introImage),
      caption: a.introCaption || "",
    },
    timeline: {
      label: a.timelineLabel || "",
      items: (a.timelineItems || []).map((item) => ({
        year: item.year || "",
        title: item.title || "",
        text: item.text || "",
      })),
    },
    people: {
      heading: a.peopleHeading || "",
      items: (a.people || []).map((person) => ({
        name: person.name || "",
        role: person.role || "",
        photo: imageFrom(person.photo),
        bio: paragraphs(person.bio),
      })),
    },
    beliefs: {
      heading: a.beliefsHeading || "",
      // The Icon select names a /public/*.svg (see .icon-* in custom.css)
      items: (a.beliefs || []).map((belief) => ({
        icon: `icon-${Array.isArray(belief.icon) ? belief.icon[0] : belief.icon}`,
        title: belief.title || "",
        text: belief.text || "",
      })),
    },
    blogsHeading: a.blogsHeading || "",
  };
}

export async function getSiteSettings() {
  const data = await wpQuery(
    `{ siteSettings { siteSettingsFields {
      email phone phoneLink address locationUrl whatsappUrl facebookUrl instagramUrl tiktokUrl
      ctaHeading footerBlurb companyLine
    } } }`
  );
  const s = data.siteSettings?.siteSettingsFields || {};
  return {
    email: s.email || "",
    phones: phones(s.phone, s.phoneLink),
    address: s.address || "",
    locationUrl: s.locationUrl || "#",
    whatsappUrl: s.whatsappUrl || "#",
    facebookUrl: s.facebookUrl || "#",
    instagramUrl: s.instagramUrl || "#",
    tiktokUrl: s.tiktokUrl || "#",
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

// Three posts for a service page: the ones in the service's category (its
// slug) first, then the newest others to fill up. `posts` is getPosts()'s
// date order, so the picks only change when the posts do.
export const postsForService = (posts, service) => {
  const inService = (p) => p.categories.includes(service);
  return [...posts.filter(inService), ...posts.filter((p) => !inService(p))].slice(0, 3);
};

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
