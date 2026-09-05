import Faq from "@/components/Faq";
import Heading from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceBanner from "@/components/ServiceBanner";
import { getServicePage, getWorks, worksForService } from "@/lib/wp";

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
        sets { title icon items { title image { node { sourceUrl } } } }
      }`
    ),
    getWorks(),
  ]);
  const gallery = page.landscapingFields || {};
  const sets = (gallery.sets || []).map((set) => ({
    title: set.title,
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

        <div className="gallery-sets">
          {sets.map((set, i) => (
            <div
              className={`gallery-set embla${i === 0 ? " is-active" : ""}`}
              data-set={i}
              data-embla-options={emblaOptions}
              key={set.title}
            >
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
      </section>

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
