import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Structured data (schema.org JSON-LD) shared across pages. The business
// entity has a fixed @id so every page's Service and breadcrumb data can
// point back to the same Rent-A-Pot rather than repeating its details.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const absolute = (path) => (path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`);

// Site Settings' address is free text, one line per row. The last line is
// read as "<postcode> <city>, <country>"; anything before it is the street.
function postalAddress(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ""))
    .filter(Boolean);
  if (!lines.length) return undefined;
  const last = lines[lines.length - 1].match(/^(\d{5})\s+([^,]+)/);
  return {
    "@type": "PostalAddress",
    streetAddress: (last ? lines.slice(0, -1) : lines).join(", "),
    ...(last && { postalCode: last[1], addressLocality: last[2].trim() }),
    addressCountry: "MY",
  };
}

// The business and the website, rendered once in the root layout from the
// WordPress Site Settings. Social links left as "#" there are skipped.
export function siteSchema(site) {
  const sameAs = [site.facebookUrl, site.instagramUrl, site.tiktokUrl].filter(
    (url) => url && url.startsWith("http")
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        legalName: "RAP Landscape Sdn Bhd",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        image: `${SITE_URL}/hp-banner-1.jpg`,
        description: SITE_DESCRIPTION,
        foundingDate: "1982",
        email: site.email || undefined,
        telephone: site.phones[0]?.tel || undefined,
        address: postalAddress(site.address),
        hasMap: site.locationUrl.startsWith("http") ? site.locationUrl : undefined,
        areaServed: { "@type": "Country", name: "Malaysia" },
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-MY",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

// One of the four services, provided by the business above
export function serviceSchema({ name, serviceType, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absolute(path)}#service`,
    name,
    serviceType,
    description,
    url: absolute(path),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: { "@type": "Country", name: "Malaysia" },
  };
}

// Home › ... trail. `items` excludes Home, which is always first; the last
// item is the current page.
export function breadcrumbSchema(items) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
