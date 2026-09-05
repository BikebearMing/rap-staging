import Link from "next/link";

export const metadata = {
  title: "Contact | Rent-A-Pot",
  description: "Let's grow a greener space together.",
};

// Contact page. Details are placeholder until they come from WordPress and
// the form is plain HTML until Gravity Forms replaces it.
export default function Contact() {
  return (
    <main className="contact-page">
      <section className="contact-hero has-parallax">
        <div className="contact-hero-bg parallax-frame">
          <img src="/contact-bg.jpg" alt="" className="parallax-image" />
        </div>

        <div className="contact-card">
          <p className="h4" data-text-reveal="lift">
            Let&rsquo;s Grow a Greener Space Together
          </p>
          <a href="mailto:sayhello@rap.com.my" className="footer-email" data-text-reveal="lift">
            sayhello@rap.com.my
          </a>

          <div className="contact-info" data-line data-line-start="top 100%">
            <p className="body" data-text-reveal="flip">
              B-G-33, Prima Avenue, Jalan PJU 1/39, Dataran
              <br />
              Prima, 47301 Petaling Jaya, Selangor
            </p>
            <a href="tel:+60376224256" className="body" data-text-reveal="flip">
              03 - 7622 4256
            </a>

            <div className="contact-social">
              <div className="contact-social-buttons">
                <a href="#" className="icon-button social-button" aria-label="Location">
                  <span className="icon icon-location" aria-hidden="true" />
                </a>
                <a href="#" className="icon-button social-button" aria-label="Facebook">
                  <span className="icon icon-facebook" aria-hidden="true" />
                </a>
                <a href="#" className="icon-button social-button" aria-label="Instagram">
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
          Scroll to fill form <span className="icon icon-arrow" aria-hidden="true" />
        </p>
      </section>

      <section className="contact-form-section">
        <img src="/hanging-plant.png" alt="" className="contact-plant" />

        <h2 className="projects-heading" data-text-reveal="lift">
          Had an Idea? Let&rsquo;s work it out together.
        </h2>

        {/* Gravity Forms will replace this markup */}
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
