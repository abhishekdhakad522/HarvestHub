import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { fetchCurrentUser, updateUserProfile } from "../lib/auth.js";

function UpdateProfilePage() {
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profilePicture: "",
    password: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = await fetchCurrentUser();

      if (!currentUser) {
        navigate("/signin", { replace: true });
        return;
      }

      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        profilePicture: currentUser.profilePicture || "",
        password: "",
      });
      setIsCheckingAccess(false);
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await updateUserProfile({
        username: formData.username,
        email: formData.email,
        profilePicture: formData.profilePicture,
        ...(formData.password ? { password: formData.password } : {}),
      });

      const updatedUser = response?.user;
      setFormData((currentValue) => ({
        ...currentValue,
        username: updatedUser?.username || currentValue.username,
        email: updatedUser?.email || currentValue.email,
        profilePicture:
          updatedUser?.profilePicture || currentValue.profilePicture,
        password: "",
      }));
      setStatus({
        type: "success",
        message: response.message || "Profile updated successfully.",
      });
      window.dispatchEvent(new Event("harvesthub:authchange"));
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update profile right now.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <p className="shop-status">Loading your profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout update-profile-page">
      <div className="auth-copy update-profile-copy">
        <BackButton fallbackPath="/profile" />
        <p className="eyebrow">Account settings</p>
        <h1 className="auth-title">Update your profile details.</h1>
        <p className="auth-text">
          Change your username, email, profile picture, or password.
        </p>

        <div className="update-profile-visual">
          <img
            className="update-profile-image"
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80"
            alt="Farmer reviewing produce in a greenhouse"
          />
          <div className="update-profile-visual-copy">
            <p className="update-profile-visual-label">Profile refresh</p>
            <strong>Keep your public identity clear and current.</strong>
            <span>
              Update your name, picture, and contact details so buyers and the
              HarvestHub community recognize you instantly.
            </span>
          </div>
        </div>
      </div>

      <div className="auth-card update-profile-card">
        <h2>Update profile</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="profile-update-grid">
            <label className="form-field">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="form-field">
            <span>Profile picture URL</span>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
            />
          </label>

          <label className="form-field">
            <span>New password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving changes..." : "Update profile"}
          </button>

          {status.message ? (
            <p className={`form-status form-status-${status.type}`}>
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default UpdateProfilePage;
