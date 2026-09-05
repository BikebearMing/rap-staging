import { notFound } from "next/navigation";
import { getWork, getWorks } from "@/lib/wp";

export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const work = await getWork(slug);
  return { title: work ? `${work.title} | Rent-A-Pot` : "Our Works | Rent-A-Pot" };
}

// A single work, from the Work Details field group. `overview` is one
// paragraph per row and `gallery` is laid out in rows of one wide image then
// two half images (see .work-gallery).
export default async function Work({ params }) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();

  return (
    <main className="work-page">
      <section className="work-header has-parallax">
        <div className="work-header-tags">
          {work.variants.map((variant) => (
            <span className="blog-tag" key={variant.category}>
              {variant.category}
            </span>
          ))}
        </div>
        <h1 className="h1" data-text-reveal="lift">
          {work.title}
        </h1>
        <div className="work-hero parallax-frame">
          <img src={work.variants[0]?.image} alt="" className="parallax-image" />
        </div>
      </section>

      {/* The overview sticks to the bottom of the screen while the gallery
          scrolls past it (see .work-overview) */}
      <section className="work-body">
        <div className="work-overview">
          <h2 className="h4 work-overview-heading">
            <span data-text-reveal="lift">Project Overview</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </h2>
          <div className="work-overview-text">
            {work.overview.map((paragraph) => (
              <p className="body" data-text-reveal="flip" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="work-tags">
            {work.tags.map((tag) => (
              <span className="blog-tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className="project-date">{work.date}</p>
        </div>

        <div className="work-gallery has-parallax">
          {work.gallery.map((image, i) => (
            <div className="work-gallery-item parallax-frame" key={`${image}-${i}`}>
              <img src={image} alt="" className="parallax-image" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
