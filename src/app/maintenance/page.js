import Faq from "@/components/Faq";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceCosts from "@/components/ServiceCosts";
import ServiceWhere from "@/components/ServiceWhere";
import {
  COSTS_FIELDS,
  WHERE_FIELDS,
  costsFrom,
  getServicePage,
  getWorks,
  whereFrom,
  worksForService,
} from "@/lib/wp";

const SERVICE = "maintenance";

export const metadata = {
  title: "Maintenance | Rent-A-Pot",
  description:
    "Our garden and landscape maintenance team keeps your outdoor spaces healthy, tidy and looking their best all year round.",
};

// Maintenance service page. Content comes from the Service Page Banner,
// Service Page FAQ and Maintenance Page field groups. Same sections as the other
// service pages: services as a hover list, pricing, where we work, projects.
export default async function Maintenance() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `maintenanceFields {
        servicesLabel
        services { title description image { node { sourceUrl } } }
        ${COSTS_FIELDS} ${WHERE_FIELDS}
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
      <ServiceBanner banner={page.banner} />

      <ServiceAreas className="maintenance-services" label={fields.servicesLabel} areas={services} />

      <ServiceCosts costs={costsFrom(fields)} />

      <ServiceWhere where={whereFrom(fields)} />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
