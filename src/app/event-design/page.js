import Faq from "@/components/Faq";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceCosts from "@/components/ServiceCosts";
import ServiceProcess from "@/components/ServiceProcess";
import {
  COSTS_FIELDS,
  PROCESS_FIELDS,
  costsFrom,
  getServicePage,
  getWorks,
  processFrom,
  worksForService,
} from "@/lib/wp";

const SERVICE = "event-design";

export const metadata = {
  title: "Event Design | Rent-A-Pot",
  description:
    "RAP provides end-to-end greenery and floral styling to create event spaces that match each theme and atmosphere.",
};

// Event design service page. Content comes from the Service Page Banner,
// Service Page FAQ and Event Design Page field groups. Same sections as the
// landscaping page, with the categories as a hover list like plant rental's
// areas.
export default async function EventDesign() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `eventDesignFields {
        categoriesLabel
        categories { title description image { node { sourceUrl } } }
        ${PROCESS_FIELDS} ${COSTS_FIELDS}
      }`
    ),
    getWorks(),
  ]);
  const fields = page.eventDesignFields || {};
  const categories = (fields.categories || []).map((category) => ({
    title: category.title,
    description: category.description || "",
    image: category.image?.node?.sourceUrl || "",
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <ServiceBanner banner={page.banner} />

      <ServiceAreas className="event-categories" label={fields.categoriesLabel} areas={categories} />

      <ServiceProcess process={processFrom(fields)} />

      <ServiceCosts costs={costsFrom(fields)} />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
