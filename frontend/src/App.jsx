import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AddProductPage from "./pages/AddProductPage.jsx";
import MyProductsPage from "./pages/MyProductsPage.jsx";

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Navbar />
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
