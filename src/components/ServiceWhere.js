import Heading from "@/components/Heading";

// "Where we work" dark panel (.service-where in custom.css), on the service
// pages and the contact page. where is { label, groups: [{ heading, note,
// areas, columns }] }: each group is a heading, with an optional small note
// under it, beside its list of areas. A newline in a heading is a line break;
// `columns` lays the list out that many rows deep (true for two), running
// across, instead of one long column.
export default function ServiceWhere({ where }) {
  return (
    <section className="service-where">
      <div className="where-panel dark">
        <p className="body where-label">
          <span data-text-reveal="flip">{where.label}</span>
          <span className="icon icon-arrow" aria-hidden="true" />
        </p>

        <div className="where-groups">
          {where.groups.map((group) => (
            <div className="where-group" key={group.heading}>
              <div className="where-heading">
                <Heading className="h2" text={group.heading} />
                {group.note && <p className="body where-note">{group.note}</p>}
              </div>
              <ul
                className={`where-list${group.columns ? " is-columns" : ""}`}
                style={group.columns > 2 ? { "--where-rows": group.columns } : undefined}
              >
                {group.areas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
