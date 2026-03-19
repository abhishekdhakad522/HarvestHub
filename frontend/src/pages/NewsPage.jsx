import { useState, useEffect } from "react";
import { fetchFarmingNews } from "../lib/news";

const TOPICS = [
  { id: "farming", label: "Farming" },
  { id: "agriculture", label: "Agriculture" },
  { id: "crops harvest", label: "Crops & Harvest" },
  { id: "organic farming", label: "Organic" },
  { id: "livestock", label: "Livestock" },
  { id: "agricultural technology", label: "AgriTech" },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("farming");

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      setError(null);
      try {
        const news = await fetchFarmingNews(topic, 12);
        setArticles(news.filter((a) => a.title && a.title !== "[Removed]"));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [topic]);

  return (
    <section className="news-page">
      <div className="news-top-bar">
        <div className="news-copy">
          <p className="eyebrow">Latest updates</p>
          <h1>Farming News</h1>
          <p className="hero-copy">
            Stay up to date with the latest farming and agriculture news.
            Discover trends, techniques, and stories from farmers worldwide.
          </p>
        </div>
      </div>

      <div className="news-categories">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            className={`news-category-button ${topic === t.id ? "active" : ""}`}
            onClick={() => setTopic(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="news-status">Loading news...</p>}

      {error && (
        <div className="news-api-notice">
          <p>
            <strong>API Key Required:</strong> To display news, add your NewsAPI
            key to the environment variables as <code>VITE_NEWS_API_KEY</code>.
          </p>
          <p>
            Get a free API key at{" "}
            <a
              href="https://newsapi.org/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              newsapi.org
            </a>
          </p>
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="news-empty-state">
          <p>No news articles available at the moment.</p>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="news-grid">
          {articles.map((article, index) => (
            <article key={index} className="news-card">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card-link"
              >
                {article.urlToImage ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="news-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="news-image-placeholder"
                  style={{ display: article.urlToImage ? "none" : "flex" }}
                >
                  📰
                </div>
                <div className="news-content">
                  <div className="news-meta-row">
                    <span className="news-source">
                      {article.source?.name || "Unknown"}
                    </span>
                    <span className="news-date">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h2>{article.title}</h2>
                  {article.description && (
                    <p className="news-excerpt">{article.description}</p>
                  )}
                  <div className="news-footer">
                    <span className="news-author">
                      {article.author || "Unknown Author"}
                    </span>
                    <span className="news-read-more">
                      Read more
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default NewsPage;
