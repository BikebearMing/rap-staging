import Faq from "@/components/Faq";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import { getServicePage, getWorks, worksForService } from "@/lib/wp";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

const SERVICE = "maintenance";

const DESCRIPTION =
  "Garden and landscape maintenance in Malaysia. Our team keeps your outdoor spaces healthy, tidy and looking their best all year round.";

export const metadata = pageMeta({
  path: "/maintenance",
  title: "Garden & Landscape Maintenance Services Malaysia | Rent-A-Pot",
  description: DESCRIPTION,
});

// Maintenance service page. Content comes from the Service Page Banner,
// Service Page FAQ and Maintenance Page field groups. Services as a hover
// list, then projects.
export default async function Maintenance() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `maintenanceFields {
        servicesLabel
        services { title description image { node { sourceUrl } } }
      }`
    ),
    getWorks(),
  ]);
  const fields = page.maintenanceFields || {};
  const services = (fields.services || []).map((service) => ({
    title: service.title,
    description: service.description || "",
    image: service.image?.node?.sourceUrl || "",
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <JsonLd
        data={[
          serviceSchema({
            name: "Garden & Landscape Maintenance",
            serviceType: "Garden and landscape maintenance",
            description: DESCRIPTION,
            path: "/maintenance",
          }),
          breadcrumbSchema([{ name: "Maintenance", path: "/maintenance" }]),
        ]}
      />
      <ServiceBanner banner={page.banner} />

      <ServiceAreas
        className="maintenance-services"
        label={fields.servicesLabel}
        areas={services}
      />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
