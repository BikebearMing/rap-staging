import BlogCard from "@/components/BlogCard";
import Button from "@/components/Button";
import Heading, { Lines } from "@/components/Heading";
import WindLeaf from "@/components/WindLeaf";
import { getAbout, getPosts } from "@/lib/wp";

export const metadata = {
  title: "About | Rent-A-Pot",
  description:
    "What started as one man's vision to bring nature into commercial spaces has grown into a second generation business shaping how Malaysia experiences plants, landscapes and green spaces.",
};

// The timeline strip is an Embla slider: no loop, cards run off the right
// edge and can be dragged freely (see initSliders in custom.js)
const emblaOptions = JSON.stringify({
  loop: false,
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
});

// About page. Copy comes from the About Page field group (.about-* in
// custom.css): hero, the intro beside the plant, the timeline strip, the
// people cards, the beliefs grid and the heading over the three latest
// posts. Labels with an arrow reveal only their text span: a split label
// becomes a flex column and would drop the arrow onto its own line.
export default async function About() {
  const [about, posts] = await Promise.all([getAbout(), getPosts()]);
  const latest = posts.slice(0, 3);

  return (
    <main className="about-page">
      <section className="about-hero has-parallax" data-flatten>
        <div className="about-hero-media parallax-frame">
          <img src={about.hero.image} alt="" className="parallax-image" />
        </div>

        <div className="about-hero-title dark">
          <p className="body" data-text-reveal="flip">
            {about.hero.label}
          </p>
          <Heading
            as="h1"
            className="h2"
            text={about.hero.heading}
            highlight={about.hero.highlight}
            trigger=".about-hero"
            delay="1.5"
          />
        </div>

        <div className="about-hero-text dark">
          <p className="body" data-text-reveal="flip">
            <Lines text={about.hero.text} />
          </p>
          <p className="body about-scroll">
            <span data-text-reveal="flip">{about.hero.scrollLabel}</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </p>
        </div>
      </section>

      {/* Heading and two paragraph columns on the left, the plant with its
          caption on the right */}
      <section className="about-intro">
        <WindLeaf />
        <div className="about-intro-text">
          <Heading
            className="h2"
            text={about.intro.heading}
            highlight={about.intro.highlight}
            trigger=".about-intro"
            delay="1.3"
          />
          <div className="about-intro-columns">
            {about.intro.text.map((paragraph) => (
              <p className="body" data-text-reveal="flip" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="about-intro-figure">
          <img src={about.intro.image} alt="" className="about-plant" />
          <div className="about-caption">
            <span className="icon icon-curl" aria-hidden="true" />
            <p className="body" data-text-reveal="flip">
              {about.intro.caption}
            </p>
          </div>
        </div>
      </section>

      {/* Timeline: a dark panel holding a strip of year cards. The arrows
          are inside the .embla root, so initSliders wires them. */}
      <section className="about-timeline">
        <div className="timeline-panel embla" data-embla-options={emblaOptions}>
          <p className="body dark timeline-label">
            <span data-text-reveal="flip">{about.timeline.label}</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </p>

          <div className="embla__viewport">
            <ol className="embla__container">
              {about.timeline.items.map((item) => (
                <li className="embla__slide timeline-card" key={`${item.year} ${item.title}`}>
                  <p className="timeline-year">{item.year}</p>
                  <h3 className="h4">{item.title}</h3>
                  <p className="body">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="timeline-arrows">
            <button type="button" className="icon-button embla__prev" aria-label="Previous">
              <span className="icon icon-arrow" aria-hidden="true" />
            </button>
            <button type="button" className="icon-button embla__next" aria-label="Next">
              <span className="icon icon-arrow" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* People: heading beside a row of dark cards, each with a cut-out
          photo standing on the card's bottom edge and rising past its top.
          The + opens the person's drawer (see initPeople in custom.js). */}
      <section className="about-people">
        <Heading className="h2" text={about.people.heading} trigger=".about-people" />

        <ul className="people-cards">
          {about.people.items.map((person, i) => (
            <li className="people-card dark" key={person.name}>
              {person.photo && (
                <span className="people-photo" aria-hidden="true">
                  <img src={person.photo} alt="" />
                </span>
              )}
              <h3 className="h4" data-text-reveal="lift">
                {person.name}
              </h3>
              <p className="body people-role" data-text-reveal="flip">
                {person.role}
              </p>
              <button
                type="button"
                className="icon-button people-plus people-more"
                data-person={i}
                aria-label={`More about ${person.name}`}
                aria-expanded="false"
                aria-controls={`person-${i}`}
              />
            </li>
          ))}
        </ul>

        {/* One drawer per person, slid in from the right over the backdrop */}
        <div className="people-backdrop" data-people-close />
        {about.people.items.map((person, i) => (
          <aside
            className="people-drawer dark"
            id={`person-${i}`}
            data-person={i}
            aria-label={person.name}
            data-lenis-prevent
            key={person.name}
          >
            <button
              type="button"
              className="icon-button people-plus people-close"
              aria-label="Close"
              data-people-close
            />
            <div className="people-drawer-inner">
              {person.photo && (
                <div className="people-drawer-photo">
                  <img src={person.photo} alt="" />
                </div>
              )}
              <h3 className="h3">{person.name}</h3>
              <p className="body people-role">{person.role}</p>
              <div className="people-bio">
                {person.bio.map((paragraph) => (
                  <p className="body" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </aside>
        ))}
      </section>

      {/* Beliefs: centred heading over a 2x2 grid of cards, each with an
          icon picked by its Icon field (/public/*.svg, see .icon-* in custom.css) */}
      <section className="about-beliefs">
        <div className="beliefs-panel">
          <h2 className="projects-heading dark" data-text-reveal="lift">
            {about.beliefs.heading}
          </h2>

          <ul className="beliefs-grid">
            {about.beliefs.items.map((belief) => (
              <li className="belief-card" key={belief.title}>
                <span className="belief-icon" aria-hidden="true">
                  <span className={`icon ${belief.icon}`} />
                </span>
                <div className="belief-text">
                  <h3 className="h4" data-text-reveal="lift">
                    {belief.title}
                  </h3>
                  <p className="body" data-text-reveal="flip">
                    {belief.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-blogs">
        <div className="about-blogs-head">
          <h2 className="projects-heading" data-text-reveal="lift">
            {about.blogsHeading}
          </h2>
          <Button href="/blog">VIEW ALL BLOGS</Button>
        </div>

        <div className="blog-grid">
          {latest.map((post) => (
            <BlogCard post={post} key={post.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
