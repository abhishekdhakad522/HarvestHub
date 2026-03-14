import { Route, Routes } from "react-router-dom";
import "./styles/main.css";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import ArticlesPage from "./pages/ArticlesPage.jsx";
import ArticleDetailPage from "./pages/ArticleDetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UpdateProfilePage from "./pages/UpdateProfilePage.jsx";
import AddProductPage from "./pages/AddProductPage.jsx";
import MyProductsPage from "./pages/MyProductsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import AddPostPage from "./pages/AddPostPage.jsx";
import MyPostsPage from "./pages/MyPostsPage.jsx";

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
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:postId" element={<ArticleDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/update" element={<UpdateProfilePage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
          <Route path="/posts/new" element={<AddPostPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
