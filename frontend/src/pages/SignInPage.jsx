import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { fetchCurrentUser, loginUser, loginWithGoogle } from "../lib/auth.js";

function SignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await loginUser(formData);

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

  const handleGoogleCodeSuccess = async (codeResponse) => {
    try {
      setIsGoogleSubmitting(true);
      setStatus({ type: "idle", message: "" });

      if (!codeResponse?.code) {
        throw new Error("Google sign-in did not return a valid authorization code.");
      }

      const response = await loginWithGoogle({
        code: codeResponse.code,
      });

      window.dispatchEvent(new Event("harvesthub:authchange"));
      setStatus({
        type: "success",
        message: response.message || "Signed in with Google.",
      });
      navigate("/");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Google sign-in failed.",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setStatus({
      type: "error",
      message: "Google sign-in was cancelled or failed.",
    });
  };

  const googleCodeLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    onSuccess: handleGoogleCodeSuccess,
    onError: handleGoogleError,
  });

  const handleGoogleButtonClick = () => {
    setStatus({ type: "idle", message: "" });
    googleCodeLogin();
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
        <p className="eyebrow">Welcome back</p>
        <h1 className="auth-title">
          Sign in to manage your HarvestHub account.
        </h1>
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

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
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
              {isGoogleSubmitting ? "Connecting to Google..." : "Sign in with Google"}
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

export default SignInPage;
