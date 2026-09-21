import Faq from "@/components/Faq";
import Heading from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceCosts from "@/components/ServiceCosts";
import ServiceProcess from "@/components/ServiceProcess";
import ServiceWhere from "@/components/ServiceWhere";
import {
  COSTS_FIELDS,
  PROCESS_FIELDS,
  WHERE_FIELDS,
  costsFrom,
  getServicePage,
  getWorks,
  processFrom,
  whereFrom,
  worksForService,
} from "@/lib/wp";

const SERVICE = "landscaping";

export const metadata = {
  title: "Landscaping | Rent-A-Pot",
  description:
    "Our landscape design team creates beautiful, functional outdoor spaces, providing end-to-end solutions from concept to construction and planting.",
};

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
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `landscapingFields {
        galleryHeading galleryHighlight
        sets { title description icon items { title image { node { sourceUrl } } } }
        ${PROCESS_FIELDS} ${COSTS_FIELDS} ${WHERE_FIELDS}
      }`
    ),
    getWorks(),
  ]);
  const gallery = page.landscapingFields || {};
  const sets = (gallery.sets || []).map((set) => ({
    title: set.title,
    description: set.description || "",
    icon: `icon-${Array.isArray(set.icon) ? set.icon[0] : set.icon}`,
    items: (set.items || []).map((item) => ({
      title: item.title,
      image: item.image?.node?.sourceUrl || "",
    })),
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <ServiceBanner banner={page.banner} />

      {/* Tabs switch which strip of cards shows (see initGalleryTabs in custom.js) */}
      <section className="service-gallery" data-gallery>
        <img src="/hanging-plant.png" alt="" className="gallery-plant" />

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
              <button type="button" className="icon-button gallery-arrow gallery-prev" aria-label="Previous">
                <span className="icon icon-arrow" aria-hidden="true" />
              </button>
              <button type="button" className="icon-button gallery-arrow gallery-next" aria-label="Next">
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
                          <img src={item.image} alt="" />
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

      <ServiceCosts costs={costsFrom(gallery)} />

      <ServiceWhere where={whereFrom(gallery)} />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
