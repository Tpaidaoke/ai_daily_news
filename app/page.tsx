"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { NewspaperIcon, Sparkles, ExternalLink, Clock, ChevronDown, ChevronUp, FileText, Globe, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Brain, Rocket, Cpu, TrendingUp } from "lucide-react";

interface NewsItem {
  title: string;
  description?: string | null;
  source?: string | null;
  pubDate?: string;
  link: string;
}

type TranslationValue = string | ((n: number) => string);

const translations: Record<string, Record<string, TranslationValue>> = {
  zh: {
    title: "每日新闻资讯",
    subtitle: "AI 每日新闻资讯",
    description: "关注最新的科技动态、行业趋势和社会事件，为你提供及时、有价值的资讯。",
    subscribeTitle: "订阅每日新闻摘要，发送到你的邮箱",
    subscribeBtn: "订阅",
    emailPlaceholder: "输入你的邮箱",
    hotNews: "热点新闻",
    loading: "加载中...",
    newsCount: (n: number) => `${n} 条新闻`,
    noNews: "暂无新闻",
    noNewsDesc: "该分类下暂时没有新闻内容",
    expandBtn: "展开查看更多",
    collapseBtn: "收起",
    readMore: "访问原文",
    from: "来自",
    footer: "© 2026 AI每日新闻. All rights reserved.",
    footerSource: "新闻来源: TechCrunch, The Verge, MIT News 等",
    subscribeSuccess: "订阅成功",
    subscribeFail: "订阅失败",
    invalidEmail: "请输入有效的邮箱地址",
    loadMore: "加载更多中...",
    noMore: "没有更多新闻了",
    all: "全部",
    ai: "人工智能",
    startup: "初创动态",
    tech: "技术深度",
    trend: "行业趋势",
    justNow: "刚刚发布",
    hoursAgo: (h: number) => `${h}小时前`,
    yesterday: "昨天",
    daysAgo: (d: number) => `${d}天前`,
  },
  en: {
    title: "Daily News",
    subtitle: "AI Daily News",
    description: "Stay updated with the latest tech news, industry trends, and valuable insights.",
    subscribeTitle: "Subscribe to daily news digest delivered to your email",
    subscribeBtn: "Subscribe",
    emailPlaceholder: "Enter your email",
    hotNews: "Trending News",
    loading: "Loading...",
    newsCount: (n: number) => `${n} articles`,
    noNews: "No News",
    noNewsDesc: "No news available in this category",
    expandBtn: "Read more",
    collapseBtn: "Show less",
    readMore: "Read original",
    from: "Source",
    footer: "© 2026 AI Daily News. All rights reserved.",
    footerSource: "Sources: TechCrunch, The Verge, MIT News, and more",
    subscribeSuccess: "Subscribed successfully!",
    subscribeFail: "Subscription failed",
    invalidEmail: "Please enter a valid email address",
    loadMore: "Loading more...",
    noMore: "No more news",
    all: "All",
    ai: "AI",
    startup: "Startups",
    tech: "Technology",
    trend: "Trends",
    justNow: "Just now",
    hoursAgo: (h: number) => `${h}h ago`,
    yesterday: "Yesterday",
    daysAgo: (d: number) => `${d}d ago`,
  },
};

const sourceColors: Record<string, string> = {
  "TechCrunch": "text-orange-400 bg-orange-500/20",
  "The Verge": "text-purple-400 bg-purple-500/20",
  "MIT News": "text-gray-400 bg-gray-500/20",
  "Hacker News": "text-orange-400 bg-orange-500/20",
  "OpenAI Blog": "text-green-400 bg-green-500/20",
  "DeepMind": "text-blue-400 bg-blue-500/20",
  "Stripe Blog": "text-indigo-400 bg-indigo-500/20",
};

const sourceColorsEn: Record<string, string> = {
  "TechCrunch": "text-orange-400 bg-orange-500/20",
  "The Verge": "text-purple-400 bg-purple-500/20",
  "MIT News": "text-gray-400 bg-gray-500/20",
  "Hacker News": "text-orange-400 bg-orange-500/20",
  "OpenAI Blog": "text-green-400 bg-green-500/20",
  "DeepMind": "text-blue-400 bg-blue-500/20",
  "Stripe Blog": "text-indigo-400 bg-indigo-500/20",
};

const tabs = [
  { id: "all", labelKey: "all", icon: <Sparkles className="w-4 h-4" />, color: "blue" },
  { id: "ai", labelKey: "ai", icon: <Brain className="w-4 h-4" />, color: "blue" },
  { id: "startup", labelKey: "startup", icon: <Rocket className="w-4 h-4" />, color: "purple" },
  { id: "tech", labelKey: "tech", icon: <Cpu className="w-4 h-4" />, color: "emerald" },
  { id: "trend", labelKey: "trend", icon: <TrendingUp className="w-4 h-4" />, color: "orange" },
];

const tabColorMap: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const tabActiveColorMap: Record<string, string> = {
  blue: "bg-blue-600 text-white border-blue-600",
  purple: "bg-purple-600 text-white border-purple-600",
  emerald: "bg-emerald-600 text-white border-emerald-600",
  orange: "bg-orange-600 text-white border-orange-600",
};

const tabColorMapEn: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const tabActiveColorMapEn: Record<string, string> = {
  blue: "bg-blue-600 text-white border-blue-600",
  purple: "bg-purple-600 text-white border-purple-600",
  emerald: "bg-emerald-600 text-white border-emerald-600",
  orange: "bg-orange-600 text-white border-orange-600",
};

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

