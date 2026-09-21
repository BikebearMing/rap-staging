import Heading, { Lines } from "@/components/Heading";

// No loop, cards run off the right edge and can be dragged freely
// (see initSliders in custom.js)
const emblaOptions = JSON.stringify({
  loop: false,
  align: "start",
  containScroll: "trimSnaps",
  dragFree: true,
});

// Numbered steps in an Embla strip (.service-process in custom.css), on the
// service pages. The arrows are inside the .embla root,
// so initSliders wires them. process is { heading, highlight, steps:
// [{ title, text }] }; a newline in a title is a line break.
export default function ServiceProcess({ process }) {
  return (
    <section className="service-process embla" data-embla-options={emblaOptions}>
      <div className="process-head">
        <Heading
          className="h2"
          text={process.heading}
          highlight={process.highlight}
          trigger=".service-process"
        />
        <div className="process-arrows">
          <button type="button" className="icon-button embla__prev" aria-label="Previous">
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
          <button type="button" className="icon-button embla__next" aria-label="Next">
            <span className="icon icon-arrow" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="embla__viewport">
        <ol className="embla__container">
          {process.steps.map((step, i) => (
            <li className="embla__slide process-card dark" key={step.title}>
              <span className="process-number">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="h3">
                <Lines text={step.title} />
              </h3>
              <p className="body">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
