import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedPosts } from "../lib/posts.js";
import { getProducts } from "../lib/products.js";
import { fetchNewsPage } from "../lib/news.js";

const FALLBACK_IMAGES = {
  article: "/default-article.svg",
  product: "/default-product.svg",
  news: "/default-news.svg",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function HomePage() {
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewArticles, setPreviewArticles] = useState([]);
  const [previewNews, setPreviewNews] = useState([]);
  
  useEffect(() => {
    const loadPreviews = async () => {
      try {
        const [productsResponse, postsResponse, newsResponse] =
          await Promise.all([
            getProducts(),
            getPublishedPosts(),
            fetchNewsPage("farming", 3).catch(() => []),
          ]);

        const products = Array.isArray(productsResponse?.products)
          ? productsResponse.products
          : [];
        const posts = Array.isArray(postsResponse?.posts)
          ? postsResponse.posts
          : [];
        const news = Array.isArray(newsResponse) ? newsResponse : [];

        setPreviewProducts(products.slice(0, 3));
        setPreviewArticles(posts.slice(0, 3));
        setPreviewNews(
          news.filter((n) => n.title && n.title !== "[Removed]").slice(0, 3),
        );
      } catch {
        setPreviewProducts([]);
        setPreviewArticles([]);
        setPreviewNews([]);
      }
    };

    loadPreviews();
  }, []);

  return (
    <>
      <section className="hero-panel" aria-label="Introductory content">
        <div className="hero-content">
          <p className="eyebrow">Seasonal produce marketplace</p>
          <h1>
            Build a direct line between local farms and everyday kitchens.
          </h1>
          <p className="hero-copy">
            HarvestHub gives growers, vendors, and customers one place to share
            inventory, discover fresh products, and keep food moving locally.
          </p>
        </div>

        <aside className="feature-card" aria-label="Platform highlights">
          <p className="feature-label">What you can do</p>
          <ul className="feature-list">
            <li>List fresh inventory from local farms in minutes.</li>
            <li>Browse produce, dairy, and pantry goods in one marketplace.</li>
            <li>Manage orders and customer relationships without middlemen.</li>
          </ul>
        </aside>
      </section>

      <div className="home-sections" aria-label="Quick navigation sections">
        {/* ── Articles ── */}
        <section className="home-section home-section-articles">
          <div className="home-section-header">
            <div className="home-section-heading">
              <p className="home-section-label">Community</p>
              <h2>
                Articles
                {previewArticles.length > 0 && (
                  <span className="home-section-count">
                    {previewArticles.length}+ stories
                  </span>
                )}
              </h2>
            </div>
            <Link className="home-section-link" to="/articles">
              View all articles
            </Link>
          </div>

          <div className="home-items-grid">
            {previewArticles.length > 0 ? (
              previewArticles.map((post) => (
                <Link
                  key={post._id || post.slug}
                  className="home-item-card"
                  to={`/articles/${post.slug || post._id}`}
                >
                  <div className="home-item-media">
                    <img
                      className="home-item-image"
                      src={post.imageUrl || FALLBACK_IMAGES.article}
                      alt={post.title}
                    />
                  </div>
                  <div className="home-item-body">
                    <p className="home-item-meta">
                      {post.author?.username || "Author"}&nbsp;·&nbsp;
                      {timeAgo(post.createdAt)}
                    </p>
                    <h3 className="home-item-title">{post.title}</h3>
                  </div>
                </Link>
              ))
            ) : (
              <p className="home-items-empty">
                Fresh articles will appear here shortly.
              </p>
            )}
          </div>
        </section>

        {/* ── Products ── */}
        <section className="home-section home-section-products">
          <div className="home-section-header">
            <div className="home-section-heading">
              <p className="home-section-label">Marketplace</p>
              <h2>
                Products
                {previewProducts.length > 0 && (
                  <span className="home-section-count">
                    {previewProducts.length}+ items
                  </span>
                )}
              </h2>
            </div>
            <Link className="home-section-link" to="/shop">
              View all products
            </Link>
          </div>

          <div className="home-items-grid">
            {previewProducts.length > 0 ? (
              previewProducts.map((product) => (
                <Link
                  key={product._id || product.id}
                  className="home-item-card"
                  to="/shop"
                >
                  <div className="home-item-media">
                    <img
                      className="home-item-image"
                      src={product.images?.[0] || FALLBACK_IMAGES.product}
                      alt={product.name}
                    />
                    <span className="home-item-badge">
                      ₹{Number(product.price || 0).toFixed(0)}
                    </span>
                  </div>
                  <div className="home-item-body">
                    <p className="home-item-meta">
                      {product.category || "Product"}
                    </p>
                    <h3 className="home-item-title">{product.name}</h3>
                  </div>
                </Link>
              ))
            ) : (
              <p className="home-items-empty">
                New products will show here as sellers publish them.
              </p>
            )}
          </div>
        </section>

        {/* ── News ── */}
        <section className="home-section home-section-news">
          <div className="home-section-header">
            <div className="home-section-heading">
              <p className="home-section-label">Farming Updates</p>
              <h2>
                News
                {previewNews.length > 0 && (
                  <span className="home-section-count">
                    {previewNews.length}+ news
                  </span>
                )}
              </h2>
            </div>
            <Link className="home-section-link" to="/news">
              View all news
            </Link>
          </div>

          <div className="home-items-grid">
            {previewNews.length > 0 ? (
              previewNews.map((article, index) => (
                <a
                  key={index}
                  className="home-item-card"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="home-item-media">
                    <img
                      className="home-item-image"
                      src={article.urlToImage || FALLBACK_IMAGES.news}
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.news;
                      }}
                    />
                  </div>
                  <div className="home-item-body">
                    <p className="home-item-meta">
                      {article.source?.name || "News"}&nbsp;·&nbsp;
                      {timeAgo(article.publishedAt)}
                    </p>
                    <h3 className="home-item-title">{article.title}</h3>
                  </div>
                </a>
              ))
            ) : (
              <p className="home-items-empty">
                News highlights will be listed here soon.
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;
