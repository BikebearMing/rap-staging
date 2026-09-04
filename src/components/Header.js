import Link from "next/link";
import Button from "@/components/Button";

// Site header. Nav items are placeholder until they come from WordPress.
const navItems = [
  "Event Designs",
  "Landscaping",
  "Plant Rental",
  "Maintenance",
  "Specialty",
  "Our Works",
  "Blog",
  "Contact",
];

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="site-logo" aria-label="Rent A Pot home">
        <span className="logo" />
      </Link>

      <nav className="site-nav" aria-label="Primary">
        {navItems.map((label) => (
          <a href="#" className="button-label" key={label}>
            {label}
          </a>
        ))}
      </nav>

      <div className="site-actions">
        <Button>LET&rsquo;S TALK</Button>
      </div>
    </header>
  );
}