function useLanguage() {
  return useContext(LanguageContext);
}

function formatDate(dateStr?: string, lang: string = "en"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (lang === "zh") {
    if (hours < 1) return "刚刚发布";
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return "昨天";
    return `${days}天前`;
  } else {
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return `${days}d ago`;
  }
}

function cleanText(text: string | null | undefined) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function NewsCard({ item }: { item: NewsItem }) {
  const { lang, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const sourceDisplay = item.source || "Unknown";
  const sourceColor = sourceColors[item.source || ""] || sourceColorsEn[item.source || ""] || "text-blue-400 bg-blue-500/20";
  const fullText = cleanText(item.description);
  const truncatedText = fullText.length > 100 ? fullText.substring(0, 100) + "..." : fullText;
  const needTruncate = fullText.length > 100;

  return (
    <div 
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300"
      onClick={() => { if (!expanded) setExpanded(true); }}
    >
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {sourceDisplay}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatDate(item.pubDate, lang)}
          </span>
        </div>
        
        <h3 className="text-[15px] font-semibold text-white leading-snug mb-3">
          {item.title}
        </h3>
        
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {needTruncate && !expanded ? truncatedText : fullText}
        </p>
        
        {!expanded && needTruncate && (
          <button
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mb-2"
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          >
            <ChevronDown className="w-3.5 h-3.5" />
            {t("expandBtn")}
          </button>
        )}
        
        {expanded ? (
          <div className="flex gap-4 items-center pt-3 border-t border-white/10">
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("readMore")}
            </a>
            
            <button
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              {t("collapseBtn")}
            </button>
          </div>
        ) : !needTruncate && (
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-3 pt-3 border-t border-white/10 inline-flex"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t("readMore")}
          </a>
        )}
        
        <div className="text-xs text-gray-500 mt-3">
          {t("from")}: {sourceDisplay}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 bg-white/10 rounded w-16"></div>
            <div className="h-4 bg-white/10 rounded w-20"></div>
          </div>
          <div className="h-6 bg-white/10 rounded w-full mb-3"></div>
          <div className="h-20 bg-white/10 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState("en");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const t = useCallback((key: string) => {
    const trans = translations[lang];
    const value = trans[key];
    if (typeof value === "function") return key;
    return value || key;
  }, [lang]);

  useEffect(() => {
    fetchNews(1, true);
  }, [activeTab]);

  async function fetchNews(pageNum: number, reset: boolean = false) {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(`/api/news?page=${pageNum}&category=${activeTab}&lang=${lang}`);
      const data = await res.json();
      
      if (data.news) {
        if (reset) {
          setNews(data.news);
        } else {
          setNews(prev => [...prev, ...data.news]);
        }
        setHasMore(data.news.length >= 6);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
      toast.error(t("subscribeFail"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchNews(page + 1);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  function validateEmail(email_addr: string) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email_addr.trim());
  }

  const handleSubscribe = () => {
    if (!validateEmail(email)) {
      toast.error(t("invalidEmail"));
      return;
    }

    fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success(t("subscribeSuccess"));
        }
      })
      .catch(() => {
        toast.error(t("subscribeFail"));
      })
      .finally(() => {
        setEmail("");
      });
  };

  const toggleLanguage = () => {
    setLang(lang === "zh" ? "en" : "zh");
  };

  const activeColorMap = lang === "zh" ? tabColorMap : tabColorMapEn;
  const activeTabColorMap = lang === "zh" ? tabActiveColorMap : tabActiveColorMapEn;

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLanguage, t }}>
      <div className="w-full min-h-screen bg-[#0a0a0a] bg-decorative flex flex-col">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <NewspaperIcon className="text-blue-500 w-6 h-6" />
              <h1 className="text-xl md:text-2xl font-bold text-white">{t("title")}</h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{lang === "zh" ? "EN" : "中文"}</span>
            </button>
          </div>
        </header>

        <div className="flex-grow w-full max-w-7xl mx-auto py-8 md:py-12 px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {t("subtitle")}
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-10 max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <p className="text-gray-300 font-medium">{t("subscribeTitle")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="flex-1 p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubscribe}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("subscribeBtn")}
              </button>
            </div>
          </div>

            <section id="news">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">{t("hotNews")}</h3>
                <button
                  onClick={() => {
                    setIsRefreshing(true);
                    fetchNews(1, true).then(() => setIsRefreshing(false));
                  }}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                  title={t("loading")}
                >
                  <RotateCcw className={`w-5 h-5 text-gray-500 hover:text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                    setHasMore(true);
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? activeTabColorMap[tab.color]
                      : `${activeColorMap[tab.color]} hover:bg-white/5`
                  }`}
                >
                  {tab.icon}
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : news.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {news.map((item, index) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>
                
                <div ref={loadMoreRef} className="mt-8 text-center">
                  {loadingMore && (
                    <div className="inline-flex items-center gap-2 text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      {t("loadMore")}
                    </div>
                  )}
                  {!hasMore && news.length > 0 && (
                    <p className="text-gray-500 text-sm">{t("noMore")}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 text-lg mb-2">{t("noNews")}</p>
                <p className="text-gray-500 text-sm">{t("noNewsDesc")}</p>
              </div>
            )}
          </section>
        </div>

        <footer className="w-full bg-white/5 border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400">{t("footer")}</p>
            <p className="text-sm text-gray-600 mt-2">{t("footerSource")}</p>
          </div>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}
