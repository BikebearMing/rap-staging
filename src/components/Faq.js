// FAQ accordion (see initFaq in custom.js and .service-faq in custom.css).
// One answer open at a time. items is [{ question, answer }].
export default function Faq({ items }) {
  return (
    <section className="service-faq" data-line>
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
