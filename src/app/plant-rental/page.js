import Faq from "@/components/Faq";
import Heading, { Lines } from "@/components/Heading";
import ProjectsSlider from "@/components/ProjectsSlider";
import ServiceBanner from "@/components/ServiceBanner";
import WindLeaf from "@/components/WindLeaf";
import { getServicePage, getWorks, worksForService } from "@/lib/wp";

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

      {/* Hovering an area swaps the copy and the photo (see initAreas in custom.js) */}
      <section className="service-areas has-parallax" data-areas>
        <div className="areas-content">
          <p className="h4" data-text-reveal="lift">
            {intro.areasHeading}
          </p>

          <ul className="areas-list">
            {areas.map((area, i) => (
              <li
                className={`h2 areas-item${i === 0 ? " is-active" : ""}`}
                data-area={i}
                data-text-reveal="lift"
                key={area.title}
              >
                {area.title}
              </li>
            ))}
          </ul>

          <div className="areas-description" data-line data-line-start="top 100%">
            {areas.map((area, i) => (
              <p
                className={`body areas-copy${i === 0 ? " is-active" : ""}`}
                data-area={i}
                key={area.title}
              >
                {area.description}
              </p>
            ))}
          </div>
        </div>

        <div className="areas-media parallax-frame">
          {areas.map((area, i) => (
            <img
              src={area.image}
              alt=""
              className={`parallax-image areas-image${i === 0 ? " is-active" : ""}`}
              data-area={i}
              key={area.title}
            />
          ))}
        </div>
      </section>

      <ProjectsSlider projects={projects} />

      <Faq items={page.faqs} />
    </main>
  );
}
