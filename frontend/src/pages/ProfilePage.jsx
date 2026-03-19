import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await fetchCurrentUser();

      if (!currentUser) {
        setStatus({
          loading: false,
          error: "Please sign in to view your profile.",
        });
        return;
      }

      setUser(currentUser);
      setStatus({ loading: false, error: "" });
    };

    loadProfile();
  }, []);

  if (status.loading) {
    return (
      <section className="profile-layout">
        <div className="profile-card">
          <p className="profile-status">Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (status.error) {
    return (
      <section className="profile-layout">
        <div className="profile-card">
          <h1>Your profile</h1>
          <p className="profile-status">{status.error}</p>
          <button
            type="button"
            className="action-button"
            onClick={() => navigate("/signin")}
          >
            Go to sign in
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-layout">
      <div className="profile-card">
        <p className="eyebrow">Account</p>
        <h1>Your profile</h1>

        <div className="profile-grid">
          <div className="profile-item">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>
          <div className="profile-item">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-item">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>
          <div className="profile-item">
            <span>Account ID</span>
            <strong>{user._id || user.id}</strong>
          </div>
        </div>

        <div className="profile-actions">
          <Link className="update-profile-button" to="/profile/update">
            Update profile
          </Link>
          {user?.role !== "farmer" && (
            <Link className="my-orders-button" to="/my-orders">
              My orders
            </Link>
          )}
          {user?.role === "farmer" && (
            <>
              <Link className="seller-orders-button" to="/seller-orders">
                My orders sold
              </Link>
              <Link className="my-products-button" to="/my-products">
                My products
              </Link>
            </>
          )}
          <Link className="my-posts-button" to="/my-posts">
            My posts
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
