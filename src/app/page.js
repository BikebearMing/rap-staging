import Button from "@/components/Button";
import WindLeaf from "@/components/WindLeaf";

// Home banner slides (see /public).
const heroSlides = [
  "/hp-banner-1.jpg",
  "/slider-2.jpg",
  "/slider-3.jpg",
  "/slider-4.jpg",
  "/slider-5.jpg",
];

// Services stack content. Placeholder until it comes from WordPress.
const services = [
  {
    title: "Event Design",
    project: "INNISFREE x Steve Harrington: The Isle Adventure",
    image: "/slider-2.jpg",
  },
  {
    title: "Landscaping",
    project: "Desa 8 Condo Landscape Design in Taman Desa",
    image: "/service-image-2.jpg",
  },
  {
    title: "Plant Rental",
    project: "Placeholder project name",
    image: "/slider-5.jpg",
  },
];

// Projects slider content. Placeholder until it comes from WordPress.
const projects = [
  {
    title: "Plant Decoration @WOLO KL",
    date: "June 2026",
    tag: "Landscape",
    image: "/service-image-2.jpg",
  },
  {
    title: "Hyatt Regency KL Midtown Farm Style Grazing Table Design",
    date: "May 2026",
    tag: "Event",
    image: "/hp-banner-1.jpg",
  },
  {
    title: "Placeholder Project Three",
    date: "April 2026",
    tag: "Landscape",
    image: "/service-image-2.jpg",
  },
  {
    title: "Placeholder Project Four",
    date: "March 2026",
    tag: "Event",
    image: "/hp-banner-1.jpg",
  },
];

export default function Home() {
  return (
    <main>
      <section className="home-banner" data-flatten>
        <div className="slider-container embla has-parallax">
          <h1 className="h1 dark" data-text-reveal="lift">
            We Bring <br /> Spaces to{" "}
            <span
              className="squiggle"
              data-wipe="var"
              data-wipe-trigger=".home-banner"
              data-wipe-delay="1.5"
            >
              Life
            </span>
          </h1>

          <h2 className="body dark" data-text-reveal="flip">
            We bring nature into everyday environments through beautifully designed greenery that
            elevates the atmosphere of every space. <br />
            <br />
            Scroll to Explore <span className="arrow"></span>
          </h2>

          <div className="embla__viewport">
            <div className="embla__container">
              {heroSlides.map((src) => (
                <div className="embla__slide" key={src}>
                  <img src={src} alt="" className="parallax-image" />
                </div>
              ))}
            </div>
          </div>
          <div className="embla__dots"></div>
        </div>
      </section>

      <section className="home-history">
        <WindLeaf />
        <div className="wrapper">
          <h3 className="body" data-text-reveal="flip">
            Rent a pot <br /> Est. <br /> 1982
          </h3>

          <div className="content">
            <span
              className="history-image has-parallax parallax-frame"
              data-inline-pop
              data-parallax-trigger=".home-history"
              aria-hidden="true"
            >
              <img src="/history-image.png" alt="" className="parallax-image" />
            </span>
            <h4 className="h2" data-text-reveal="lift">
              Since 1982, we’ve helped businesses, events, and commercial spaces transform{" "}
              <span
                className="squiggle"
                data-wipe="var"
                data-wipe-trigger=".home-history"
                data-wipe-delay="1.3"
              >
                ordinary
              </span>{" "}
              environments into vibrant, welcoming destinations.
            </h4>

            <Button>ABOUT US</Button>
          </div>
        </div>
      </section>

      <section className="home-services">
        <h4 className="h4 services-header">
          <span data-text-reveal="lift">Our Services</span>
          <span className="services-arrow" aria-hidden="true" />
        </h4>

        <div className="services-stack">
          {services.map((service) => (
            <div className="service-slide" key={service.title}>
              <div className="service-pin" data-parallax-pinned>
                <article className="service-card has-parallax">
                  <img src={service.image} alt="" className="parallax-image" />

                  <div
                    className="service-meta dark"
                    data-line
                    data-line-trigger=".service-card"
                    data-line-start="bottom 105%"
                  >
                    <p className="service-label">Featured Project</p>
                    <p className="body" data-text-reveal="flip">
                      {service.project}
                    </p>
                  </div>

                  <div className="service-title dark">
                    <h3 className="h2" data-text-reveal="lift">
                      {service.title}
                    </h3>
                    <Button>LEARN MORE</Button>
                  </div>

                  <p className="body service-scroll dark" data-text-reveal="flip">
                    Scroll to Explore <span className="arrow"></span>
                  </p>
                </article>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-projects">
        <div className="projects-header">
          <div className="projects-title">
            <h2 className="projects-heading" data-text-reveal="lift">
              Our Projects
            </h2>
            <span
              className="projects-scribble"
              data-wipe
              data-wipe-trigger=".projects-title"
              data-wipe-delay="0.6"
              aria-hidden="true"
            />
          </div>

          <div className="projects-actions">
            <Button>VIEW ALL WORKS</Button>
          </div>
        </div>

        <div className="projects-slider">
          <div className="projects-track">
            {projects.map((project, i) => (
              <article
                className={`project-slide has-parallax${i === 0 ? " is-main" : ""}`}
                data-parallax-trigger=".projects-slider"
                key={project.title}
              >
                <div className="project-media parallax-frame">
                  <img src={project.image} alt="" className="parallax-image" />
                  <span className="project-tag">{project.tag}</span>
                </div>
                <div className="project-caption">
                  <div>
                    <h3 className="h4 project-title">{project.title}</h3>
                    <p className="body grey">{project.date}</p>
                  </div>
                  <a href="#" className="button-arrow project-link" aria-label="View project" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
