import Faq from "@/components/Faq";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceProcess from "@/components/ServiceProcess";
import { PROCESS_FIELDS, getServicePage, getWorks, processFrom, worksForService } from "@/lib/wp";
import { pageMeta } from "@/lib/site";

const SERVICE = "event-design";

export const metadata = pageMeta({
  path: "/event-design",
  title: "Wedding & Event Greenery Decoration in Malaysia | Rent-A-Pot",
  description:
    "Wedding and event greenery decoration in Malaysia. Rent-A-Pot designs, installs and removes greenery and florals for weddings, launches and festive displays.",
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
