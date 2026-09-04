// Site button: green pill label with a square arrow box beside it.
// Pass arrow={false} for the pill alone. Arrow artwork is /public/button-arrow.svg,
// applied as a mask in custom.css (.button-arrow).
export default function Button({ href = "#", children, className = "", arrow = true, ...props }) {
  return (
    <a href={href} className={`custom-button ${className}`.trim()} {...props}>
      <span className="button-pill">
        <span className="button-label">{children}</span>
      </span>
      {arrow && <span className="button-arrow" aria-hidden="true" />}
    </a>
  );
}
