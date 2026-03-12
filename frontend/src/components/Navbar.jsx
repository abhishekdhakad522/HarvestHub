import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("harvesthubUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Sync user state when localStorage changes (same tab via custom event, or other tabs via storage event)
  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener("storage", sync);
    window.addEventListener("harvesthub:authchange", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("harvesthub:authchange", sync);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("harvesthubUser");
    window.dispatchEvent(new Event("harvesthub:authchange"));
    navigate("/");
  };

  return (
    <nav className="navbar" aria-label="Primary navigation">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-hidden="true">
          HH
        </span>
        <span className="brand-copy">
          <span className="brand-name">HarvestHub</span>
          <span className="brand-tagline">Farm fresh, directly connected</span>
        </span>
      </Link>

      <button
        type="button"
        className="menu-toggle"
        aria-expanded={isMenuOpen}
        aria-controls="primary-menu"
        aria-label="Toggle navigation menu"
        onClick={() => setIsMenuOpen((previousValue) => !previousValue)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`nav-panel${isMenuOpen ? " nav-panel-open" : ""}`}
        id="primary-menu"
      >
        <div className="nav-links">
          {[
            { label: "Home", to: "/", end: true },
            { label: "Shop", to: "/shop" },
            { label: "News", to: "/news" },
            { label: "About", to: "/about" },
          ].map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {!user && (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link-active" : ""}`
                }
              >
                Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link-active" : ""}`
                }
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user-greeting">Hi, {user.username}</span>
              <button
                type="button"
                className="action-button nav-signout"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="action-link" to="/signin">
                Account access
              </Link>
              <Link className="action-button" to="/signup">
                Join HarvestHub
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
