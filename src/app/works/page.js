import Link from "next/link";
import { works } from "@/data/works";

export const metadata = {
  title: "Our Works | Rent-A-Pot",
  description: "A collection of spaces, details, and moments brought to life.",
};

export default function Works() {
  return (
    <main className="works-page">
      <section className="works-header">
        <h1 className="h1" data-text-reveal="lift">
          Our Works
        </h1>
      </section>

      <section className="works-list">
        {works.map((work) => (
          <article className="work-card has-parallax" key={work.slug} data-work-toggle>
            <div className="work-media parallax-frame">
              {work.variants.map((variant, i) => (
                <img
                  src={variant.image}
                  alt=""
                  className={`parallax-image work-image${i === 0 ? " is-active" : ""}`}
                  data-variant={i}
                  key={variant.category}
                />
              ))}

              {/* Switches the photo when the project spans more than one service */}
              {work.variants.length > 1 && (
                <div className="work-toggle">
                  {work.variants.map((variant, i) => (
                    <button
                      type="button"
                      className={`work-toggle-tab button-label${i === 0 ? " is-active" : ""}`}
                      data-variant={i}
                      key={variant.category}
                    >
                      {variant.category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="work-content">
              <h2 className="h3" data-text-reveal="lift">
                <Link href={`/works/${work.slug}`}>{work.title}</Link>
              </h2>
              <p className="project-date">{work.year}</p>
              <div className="work-tags">
                {work.tags.map((tag) => (
                  <span className="blog-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="body work-description" data-text-reveal="flip">
                {work.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
