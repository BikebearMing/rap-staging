import Faq from "@/components/Faq";
import Heading from "@/components/Heading";
import Img from "@/components/Img";
import ProjectsSlider from "@/components/ProjectsSlider";
import RelatedPosts from "@/components/RelatedPosts";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceProcess from "@/components/ServiceProcess";
import {
  IMAGE,
  PROCESS_FIELDS,
  getPosts,
  getServicePage,
  getWorks,
  imageFrom,
  postsForService,
  processFrom,
  worksForService,
} from "@/lib/wp";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const SERVICE = "landscaping";

const DESCRIPTION =
  "Landscape design and construction in Malaysia. We create beautiful, functional outdoor spaces with end-to-end solutions from concept to planting.";

export const metadata = pageMeta({
  path: "/landscaping",
  title: "Landscape Design & Construction in Malaysia | Rent-A-Pot",
  description: DESCRIPTION,
});

// Each strip is an Embla slider: no loop, cards run off the right edge and
// can be dragged freely (see initSliders in custom.js)
const emblaOptions = JSON.stringify({
  loop: false,
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
});

// Landscaping service page. Content comes from the Service Page Banner,
// Service Page FAQ and Landscaping Page field groups. The gallery is one tab
// per set with a strip of cards each; icons are /public/*.svg (see .icon-*
// in custom.css) picked by the set's Icon field.
export default async function Landscaping() {
  const [page, works, posts] = await Promise.all([
    getServicePage(
      SERVICE,
      `landscapingFields {
        galleryHeading galleryHighlight
        sets { title description icon items { title image { ${IMAGE} } } }
        ${PROCESS_FIELDS}
      }`
    ),
    getWorks(),
    getPosts(),
  ]);
  const gallery = page.landscapingFields || {};
  const sets = (gallery.sets || []).map((set) => ({
    title: set.title,
    description: set.description || "",
    icon: `icon-${Array.isArray(set.icon) ? set.icon[0] : set.icon}`,
    items: (set.items || []).map((item) => ({
      title: item.title,
      image: imageFrom(item.image),
    })),
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <JsonLd
        data={[
          serviceSchema({
            name: "Landscape Design & Construction",
            serviceType: "Landscape design and construction",
            description: DESCRIPTION,
            path: "/landscaping",
          }),
          breadcrumbSchema([{ name: "Landscaping", path: "/landscaping" }]),
        ]}
      />
      <ServiceBanner banner={page.banner} />

      {/* Tabs switch which strip of cards shows (see initGalleryTabs in custom.js) */}
      <section className="service-gallery" data-gallery>
        {/* Lazy: below the fold, and a non-lazy <img> is preloaded by every
            page that prefetches this one (see Img.js). The size gives it a
            box before it loads; without one it sits wholly in the cropped
            strip above the section and is never seen to load. */}
        <img
          src="/hanging-plant.png"
          alt=""
          className="gallery-plant"
          loading="lazy"
          width="164"
          height="280"
        />

        <Heading
          className="h2"
          text={gallery.galleryHeading}
          highlight={gallery.galleryHighlight}
          trigger=".service-gallery"
          delay="1.3"
        />

        {/* Tabs and arrows in a column on the left, the active strip on the
            right. The arrows sit outside the strips, so initGalleryTabs
            points them at whichever one is showing. */}
        <div className="gallery-body">
          <div className="gallery-side">
            <div className="gallery-tabs">
              {sets.map((set, i) => (
                <button
                  type="button"
                  className={`gallery-tab button-label${i === 0 ? " is-active" : ""}`}
                  data-set={i}
                  key={set.title}
                >
                  <span className={`icon ${set.icon}`} aria-hidden="true" />
                  {set.title}
                </button>
              ))}
            </div>

            <div className="gallery-arrows">
              <button
                type="button"
                className="icon-button gallery-arrow gallery-prev"
                aria-label="Previous"
              >
                <span className="icon icon-arrow" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-button gallery-arrow gallery-next"
                aria-label="Next"
              >
                <span className="icon icon-arrow" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="gallery-sets">
            {sets.map((set, i) => (
              <div
                className={`gallery-set embla${i === 0 ? " is-active" : ""}`}
                data-set={i}
                data-embla-options={emblaOptions}
                key={set.title}
              >
                <div className="gallery-set-head">
                  <h3 className="h3">{set.title}</h3>
                  {set.description && <p className="body">{set.description}</p>}
                </div>
                <div className="embla__viewport">
                  <div className="embla__container">
                    {set.items.map((item) => (
                      <article className="embla__slide gallery-card" key={item.title}>
                        <div className="gallery-card-media">
                          <Img
                            image={item.image}
                            alt={item.title}
                            sizes="(max-width: 768px) 68vw, 22vw"
                          />
                        </div>
                        <p className="h4 dark gallery-card-title">{item.title}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceProcess process={processFrom(gallery)} />

      <ProjectsSlider projects={projects} />

      <RelatedPosts posts={postsForService(posts, SERVICE)} />

      <Faq items={page.faqs} />
    </main>
  );
}
