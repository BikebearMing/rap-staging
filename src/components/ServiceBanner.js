import Heading, { Lines } from "@/components/Heading";
import Img from "@/components/Img";

// Banner at the top of every service page, from the Service Page Banner
// field group (.service-banner in custom.css). banner is { heading,
// highlight, text, image } as returned by getServicePage.
export default function ServiceBanner({ banner }) {
  return (
    <section className="service-banner has-parallax" data-flatten>
      <div className="service-banner-media parallax-frame">
        {/* Full screen at 120% height: on a phone the photo shows about
            2.3x the screen's width. The page's first paint, so priority. */}
        <Img
          image={banner.image}
          alt={banner.heading.replace(/\s+/g, " ").trim()}
          sizes="(max-width: 768px) 230vw, 100vw"
          priority
          className="parallax-image"
        />
      </div>

      <Heading
        as="h1"
        className="h1 dark"
        text={banner.heading}
        highlight={banner.highlight}
        trigger=".service-banner"
        delay="1.5"
      />

      <p className="body dark" data-text-reveal="flip">
        <Lines text={banner.text} /> <br />
        <br />
        Scroll to Explore <span className="arrow"></span>
      </p>
    </section>
  );
}
