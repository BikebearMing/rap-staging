import Link from "next/link";
import Heading, { Lines } from "@/components/Heading";
import Img from "@/components/Img";
import ServiceWhere from "@/components/ServiceWhere";
import { getContact, getSiteSettings } from "@/lib/wp";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMeta({
  path: "/contact",
  title: "Contact Us | Rent-A-Pot Malaysia",
  description:
    "Contact Rent-A-Pot for plant rental, landscaping, event greenery or garden maintenance in Malaysia. Request a site visit and free quote.",
});

// Contact page. Copy comes from the Contact Page field group and the
// details from Site Settings; the form is plain HTML until a form plugin
// replaces it.
export default async function Contact() {
  const [contact, site] = await Promise.all([getContact(), getSiteSettings()]);

  return (
    <main className="contact-page">
      <JsonLd data={breadcrumbSchema([{ name: "Contact", path: "/contact" }])} />
      <section className="contact-hero has-parallax">
        <div className="contact-hero-bg parallax-frame">
          {/* Fills the hero at 120% height: on a phone the photo shows about
              1.8x the screen's width */}
          <Img
            image={contact.heroImage}
            alt={contact.heroHeading.replace(/\s+/g, " ").trim()}
            sizes="(max-width: 768px) 176vw, 100vw"
            priority
            className="parallax-image"
          />
        </div>

        <div className="contact-card">
          <h1 className="h4" data-text-reveal="lift">
            {contact.heroHeading}
          </h1>
          <a href={`mailto:${site.email}`} className="footer-email" data-text-reveal="lift">
            {site.email}
          </a>

          <div className="contact-info" data-line data-line-start="top 100%">
            <p className="body" data-text-reveal="flip">
              <Lines text={site.address} />
            </p>
            <p className="body phone-list" data-text-reveal="flip">
              {site.phones.map((phone) => (
                <a href={`tel:${phone.tel}`} key={phone.tel}>
                  {phone.label}
                </a>
              ))}
            </p>

            <div className="contact-social">
              <div className="contact-social-buttons">
                <a
                  href={site.locationUrl}
                  className="icon-button social-button"
                  aria-label="Location"
                >
                  <span className="icon icon-location" aria-hidden="true" />
                </a>
                <a
                  href={site.facebookUrl}
                  className="icon-button social-button"
                  aria-label="Facebook"
                >
                  <span className="icon icon-facebook" aria-hidden="true" />
                </a>
                <a
                  href={site.instagramUrl}
                  className="icon-button social-button"
                  aria-label="Instagram"
                >
                  <span className="icon icon-instagram" aria-hidden="true" />
                </a>
              </div>
              <Link href="/" className="contact-logo" aria-label="Rent A Pot home">
                <span className="logo" />
              </Link>
            </div>
          </div>
        </div>

        <p className="contact-scroll">
          {contact.scrollLabel} <span className="icon icon-arrow" aria-hidden="true" />
        </p>
      </section>

      {/* The hanging plant overlaps the panel's top-right corner. It and the
          leaves are lazy: below the fold, and a non-lazy <img> is preloaded
          by every page that prefetches this one (see Img.js). */}
      <div className="contact-where">
        <ServiceWhere where={contact.where} />
        <img
          src="/hanging-plant.png"
          alt=""
          className="contact-plant"
          loading="lazy"
          width="164"
          height="280"
        />
      </div>

      <section className="contact-form-section">
        <Heading
          className="h2"
          text={contact.formHeading}
          highlight={contact.formHighlight}
          trigger=".contact-form-section"
        />

        {/* A form plugin will replace this markup */}
        <form className="contact-form" method="post">
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Name"
              aria-label="Name"
              className="contact-field"
              required
            />
            <input
              type="text"
              name="company"
              placeholder="Company"
              aria-label="Company"
              className="contact-field"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              aria-label="Phone"
              className="contact-field"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email"
              className="contact-field"
              required
            />
            {/* required + an empty first option: :invalid styles it as a placeholder */}
            <select
              name="service"
              aria-label="Service needed"
              className="contact-field contact-select"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Service needed
              </option>
              {contact.formServices.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
            <input
              type="text"
              name="location"
              placeholder="Site Location"
              aria-label="Site Location"
              className="contact-field"
            />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            aria-label="Message"
            className="contact-field contact-message"
            rows="1"
            required
          />
          <button type="submit" className="contact-submit">
            <span>Let&rsquo;s Connect</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
        </form>

        <img
          src="/bottom-right-leaves.png"
          alt=""
          className="contact-leaves"
          loading="lazy"
          width="264"
          height="288"
        />
      </section>
    </main>
  );
}
