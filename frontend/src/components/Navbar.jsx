import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentUser, logoutUser } from "../lib/auth.js";

const DEFAULT_AVATAR = "/default-avatar.svg";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Sync user state from backend using JWT cookie
  useEffect(() => {
    const sync = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    };

    sync();
    window.addEventListener("harvesthub:authchange", sync);

    return () => {
      window.removeEventListener("harvesthub:authchange", sync);
    };
  }, []);

  const handleSignOut = async () => {
    await logoutUser().catch(() => {});
    setUser(null);
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
            { label: "Articles", to: "/articles" },
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

          {/* {!user && (
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
            )}*/}
         </div> 

        <div className="nav-actions">
          {user ? (
            <>
              <Link className="nav-profile-pill" to="/profile" aria-label="Open profile">
                <img
                  className="nav-profile-avatar"
                  src={user.profilePicture || DEFAULT_AVATAR}
                  alt={`${user.username} profile`}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <span className="nav-profile-name">{user.username}</span>
              </Link>
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
                Login
              </Link>
              <Link className="action-button" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
