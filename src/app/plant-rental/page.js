import Faq from "@/components/Faq";
import Heading, { Lines } from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceAreas from "@/components/ServiceAreas";
import ServiceBanner from "@/components/ServiceBanner";
import ServiceOffer from "@/components/ServiceOffer";
import ServicePackages from "@/components/ServicePackages";
import ServiceProcess from "@/components/ServiceProcess";
import WindLeaf from "@/components/WindLeaf";
import {
  OFFER_FIELDS,
  PACKAGES_FIELDS,
  PROCESS_FIELDS,
  getServicePage,
  getWorks,
  offerFrom,
  packagesFrom,
  processFrom,
  worksForService,
} from "@/lib/wp";

const SERVICE = "plant-rental";
const IMAGE = "node { sourceUrl }";

export const metadata = {
  title: "Plant Rental | Rent-A-Pot",
  description:
    "From welcoming reception areas to productive workspaces, plants can transform the look and atmosphere of your office.",
};

// Plant Rental service page. Content comes from the Service Page Banner,
// Service Page FAQ and Plant Rental Page field groups; the works strip is
// every work delivered as plant rental.
export default async function PlantRental() {
  const [page, works] = await Promise.all([
    getServicePage(
      SERVICE,
      `plantRentalFields {
        introLabel introHeading introHighlight introColumn1 introColumn2
        areasHeading areas { title description image { ${IMAGE} } }
        ${PACKAGES_FIELDS} ${OFFER_FIELDS} ${PROCESS_FIELDS}
      }`
    ),
    getWorks(),
  ]);
  const intro = page.plantRentalFields || {};
  const areas = (intro.areas || []).map((area) => ({
    title: area.title,
    description: area.description,
    image: area.image?.node?.sourceUrl || "",
  }));
  const projects = worksForService(works, SERVICE);

  return (
    <main className="service-page">
      <ServiceBanner banner={page.banner} />

      <section className="service-intro">
        <WindLeaf />
        <p className="body" data-text-reveal="flip">
          <Lines text={intro.introLabel} />
        </p>

        <div className="content">
          <Heading
            className="h2"
            text={intro.introHeading}
            highlight={intro.introHighlight}
            trigger=".service-intro"
            delay="1.3"
          />

          <div className="columns">
            <p className="body" data-text-reveal="flip">
              {intro.introColumn1}
            </p>
            <p className="body" data-text-reveal="flip">
              {intro.introColumn2}
            </p>
          </div>
        </div>
      </section>

      <ServiceAreas heading={intro.areasHeading} areas={areas} />

      <ServicePackages packages={packagesFrom(intro)} />

      <ServiceOffer offer={offerFrom(intro)} />

      <ServiceProcess process={processFrom(intro)} />

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
