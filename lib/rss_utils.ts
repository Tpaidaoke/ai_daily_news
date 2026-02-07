import Parser from "rss-parser";

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  source: string;
  category?: "quick" | "deep" | "followup";
  keywords?: string[];
  summary?: string;
  clusterId?: string;
}

const RSS_FEEDS = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "followup" as const,
  },
  {
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    category: "quick" as const,
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/full.xml",
    category: "followup" as const,
  },
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    category: "deep" as const,
  },
  {
    name: "DeepMind",
    url: "https://deepmind.com/blog/feed/basic/",
    category: "deep" as const,
  },
  {
    name: "Stripe Blog",
    url: "https://stripe.com/blog/feed.rss",
    category: "deep" as const,
  },
  {
    name: "The Pragmatic Engineer",
    url: "https://blog.pragmaticengineer.com/rss/",
    category: "deep" as const,
  },
  {
    name: "MIT Tech Review - AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
    category: "followup" as const,
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "deep" as const,
  },
  {
    name: "ArXiv - AI",
    url: "https://arxiv.org/rss/cs.AI",
    category: "quick" as const,
  },
  {
    name: "ArXiv - LG",
    url: "https://arxiv.org/rss/cs.LG",
    category: "quick" as const,
  },
  {
    name: "First Round Review",
    url: "https://firstround.com/review.xml",
    category: "deep" as const,
  },
  {
    name: "The Batch",
    url: "https://www.deeplearning.ai/the-batch/feed/",
    category: "deep" as const,
  },
];

const KEYWORDS = [
  "GPT", "Llama", "Claude", "Mistral", "开源",
  "安全", "安全漏洞", "攻击", "防护",
  "伦理", "偏见", "监管", "合规",
  "AGI", "SuperIntelligence", "通用人工智能",
  "Agent", "Agents", "多智能体",
  "RAG", "检索增强",
  "蒸馏", "Distillation",
  "Transformer", "注意力机制",
];

async function fetchRSSFeed(
  feedUrl: string,
  sourceName: string,
  category?: "quick" | "deep" | "followup"
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = (feed.items || []).slice(0, 5).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || undefined,
      description: item.contentSnippet || item.content || "",
      source: sourceName,
      category: category,
    }));
    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${sourceName}:`, error);
    return [];
  }
}

function extractKeywords(text: string): string[] {
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  for (const keyword of KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      found.add(keyword);
    }
  }
  
  return Array.from(found);
}

function normalizeTitle(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getClusterKey(title: string): string {
  const words = normalizeTitle(title).split(" ").filter(w => w.length > 3);
  return words.slice(0, 4).join(" ");
}

function clusterNews(news: NewsItem[]): NewsItem[] {
  const clusters = new Map<string, NewsItem[]>();
  
  for (const item of news) {
    if (item.title.length < 20) {
      if (!clusters.has(item.title)) {
        clusters.set(item.title, []);
      }
      clusters.get(item.title)!.push(item);
    } else {
      const key = getClusterKey(item.title);
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(item);
    }
  }
  
  const result: NewsItem[] = [];
  let clusterId = 0;
  
  for (const [key, items] of clusters) {
    if (items.length > 1) {
      for (const item of items) {
        result.push({ ...item, clusterId: clusterId.toString() });
      }
      clusterId++;
    } else {
      result.push(items[0]);
    }
  }
  
  return result;
}

function generateSimpleSummary(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.replace(/<[^>]*>/g, "");
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  
  if (sentences.length === 0) return "";
  
  return [
    sentences[0].trim() + ".",
    sentences.length > 1 ? sentences[Math.floor(sentences.length / 2)].trim() + "." : "",
    sentences[sentences.length - 1].trim() + ".",
  ].filter(s => s).join(" ");
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const allNewsPromises = RSS_FEEDS.map((feed) =>
    fetchRSSFeed(feed.url, feed.name, feed.category)
  );

  const allNewsArrays = await Promise.all(allNewsPromises);
  let allNews = allNewsArrays.flat();

  for (const item of allNews) {
    const fullText = `${item.title} ${item.description || ""}`;
    item.keywords = extractKeywords(fullText);
    
    if (item.keywords.length > 0 && (item.description?.length || 0) > 100) {
      item.summary = generateSimpleSummary(item.title, item.description);
    }
  }

  allNews = clusterNews(allNews);

  return allNews.sort((a, b) => {
    if (!a.pubDate || !b.pubDate) return 0;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}

export function formatNewsSummary(newsItems: NewsItem[]): {
  summary: string;
  html: string;
} {
  const topNews = newsItems.slice(0, 15);

  const newsBySource = topNews.reduce((acc, item) => {
    if (!acc[item.source]) {
      acc[item.source] = [];
    }
    acc[item.source].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  let summaryText = "📰 每日新闻摘要\n\n";
  Object.entries(newsBySource).forEach(([source, items]) => {
    summaryText += `\n【${source}】\n`;
    items.forEach((item, index) => {
      summaryText += `${index + 1}. ${item.title}\n`;
      if (item.description) {
        const shortDesc = item.description.substring(0, 100);
        summaryText += `   ${shortDesc}${item.description.length > 100 ? "..." : ""}\n`;
      }
      summaryText += `   链接: ${item.link}\n\n`;
    });
  });

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px;">
        📰 每日新闻摘要
      </h1>
      <p style="color: #666; font-size: 14px;">
        ${new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>
  `;

  Object.entries(newsBySource).forEach(([source, items]) => {
    htmlContent += `
      <div style="margin: 30px 0;">
        <h2 style="color: #007bff; border-left: 4px solid #007bff; padding-left: 10px;">
          ${source}
        </h2>
    `;

    items.forEach((item) => {
      htmlContent += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">
            <a href="${item.link}" style="color: #007bff; text-decoration: none;">
              ${item.title}
            </a>
          </h3>
          ${item.description ? `
            <p style="color: #666; line-height: 1.6; margin: 10px 0;">
              ${item.description.substring(0, 200)}${item.description.length > 200 ? "..." : ""}
            </p>
          ` : ""}
          ${item.pubDate ? `
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              📅 ${new Date(item.pubDate).toLocaleString("zh-CN")}
            </p>
          ` : ""}
          <a href="${item.link}" style="color: #007bff; text-decoration: none; font-size: 14px;">
            Read More →
          </a>
        </div>
      `;
    });

    htmlContent += `</div>`;
  });

  htmlContent += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px;">
        <p>感谢订阅每日新闻摘要</p>
        <p>本摘要由多个新闻源自动整理生成</p>
      </div>
    </div>
  `;

  return {
    summary: summaryText,
    html: htmlContent,
  };
}

export function filterNewsByCategory(
  news: NewsItem[],
  category: "quick" | "deep" | "followup" | "all",
  keyword?: string
): NewsItem[] {
  let filtered = news;
  
  if (category !== "all") {
    filtered = filtered.filter(item => item.category === category);
  }
  
  if (keyword) {
    const lower = keyword.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(lower) ||
      item.description?.toLowerCase().includes(lower) ||
      item.keywords?.some(k => k.toLowerCase().includes(lower))
    );
  }
  
  return filtered;
}
