import Link from "next/link";
import { Lines } from "@/components/Heading";
import { getContact, getSiteSettings } from "@/lib/wp";

export const metadata = {
  title: "Contact | Rent-A-Pot",
  description: "Let's grow a greener space together.",
};

// Contact page. Copy comes from the Contact Page field group and the
// details from Site Settings; the form is plain HTML until a form plugin
// replaces it.
export default async function Contact() {
  const [contact, site] = await Promise.all([getContact(), getSiteSettings()]);

  return (
    <main className="contact-page">
      <section className="contact-hero has-parallax">
        <div className="contact-hero-bg parallax-frame">
          <img src={contact.heroImage} alt="" className="parallax-image" />
        </div>

        <div className="contact-card">
          <p className="h4" data-text-reveal="lift">
            {contact.heroHeading}
          </p>
          <a href={`mailto:${site.email}`} className="footer-email" data-text-reveal="lift">
            {site.email}
          </a>

          <div className="contact-info" data-line data-line-start="top 100%">
            <p className="body" data-text-reveal="flip">
              <Lines text={site.address} />
            </p>
            <a href={`tel:${site.phoneLink}`} className="body" data-text-reveal="flip">
              {site.phone}
            </a>

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

      <section className="contact-form-section">
        <img src="/hanging-plant.png" alt="" className="contact-plant" />

        <h2 className="projects-heading" data-text-reveal="lift">
          {contact.formHeading}
        </h2>

        {/* A form plugin will replace this markup */}
        <form className="contact-form" method="post">
          <div className="form-row">
            <input type="text" name="name" placeholder="Name" className="contact-field" required />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="contact-field"
              required
            />
          </div>
          <textarea
            name="message"
            placeholder="Message"
            className="contact-field"
            rows="1"
            required
          />
          <button type="submit" className="contact-submit">
            <span>Let&rsquo;s Connect</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
        </form>

        <img src="/bottom-right-leaves.png" alt="" className="contact-leaves" />
      </section>
    </main>
  );
}
