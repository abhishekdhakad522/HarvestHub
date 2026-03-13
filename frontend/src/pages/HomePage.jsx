import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="hero-panel" aria-label="Introductory content">
      <div className="hero-content">
        <p className="eyebrow">Seasonal produce marketplace</p>
        <h1>Build a direct line between local farms and everyday kitchens.</h1>
        <p className="hero-copy">
          HarvestHub gives growers, vendors, and customers one place to share
          inventory, discover fresh products, and keep food moving locally.
        </p>
      </div>

      <aside className="feature-card" aria-label="Platform highlights">
        <p className="feature-label">What you can do</p>
        <ul className="feature-list">
          <li>List fresh inventory from local farms in minutes.</li>
          <li>Browse produce, dairy, and pantry goods in one marketplace.</li>
          <li>Manage orders and customer relationships without middlemen.</li>
        </ul>
      </aside>
    </section>
  );
}

export default HomePage;