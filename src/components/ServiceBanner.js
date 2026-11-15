import Heading, { Lines } from "@/components/Heading";
import Img from "@/components/Img";

// Banner at the top of every service page, from the Service Page Banner
// field group (.service-banner in custom.css). banner is { heading,
// highlight, text, image } as returned by getServicePage.
export default function ServiceBanner({ banner }) {
  return (
    <section className="service-banner has-parallax" data-flatten>
      <div className="service-banner-media parallax-frame">
        {/* Full screen at 120% height: on a phone the photo is cropped to
            its middle and would show about 3x the screen's width. sizes
            allows 1.5x, the most PageSpeed accepts before it counts the
            cropped-off part as waste; quality 60 like every full-screen
            photo. The page's first paint, so priority. */}
        <Img
          image={banner.image}
          alt={banner.heading.replace(/\s+/g, " ").trim()}
          sizes="(max-width: 768px) 150vw, 100vw"
          quality={60}
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
        data-text-reveal-painted
      />

      <p className="body dark" data-text-reveal="flip">
        <Lines text={banner.text} /> <br />
        <br />
        Scroll to Explore <span className="arrow"></span>
      </p>
    </section>
  );
}
