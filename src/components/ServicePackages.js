import Heading from "@/components/Heading";

// Copy on the left, the package price cards stacked on the right
// (.service-packages in custom.css), on the plant rental page.
// packages is { heading, highlight, text: [paragraphs], listLabel,
// list: [items], items: [{ title, plants, price, note, detail }] }.
export default function ServicePackages({ packages }) {
  return (
    <section className="service-packages">
      <div className="packages-text">
        <Heading
          className="h2"
          text={packages.heading}
          highlight={packages.highlight}
          trigger=".service-packages"
        />
        <div className="packages-copy">
          {packages.text.map((paragraph) => (
            <p className="body" key={paragraph}>
              {paragraph}
            </p>
          ))}
          {packages.list.length > 0 && (
            <div className="packages-services">
              {packages.listLabel && <p className="body">{packages.listLabel}</p>}
              <ol className="body">
                {packages.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <ul className="packages-cards">
        {packages.items.map((card) => (
          <li className="package-card dark" key={card.title}>
            <div className="package-head">
              <p className="h4">{card.title}</p>
              {card.plants && <p className="body package-plants">{card.plants}</p>}
            </div>
            <p className="package-price">
              <span className="h3">{card.price}</span>
              {card.note && <span className="body package-note">{card.note}</span>}
            </p>
            {card.detail && <p className="body package-detail">{card.detail}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
