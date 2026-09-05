import Faq from "@/components/Faq";
import Heading from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceBanner from "@/components/ServiceBanner";
import WindLeaf from "@/components/WindLeaf";
import { getServicePage, getWorks, worksForService } from "@/lib/wp";

const SERVICE = "maintenance";

export const metadata = {
  title: "Maintenance | Rent-A-Pot",
  description:
    "Our garden and landscape maintenance team keeps your outdoor spaces healthy, tidy and looking their best all year round.",
};

// Maintenance service page. Content comes from the Service Page Banner,
// Service Page FAQ and Maintenance Page field groups. Same bones as the
// other service pages, with a centred heading and grid.
export default async function Maintenance() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `maintenanceFields {
        servicesHeading servicesHighlight servicesLabel
        services { title image { node { sourceUrl } } }
      }`
    ),
    getWorks(),
  ]);
  const fields = page.maintenanceFields || {};
  const services = (fields.services || []).map((service) => ({
    title: service.title,
    image: service.image?.node?.sourceUrl || "",
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <ServiceBanner banner={page.banner} />

      <section className="service-maintenance">
        <WindLeaf className="is-left" />
        <WindLeaf />

        <Heading
          className="h2"
          text={fields.servicesHeading}
          highlight={fields.servicesHighlight}
          trigger=".service-maintenance"
          delay="1.3"
        />

        <p className="body maintenance-label">
          <span data-text-reveal="flip">{fields.servicesLabel}</span>
          <span className="icon icon-arrow" aria-hidden="true" />
        </p>

        <div className="maintenance-grid">
          {services.map((service) => (
            <article className="gallery-card" key={service.title}>
              <div className="gallery-card-media">
                <img src={service.image} alt="" />
              </div>
              <p className="h4 dark gallery-card-title">{service.title}</p>
            </article>
          ))}
        </div>
      </section>

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
