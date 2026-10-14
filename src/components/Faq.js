export default function Faq({ items }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="service-faq" data-line>
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <h2 className="projects-heading" data-text-reveal="lift">
        FAQ
      </h2>

      <ol className="faq-list" data-faq>
        {items.map((item, i) => (
          <li className="faq-item" data-line key={item.question}>
            <button type="button" className="faq-question" aria-expanded="false">
              <span className="h4 faq-number">{i + 1}.</span>
              <span className="h4 faq-title" data-text-reveal="lift">
                {item.question}
              </span>
              <span className="faq-icon" aria-hidden="true" />
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">
                <p className="body">{item.answer}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
