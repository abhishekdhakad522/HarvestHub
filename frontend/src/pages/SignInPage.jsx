import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../lib/auth.js";

function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "farmer",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await loginUser(formData);

      localStorage.setItem("harvesthubUser", JSON.stringify(response.user));
      window.dispatchEvent(new Event("harvesthub:authchange"));
      setStatus({ type: "success", message: response.message });
      navigate("/");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to sign in right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Welcome back</p>
        <h1 className="auth-title">Sign in to manage your HarvestHub account.</h1>
        <p className="auth-text">
          Access your listings, orders, and buyer conversations from one place.
        </p>
      </div>

      <div className="auth-card">
        <h2>Sign in</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="farmer@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Account type</span>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          {status.message ? (
            <p className={`form-status form-status-${status.type}`}>{status.message}</p>
          ) : null}
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/signup">Create one here</Link>
        </p>
      </div>
    </section>
  );
}

export default SignInPage;