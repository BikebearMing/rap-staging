/**
 * Palm frond shadow (/public/moving-leaf.svg) that sways with the scroll,
 * see initWindLeaves in custom.js. Placement and base angle are set per
 * parent in custom.css (Wind leaf section); the wrapper carries those and
 * the image inside carries the sway, pivoting on the stem.
 */
export default function WindLeaf() {
  return (
    <span className="wind-leaf" aria-hidden="true">
      <img src="/moving-leaf.svg" alt="" data-wind-leaf />
    </span>
  );
}
