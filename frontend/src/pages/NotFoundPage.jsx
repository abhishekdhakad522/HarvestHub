import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-header">
          <span className="notfound-code">404</span>
          <p className="notfound-kicker">Lost in the fields</p>
        </div>
        <h1>We could not find that page.</h1>
        <p className="notfound-copy">
          The address might be mistyped or the page may have moved. Use the
          links below to get back on track.
        </p>
        <div className="notfound-actions">
          <Link className="action-button" to="/">
            Back to home
          </Link>
          <Link className="secondary-button" to="/shop">
            Browse the shop
          </Link>
        </div>
      </div>

      <div className="notfound-side">
        <div className="notfound-side-card">
          <p className="notfound-side-title">Try one of these</p>
          <div className="notfound-link-grid">
            <Link className="notfound-link-tile" to="/articles">
              Articles
            </Link>
            <Link className="notfound-link-tile" to="/news">
              News
            </Link>
            <Link className="notfound-link-tile" to="/about">
              About us
            </Link>
            <Link className="notfound-link-tile" to="/contact">
              Contact
            </Link>
          </div>
        </div>
        <div className="notfound-orbit" aria-hidden="true">
          <span className="notfound-dot notfound-dot--one" />
          <span className="notfound-dot notfound-dot--two" />
          <span className="notfound-dot notfound-dot--three" />
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
