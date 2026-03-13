import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../lib/auth.js";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      const response = await registerUser(formData);

      window.dispatchEvent(new Event("harvesthub:authchange"));
      setStatus({ type: "success", message: response.message });
      navigate("/");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to create your account right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Start selling locally</p>
        <h1 className="auth-title">Create your HarvestHub account.</h1>
        <p className="auth-text">
          Join as a farmer, vendor, or buyer and start building direct local
          trade.
        </p>
      </div>

      <div className="auth-card">
        <h2>Sign up</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              placeholder="freshfarmer"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </label>

          <label className="form-field">
            <span>Join as</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
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

export default SignUpPage;
