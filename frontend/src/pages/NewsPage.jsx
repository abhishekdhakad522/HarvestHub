import { useState, useEffect } from "react";
import { fetchFarmingNewsPage } from "../lib/news";

const PAGE_SIZE = 12;

const TOPICS = [
  { id: "farming", label: "Farming", query: "farming" },
  { id: "agriculture", label: "Agriculture", query: "agriculture" },
  { id: "crops-harvest", label: "Crops & Harvest", query: "crops harvest" },
  { id: "organic", label: "Organic", query: "organic farming" },
  { id: "livestock", label: "Livestock", query: "livestock" },
  { id: "agritech", label: "AgriTech", query: "agricultural technology" },
  { id: "schemes", label: "Schemes", query: "farmers government schemes agriculture subsidy" },
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("farming");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const activeTopic = TOPICS.find((t) => t.id === topic) || TOPICS[0];
  const canLoadMore = articles.length < totalResults;

  useEffect(() => {
    async function loadNews() {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const response = await fetchFarmingNewsPage(activeTopic.query, page, PAGE_SIZE);
        const nextItems = response.articles.filter(
          (a) => a.title && a.title !== "[Removed]",
        );

        setTotalResults(response.totalResults);
        setArticles((currentItems) => {
          if (page === 1) {
            return nextItems;
          }

          const seen = new Set(currentItems.map((item) => item.url));
          const uniqueNewItems = nextItems.filter((item) => !seen.has(item.url));
          return [...currentItems, ...uniqueNewItems];
        });
      } catch (err) {
        setError(err.message);
      } finally {
        if (page === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    }

    loadNews();
  }, [activeTopic.query, page]);

  const handleTopicChange = (nextTopic) => {
    setTopic(nextTopic);
    setPage(1);
    setArticles([]);
    setTotalResults(0);
  };

  const handleLoadMore = () => {
    if (loadingMore || !canLoadMore) {
      return;
    }

    setPage((currentValue) => currentValue + 1);
  };

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
            onClick={() => handleTopicChange(t.id)}
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
        <>
          <div className="news-grid">
            {articles.map((article, index) => (
              <article key={`${article.url || article.title}-${index}`} className="news-card">
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

          {canLoadMore ? (
            <div className="news-load-more-wrap">
              <button
                type="button"
                className="secondary-button news-load-more-button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading more..." : "Load more news"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default NewsPage;
