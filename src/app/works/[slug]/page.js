import { notFound } from "next/navigation";
import { getWork, getWorks, projectSlide } from "@/lib/wp";
import Img from "@/components/Img";
import ProjectsSlider from "@/components/ProjectsSlider";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";

export async function generateStaticParams() {
  const works = await getWorks();
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "Our Works | Rent-A-Pot" };
  // The Yoast fields win when set; otherwise only the work's own text, never
  // the site-wide description (null leaves the tag out).
  return pageMeta({
    title: work.seoTitle || `${work.title} | Rent-A-Pot`,
    description: work.seoDescription || work.description || work.overview[0] || null,
    path: `/works/${slug}`,
    image: work.featuredImage.src || work.gallery[0]?.src,
  });
}

// A single work, from the Work Details field group. `overview` is one
// paragraph per row and `gallery` is laid out in rows of one wide image then
// two half images (see .work-gallery).
export default async function Work({ params }) {
  const { slug } = await params;
  const [work, works] = await Promise.all([getWork(slug), getWorks()]);
  if (!work) notFound();

  // The other works, starting after this one in getWorks() order and
  // wrapping round, so each work page links on to the next ones instead of
  // every page showing the same newest few (like a post's related posts).
  const at = works.findIndex((w) => w.slug === slug);
  const more = [...works.slice(at + 1), ...works.slice(0, Math.max(at, 0))].map((w) =>
    projectSlide(w)
  );

  return (
    <main className="work-page">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Our Works", path: "/works" },
          { name: work.title, path: `/works/${slug}` },
        ])}
      />
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
          <Img
            image={work.variants[0]?.image}
            alt={work.title}
            sizes="(max-width: 768px) 92vw, 89vw"
            priority
            className="parallax-image"
          />
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
            <div className="work-gallery-item parallax-frame" key={`${image.src}-${i}`}>
              {/* Every third from the first is full width; the halves are
                  cropped from landscape photos, so they show wider than
                  their frame. One column on a phone. */}
              <Img
                image={image}
                alt={work.title}
                sizes={
                  i % 3 === 0 ? "(max-width: 768px) 88vw, 66vw" : "(max-width: 768px) 88vw, 41vw"
                }
                className="parallax-image"
              />
            </div>
          ))}
        </div>
      </section>

      {/* The Project Story field: editor HTML under the gallery, outside the
          sticky overview so a long story never rides over the photos.
          .blog-content styles it like a post and stamps its text reveals. */}
      {work.story && (
        <section className="work-story">
          <h2 className="h4 work-overview-heading">
            <span data-text-reveal="lift">Project Story</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </h2>
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: work.story }} />
        </section>
      )}

      {/* The slider needs two cards to move */}
      {more.length > 1 && <ProjectsSlider projects={more} heading="More Projects" />}
    </main>
  );
}
