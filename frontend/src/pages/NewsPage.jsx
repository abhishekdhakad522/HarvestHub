import { useState, useEffect } from "react";
import { fetchFarmingNews } from "../lib/news";



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

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      setError(null);
      try {
        const news = await fetchFarmingNews("farming", 12);
        setArticles(news);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

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

      {loading && <p className="news-status">Loading news...</p>}

      {error && (
        <div className="news-api-notice">
           <h1>Error fetching newsData.</h1>
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
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card-link"
              >
                {article.image_url ? (
                  <img
                    src={article.image_url}
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
                  style={{ display: article.image_url ? "none" : "flex" }}
                >
                  📰
                </div>
                <div className="news-content">
                  <div className="news-meta-row">
                    <span className="news-source">
                      {article.source_name || "Unknown"}
                    </span>
                    <span className="news-date">
                      {formatDate(article.pubDate)}
                    </span>
                  </div>
                  <h2>{article.title}</h2>
                  <p className="news-excerpt">{article.description}</p>
                
                  <div className="news-footer">
                    <span className="news-author">
                      {article.creator?.length>0? article.creator[0] : "Unknown Author"}
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
