import Button from "@/components/Button";
import Heading, { Lines } from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import WindLeaf from "@/components/WindLeaf";
import { getHome } from "@/lib/wp";

// Home page. Content comes from the Home Page field group in WordPress.
export default async function Home() {
  const { hero, history, servicesHeading, services, projects } = await getHome();

  return (
    <main>
      <section className="home-banner" data-flatten>
        <div className="slider-container embla has-parallax">
          <Heading
            as="h1"
            className="h1 dark"
            text={hero.heading}
            highlight={hero.highlight}
            trigger=".home-banner"
            delay="1.5"
          />

          <h2 className="body dark" data-text-reveal="flip">
            <Lines text={hero.text} /> <br />
            <br />
            Scroll to Explore <span className="arrow"></span>
          </h2>

          <div className="embla__viewport">
            <div className="embla__container">
              {hero.slides.map((src) => (
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
            <Lines text={history.label} />
          </h3>

          <div className="content">
            <span
              className="history-image has-parallax parallax-frame"
              data-inline-pop
              data-parallax-trigger=".home-history"
              aria-hidden="true"
            >
              <img src={history.image} alt="" className="parallax-image" />
            </span>
            <Heading
              as="h4"
              className="h2"
              text={history.heading}
              highlight={history.highlight}
              trigger=".home-history"
              delay="1.3"
            />

            {history.buttonLabel && (
              <Button href={history.buttonHref}>{history.buttonLabel}</Button>
            )}
          </div>
        </div>
      </section>

      <section className="home-services">
        <h4 className="h4 services-header">
          <span data-text-reveal="lift">{servicesHeading}</span>
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
                    <Button href={service.href}>LEARN MORE</Button>
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

      <ProjectsSlider projects={projects} />
    </main>
  );
}
