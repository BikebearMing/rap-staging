import Faq from "@/components/Faq";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceProcess from "@/components/ServiceProcess";
import { PROCESS_FIELDS, getServicePage, getWorks, processFrom, worksForService } from "@/lib/wp";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const SERVICE = "event-design";

const DESCRIPTION =
  "Wedding and event greenery decoration in Malaysia. Rent-A-Pot designs, installs and removes greenery and florals for weddings, launches and festive displays.";

export const metadata = pageMeta({
  path: "/event-design",
  title: "Wedding & Event Greenery Decoration in Malaysia | Rent-A-Pot",
  description: DESCRIPTION,
});

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
        ${PROCESS_FIELDS}
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
      <JsonLd
        data={[
          serviceSchema({
            name: "Wedding & Event Greenery Decoration",
            serviceType: "Event greenery decoration",
            description: DESCRIPTION,
            path: "/event-design",
          }),
          breadcrumbSchema([{ name: "Event Design", path: "/event-design" }]),
        ]}
      />
      <ServiceBanner banner={page.banner} />

      <ServiceAreas
        className="event-categories"
        label={fields.categoriesLabel}
        areas={categories}
      />

      <ServiceProcess process={processFrom(fields)} />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
