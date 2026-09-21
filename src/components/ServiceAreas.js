// List of names beside a tall photo (.service-areas in custom.css), on the
// plant rental, event design and maintenance pages. Hovering a name swaps the copy and
// the photo (see initAreas in custom.js). areas is [{ title, description,
// image }]. The list sits under either a `heading` or a small `label` with
// the site arrow; className is for the page's own spacing.
export default function ServiceAreas({ heading, label, areas, className = "" }) {
  return (
    <section className={`service-areas has-parallax ${className}`.trim()} data-areas>
      <div className="areas-content">
        {label ? (
          <p className="body areas-label">
            <span data-text-reveal="flip">{label}</span>
            <span className="icon icon-arrow" aria-hidden="true" />
          </p>
        ) : (
          <p className="h4" data-text-reveal="lift">
            {heading}
          </p>
        )}

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
  );
}
