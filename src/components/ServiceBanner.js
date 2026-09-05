import Heading, { Lines } from "@/components/Heading";

// Banner at the top of every service page, from the Service Page Banner
// field group (.service-banner in custom.css). banner is { heading,
// highlight, text, image } as returned by getServicePage.
export default function ServiceBanner({ banner }) {
  return (
    <section className="service-banner has-parallax" data-flatten>
      <div className="service-banner-media parallax-frame">
        <img src={banner.image} alt="" className="parallax-image" />
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
