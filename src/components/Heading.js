import { Fragment } from "react";

// Renders CMS text where each line break becomes a <br />.
export function Lines({ text = "" }) {
  const lines = String(text).split(/\r?\n/);
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

// A heading from the CMS: `text` with line breaks kept, and the first
// occurrence of `highlight` wrapped in the hand-drawn underline (.squiggle,
// see the wipe animation in custom.js). `trigger` and `delay` are the
// data-wipe-trigger / data-wipe-delay for that underline.
export default function Heading({
  as: Tag = "h2",
  text = "",
  highlight = "",
  trigger,
  delay,
  reveal = "lift",
  ...props
}) {
  const lines = String(text).split(/\r?\n/);
  const word = (highlight || "").trim();
  // Only the first line containing the word gets the underline
  const wordLine = word ? lines.findIndex((line) => line.includes(word)) : -1;

  const children = lines.flatMap((line, i) => {
    const parts = [];
    const at = i === wordLine ? line.indexOf(word) : -1;
    if (at === -1) {
      parts.push(line);
    } else {
      parts.push(
        line.slice(0, at),
        <span
          key={`hl${i}`}
          className="squiggle"
          data-wipe="var"
          data-wipe-trigger={trigger}
          data-wipe-delay={delay}
        >
          {word}
        </span>,
        line.slice(at + word.length)
      );
    }
    if (i < lines.length - 1) parts.push(<br key={`br${i}`} />);
    return parts;
  });

  return (
    <Tag data-text-reveal={reveal} {...props}>
      {children}
    </Tag>
  );
}
