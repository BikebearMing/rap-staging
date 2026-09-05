import Faq from "@/components/Faq";
import Heading from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceBanner from "@/components/ServiceBanner";
import WindLeaf from "@/components/WindLeaf";
import { getServicePage, getWorks, worksForService } from "@/lib/wp";

const SERVICE = "event-design";

export const metadata = {
  title: "Event Design | Rent-A-Pot",
  description:
    "RAP provides end-to-end greenery and floral styling to create event spaces that match each theme and atmosphere.",
};

// Event design service page. Content comes from the Service Page Banner,
// Service Page FAQ and Event Design Page field groups. Same bones as the
// other service pages, with the categories laid out as a grid instead of a
// strip.
export default async function EventDesign() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `eventDesignFields {
        categoriesLabel categoriesHeading categoriesHighlight
        categories { title image { node { sourceUrl } } }
      }`
    ),
    getWorks(),
  ]);
  const fields = page.eventDesignFields || {};
  const categories = (fields.categories || []).map((category) => ({
    title: category.title,
    image: category.image?.node?.sourceUrl || "",
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <ServiceBanner banner={page.banner} />

      <section className="service-categories">
        <WindLeaf />
        <p className="body categories-label">
          <span data-text-reveal="flip">{fields.categoriesLabel}</span>
          <span className="icon icon-arrow" aria-hidden="true" />
        </p>

        <Heading
          className="h2"
          text={fields.categoriesHeading}
          highlight={fields.categoriesHighlight}
          trigger=".service-categories"
          delay="1.3"
        />

        <div className="categories-grid">
          {categories.map((category) => (
            <article className="gallery-card" key={category.title}>
              <div className="gallery-card-media">
                <img src={category.image} alt="" />
              </div>
              <p className="h4 dark gallery-card-title">{category.title}</p>
            </article>
          ))}
        </div>
      </section>

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
