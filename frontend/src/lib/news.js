const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export async function fetchFarmingNews(topic = "farming", pageSize = 12) {
  if (!NEWS_API_KEY) {
    throw new Error("News API key is not configured");
  }

  const url = new URL(`${NEWS_API_BASE_URL}/everything`);
  url.searchParams.set("apiKey", NEWS_API_KEY);
  url.searchParams.set("q", topic);
  url.searchParams.set("pageSize", pageSize.toString());
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch news");
  }

  const data = await response.json();
  return data.articles || [];
}

export async function searchNews(query, pageSize = 12) {
  if (!NEWS_API_KEY) {
    throw new Error("News API key is not configured");
  }

  const url = new URL(`${NEWS_API_BASE_URL}/everything`);
  url.searchParams.set("apiKey", NEWS_API_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("pageSize", pageSize.toString());
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to search news");
  }

  const data = await response.json();
  return data.articles || [];
}
