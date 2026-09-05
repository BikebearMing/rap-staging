import Link from "next/link";
import WindLeaf from "@/components/WindLeaf";
import { getSiteSettings } from "@/lib/wp";

// Site footer. Contact details, social links and copy come from the Site
// Settings options page in WordPress; the link columns are placeholder
// until their pages exist.
const footerLinks = [
  {
    heading: "Our Services",
    links: ["Event Designs", "Landscaping", "Rent a Plant", "Maintainance"],
  },
  {
    heading: "Customer Service",
    links: ["FAQ", "Delivery & Refund", "Terms & Conditions", "Privacy Policy"],
  },
  {
    heading: "Rent A Pot",
    links: ["Our Works", "Specialty", "Blog", "Contact"],
  },
];

export default async function Footer() {
  const site = await getSiteSettings();

  return (
    <footer className="site-footer">
      <WindLeaf />
      <div className="footer-cta">
        <p className="h4" data-text-reveal="lift">
          {site.ctaHeading}
        </p>
        <a href={`mailto:${site.email}`} className="footer-email" data-text-reveal="lift">
          {site.email}
        </a>

        <div className="footer-actions">
          <a href={site.whatsappUrl} className="footer-action">
            <span className="icon-button footer-action-icon">
              <span className="icon icon-whatsapp" aria-hidden="true" />
            </span>
            <span className="button-label">Let&rsquo;s Talk on WhatsApp</span>
          </a>

          <a href={site.locationUrl} className="footer-action">
            <span className="icon-button footer-action-icon">
              <span className="icon icon-location" aria-hidden="true" />
            </span>
            <span className="button-label">Where Are We Located?</span>
          </a>

          <Link href="/works" className="footer-action">
            <span className="icon-button footer-action-icon">
              <span className="icon icon-works" aria-hidden="true" />
            </span>
            <span className="button-label">View Our Works</span>
          </Link>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-logo" aria-label="Rent A Pot home">
            <span className="logo" />
          </Link>
          <p className="body footer-blurb" data-text-reveal="flip">
            {site.footerBlurb}
          </p>
          <div className="footer-social">
            <span className="button-label" data-text-reveal="lift">
              Follow Us On
            </span>
            <a
              href={site.facebookUrl}
              className="social-button social-facebook"
              aria-label="Facebook"
            >
              <img src="/facebook.svg" alt="" />
            </a>
            <a
              href={site.instagramUrl}
              className="icon-button social-button"
              aria-label="Instagram"
            >
              <span className="icon icon-instagram" aria-hidden="true" />
            </a>
          </div>
        </div>

        <nav className="footer-columns" aria-label="Footer">
          {footerLinks.map((col) => (
            <div className="footer-col" key={col.heading}>
              <p className="button-label" data-text-reveal="lift">
                {col.heading}
              </p>
              <ul data-text-reveal="flip">
                {col.links.map((label) => (
                  <li key={label}>
                    <a href="#" className="body">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer-bottom" data-line data-line-start="top 100%">
          <p className="body" data-text-reveal="flip" data-text-reveal-start="top 100%">
            Copyright {new Date().getFullYear()} &copy; {site.companyLine}
          </p>
        </div>
      </div>
    </footer>
  );
}
