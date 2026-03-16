import { useNavigate } from "react-router-dom";

function BackButton({ fallbackPath = "/", label = "Back" }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      className="secondary-button back-nav-button"
      onClick={handleGoBack}
    >
      ← {label}
    </button>
  );
}

export default BackButton;
