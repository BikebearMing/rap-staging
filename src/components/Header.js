import Link from "next/link";
import Button from "@/components/Button";

// Site header. Nav items are placeholder until they come from WordPress;
// only Our Works, Blog and Contact have real routes for now.
const navItems = [
  { label: "Event Designs", href: "#" },
  { label: "Landscaping", href: "#" },
  { label: "Plant Rental", href: "#" },
  { label: "Maintenance", href: "#" },
  { label: "Specialty", href: "#" },
  { label: "Our Works", href: "/works" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function NavLink({ label, href, className }) {
  return href === "#" ? (
    <a href="#" className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

// The mobile menu (.site-menu) is a sibling of the header, not a child: the
// header is fixed and transformed when it hides, which would make a fixed
// panel inside it position against the header instead of the screen.
// Opened and closed by initMenu in custom.js via html.menu-open.
export default function Header() {
  return (
    <>
      <header className="site-header">
        <Link href="/" className="site-logo" aria-label="Rent A Pot home">
          <span className="logo" />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {navItems.map(({ label, href }) => (
            <NavLink label={label} href={href} className="button-label" key={label} />
          ))}
        </nav>

        <div className="site-actions">
          <Button href="/contact">LET&rsquo;S TALK</Button>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="site-menu"
          >
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
            <span className="menu-toggle-bar" />
          </button>
        </div>
      </header>

      <div className="menu-backdrop" data-menu-close />
      <aside className="site-menu" id="site-menu" aria-label="Menu" data-lenis-prevent>
        <nav className="site-menu-nav" aria-label="Primary">
          {navItems.map(({ label, href }) => (
            <NavLink label={label} href={href} className="site-menu-link" key={label} />
          ))}
        </nav>
        <div className="site-menu-footer">
          <Button href="/contact">LET&rsquo;S TALK</Button>
        </div>
      </aside>
    </>
  );
}
