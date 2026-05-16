import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="simple-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="hero-copy">
        The page you are looking for does not exist. Try returning to the
        homepage or using the navigation.
      </p>
      <Link className="secondary-button" to="/">
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundPage;
