import { fetchAllNews, NewsItem } from "@/lib/rss_utils";
import { NextResponse } from "next/server";

const categoryKeywords: Record<string, string[]> = {
  ai: ["ai", "artificial intelligence", "machine learning", "deep learning", "llm", "language model", "neural", "gpt", "claude", "gemini"],
  startup: ["startup", "start-up", "venture", "funding", "investor", "ipo", "acquisition", "seed", "series a", "series b", "founder", "entrepreneur"],
  tech: ["algorithm", "architecture", "api", "sdk", "framework", "benchmark", "research paper", "implementation", "optimization", "performance"],
  trend: ["trend", "forecast", "prediction", "market", "industry", "adoption", "growth", "future", "analysis", "report"],
};

function filterNewsByCategory(news: NewsItem[], category: string): NewsItem[] {
  if (category === "all") return news;

  const keywords = categoryKeywords[category] || [];
  if (keywords.length === 0) return news;

  return news.filter((item) => {
    const text = `${item.title} ${item.description || ""} ${item.source}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "all";
    const pageSize = 6;

    const allNews = await fetchAllNews();
    const filteredNews = filterNewsByCategory(allNews, category);

    const startIndex = (page - 1) * pageSize;
    const paginatedNews = filteredNews.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({ news: paginatedNews });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
