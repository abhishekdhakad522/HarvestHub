import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { getPublishedPosts } from "../lib/posts.js";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";

function formatDate(value) {
  if (!value) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildExcerpt(content) {
  if (!content) {
    return "Read the latest article from HarvestHub.";
  }

  return content.length > 180 ? `${content.slice(0, 180).trim()}...` : content;
}

function ArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    };

    loadUser();
    window.addEventListener("harvesthub:authchange", loadUser);

    return () => {
      window.removeEventListener("harvesthub:authchange", loadUser);
    };
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getPublishedPosts({ page: currentPage, limit: 18 });
        setPosts(Array.isArray(response?.posts) ? response.posts : []);
        setTotalPages(response?.pagination?.totalPages || 1);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load articles right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((previousValue) => Math.max(1, previousValue - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previousValue) => Math.min(totalPages, previousValue + 1));
  };

  return (
    <section className="articles-page">
      <div className="articles-top-bar">
        <div>
          <p className="eyebrow">From the community</p>
          <h1>Articles</h1>
          <p className="hero-copy articles-copy">
            Read farming updates, market trends, success stories, and practical tips
            published directly from the HarvestHub community.
          </p>
        </div>

        {user ? (
          <Link className="shop-add-product-button" to="/posts/new">
            + Add post
          </Link>
        ) : null}
      </div>

      {isLoading ? <p className="articles-status">Loading articles...</p> : null}

      {!isLoading && errorMessage ? (
        <p className="articles-status articles-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && posts.length === 0 ? (
        <p className="articles-status">No published articles available yet.</p>
      ) : null}

      {!isLoading && !errorMessage && posts.length > 0 ? (
        <>
          <div className="articles-grid">
            {posts.map((post) => (
              <article className="article-card" key={post._id || post.slug}>
                <Link className="article-card-link" to={`/articles/${post.slug || post._id || post.id}`}>
                  <img
                    className="article-image"
                    src={post.imageUrl || DEFAULT_POST_IMAGE}
                    alt={post.title}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_POST_IMAGE;
                    }}
                  />

                  <div className="article-content">
                    <div className="article-meta-row">
                      <span className="article-category">{post.category || "general"}</span>
                      <span className="article-date">{formatDate(post.createdAt)}</span>
                    </div>

                    <h2>{post.title}</h2>

                    <p className="article-excerpt">{buildExcerpt(post.content)}</p>

                    <div className="article-footer">
                      <span className="article-author">
                        By {post.author?.username || "HarvestHub"}
                      </span>
                      <span className="article-views">{post.views || 0} views</span>
                    </div>

                    <span className="article-open-link">Open post</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="articles-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="articles-page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="secondary-button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default ArticlesPage;