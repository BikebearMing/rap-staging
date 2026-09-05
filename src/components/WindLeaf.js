/**
 * Palm frond shadow (/public/moving-leaf.svg) that sways with the scroll,
 * see initWindLeaves in custom.js. Placement and base angle are set per
 * parent in custom.css (Wind leaf section); the wrapper carries those and
 * the image inside carries the sway, pivoting on the stem. className lets
 * a parent tell two leaves apart (e.g. is-left).
 */
export default function WindLeaf({ className = "" }) {
  return (
    <span className={`wind-leaf ${className}`.trim()} aria-hidden="true">
      <img src="/moving-leaf.svg" alt="" data-wind-leaf />
    </span>
  );
}
