// Renders structured data as a JSON-LD script tag. `data` is one schema
// object or an array of them. `<` is escaped so text from WordPress can't
// close the tag early.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
