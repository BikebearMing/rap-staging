import Heading from "@/components/Heading";

// No loop, cards run off the right edge and can be dragged freely
// (see initSliders in custom.js)
const emblaOptions = JSON.stringify({
  loop: false,
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
});

// "Plants we offer" (plant rental page): heading and the prev/next arrows on
// the left, an Embla strip of labelled plant cards running off the page edge
// on the right (.service-offer in custom.css). The section is the .embla
// root, so initSliders wires the arrows. offer is { heading, highlight,
// images: [{ src, alt, label }] }; a card's label is the image's Caption in
// the media library, empty until the content is filled in.
export default function ServiceOffer({ offer }) {
  if (!offer.images.length) return null;
  return (
    <section className="service-offer embla" data-embla-options={emblaOptions}>
      <div className="offer-text">
        <Heading
          className="h2"
          text={offer.heading}
          highlight={offer.highlight}
          trigger=".service-offer"
        />
        <div className="offer-arrows">
          <button type="button" className="icon-button embla__prev" aria-label="Previous">
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
          <button type="button" className="icon-button embla__next" aria-label="Next">
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="offer-slides">
        <div className="embla__viewport">
          <div className="embla__container">
            {offer.images.map((image, i) => (
              <article className="embla__slide gallery-card offer-slide" key={`${image.src}-${i}`}>
                <div className="gallery-card-media">
                  <img src={image.src} alt={image.alt} />
                </div>
                <p className="h4 dark gallery-card-title">{image.label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
