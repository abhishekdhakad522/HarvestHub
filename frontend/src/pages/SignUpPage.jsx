import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { fetchCurrentUser, loginWithGoogle, registerUser } from "../lib/auth.js";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await fetchCurrentUser();

      if (currentUser) {
        navigate("/", { replace: true });
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
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

  const handleGoogleCodeSuccess = async (codeResponse) => {
    try {
      setIsGoogleSubmitting(true);
      setStatus({ type: "idle", message: "" });

      if (!formData.role) {
        throw new Error("Please select account type before using Google sign up.");
      }

      if (!codeResponse?.code) {
        throw new Error("Google sign-up did not return a valid authorization code.");
      }

      const response = await loginWithGoogle({
        code: codeResponse.code,
        role: formData.role,
      });

      window.dispatchEvent(new Event("harvesthub:authchange"));
      setStatus({
        type: "success",
        message: response.message || "Signed up with Google.",
      });
      navigate("/");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Google sign-up failed.",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setStatus({
      type: "error",
      message: "Google sign-up was cancelled or failed.",
    });
  };

  const googleCodeSignup = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: handleGoogleCodeSuccess,
    onError: handleGoogleError,
  });

  const handleGoogleButtonClick = () => {
    if (!formData.role) {
      setStatus({
        type: "error",
        message: "Please select account type first.",
      });
      return;
    }

    setStatus({ type: "idle", message: "" });
    googleCodeSignup();
  };

  if (isCheckingAuth) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <p className="orders-status">Checking your session...</p>
        </div>
      </section>
    );
  }

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
              <option value="" disabled>
                Select account type
              </option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <div className="auth-divider" aria-hidden="true">
            <span>or</span>
          </div>

          <div className="google-login-wrap">
            <button
              type="button"
              className="secondary-button google-code-login-button"
              onClick={handleGoogleButtonClick}
              disabled={isSubmitting || isGoogleSubmitting}
            >
              {isGoogleSubmitting ? "Connecting to Google..." : "Sign up with Google"}
            </button>
          </div>

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
