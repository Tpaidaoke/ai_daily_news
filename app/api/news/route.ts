import { NextRequest, NextResponse } from "next/server";
import { fetchAllNews, filterNewsByCategory } from "../../../lib/rss_utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") as "quick" | "deep" | "followup" | "all" | null;
  const keyword = searchParams.get("keyword");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const allNews = await fetchAllNews();
    const filtered = filterNewsByCategory(
      allNews,
      category || "all",
      keyword || undefined
    );

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedNews = filtered.slice(start, end);

    return NextResponse.json({
      news: paginatedNews,
      total: filtered.length,
      page,
      hasMore: end < filtered.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
