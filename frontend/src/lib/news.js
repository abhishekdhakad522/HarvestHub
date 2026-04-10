import axios from "axios";

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const url= import.meta.env.VITE_NEWS_URL;

async function fetchNewsPage(topic = "farming", page = 1, pageSize = 12) {
  if (!NEWS_API_KEY) {
    throw new Error("News API key is not configured");
  }
  try{
  const response = await axios.get(url.toString());
  return response.data.results || [];
  }catch(error){
    console.error("Error fetching news:", error);
    throw new Error(error.message || "Failed to fetch news");   
  }
  return [];
}
export { fetchNewsPage };