import Link from "next/link";

// Projects slider (see initProjectsSlider in custom.js and .home-projects in
// custom.css). Used on the home page and as the works strip on the service
// pages. Each project is { title, date, tag, image, href }; href is where the
// main card's arrow goes (a work page, or "#" while the content is
// placeholder).
export default function ProjectsSlider({ projects, heading = "Our Projects" }) {
  return (
    <section className="home-projects">
      <div className="projects-header">
        <div className="projects-title">
          <h2 className="projects-heading" data-text-reveal="lift">
            {heading}
          </h2>
          <span
            className="projects-scribble"
            data-wipe
            data-wipe-trigger=".projects-title"
            data-wipe-delay="0.6"
            aria-hidden="true"
          />
        </div>

        {/* Same look as Button, but the arrow box is the slider's next control
            (see initProjectsSlider) so it stays out of the anchor: the page
            transition takes every link click at capture, before the slider
            could stop it */}
        <div className="projects-actions">
          <span className="custom-button">
            <Link href="/works" className="button-pill">
              <span className="button-label">VIEW ALL WORKS</span>
            </Link>
            <button type="button" className="button-arrow" aria-label="Next project" />
          </span>
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
                {project.href && project.href !== "#" ? (
                  <Link
                    href={project.href}
                    className="button-arrow project-link"
                    aria-label={`View ${project.title}`}
                  />
                ) : (
                  <a href="#" className="button-arrow project-link" aria-label="View project" />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
