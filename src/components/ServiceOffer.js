import Heading from "@/components/Heading";

// Loops and autoplays through the dots' progress bars
// (see initProgressDots in custom.js)
const emblaOptions = JSON.stringify({ loop: true, align: "start" });

// "Plants we offer" (plant rental page): heading on the left, an autoplaying
// Embla strip of photos on the right that runs off the page edge
// (.service-offer in custom.css). offer is { heading, highlight,
// images: [{ src, alt }] }.
export default function ServiceOffer({ offer }) {
  if (!offer.images.length) return null;
  return (
    <section className="service-offer">
      <div className="offer-text">
        <Heading
          className="h2"
          text={offer.heading}
          highlight={offer.highlight}
          trigger=".service-offer"
        />
      </div>

      <div className="offer-slides embla" data-embla-options={emblaOptions}>
        <div className="embla__viewport">
          <div className="embla__container">
            {offer.images.map((image, i) => (
              <figure className="embla__slide offer-slide" key={`${image.src}-${i}`}>
                <img src={image.src} alt={image.alt} />
              </figure>
            ))}
          </div>
        </div>
        <div className="embla__dots" />
      </div>
    </section>
  );
}
