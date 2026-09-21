import Heading, { Lines } from "@/components/Heading";

// No loop, cards run off the right edge and can be dragged freely
// (see initSliders in custom.js)
const emblaOptions = JSON.stringify({
  loop: false,
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
});

// Copy on the left, a drag-only Embla strip of price cards on the right
// (.service-costs in custom.css), on the service pages.
// costs is { heading, highlight, text: [paragraphs], cards: [{ title, price,
// image }] }; a newline in a heading or card title is a line break.
export default function ServiceCosts({ costs }) {
  return (
    <section className="service-costs">
      <div className="costs-text">
        <Heading
          className="h2"
          text={costs.heading}
          highlight={costs.highlight}
          trigger=".service-costs"
        />
        <div className="costs-copy">
          {costs.text.map((paragraph) => (
            <p className="body" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="costs-cards embla" data-embla-options={emblaOptions}>
        <div className="embla__viewport">
          <div className="embla__container">
            {costs.cards.map((card) => (
              <article className="embla__slide gallery-card cost-card" key={card.title}>
                <div className="gallery-card-media">
                  <img src={card.image} alt="" />
                </div>
                <div className="cost-card-text dark">
                  <p className="h4">
                    <Lines text={card.title} />
                  </p>
                  <p className="body">{card.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
