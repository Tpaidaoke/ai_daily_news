import { fetchAllNews, formatNewsSummary } from "../lib/rss_utils";
import { inngest } from "./client";
import { Resend } from "resend";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const sendDailyNews = inngest.createFunction(
  { id: "send-daily-news" },
  // { event: "test/send.daily.news" },
  { cron: "0 9 * * *" },
  async ({ event, step }) => {
    // 从 RSS 源获取新闻
    const newsItems = await step.run("fetch-news", async () => {
      console.log("Fetching news...");
      const news = await fetchAllNews();
      console.log("Fetched news:", news.length, "news items");
      return news;
    });

    // 整理新闻为每日摘要
    const newsSummary = await step.run("format-news", async () => {
      console.log("Formatting news summary...");
      const summary = formatNewsSummary(newsItems);
      return summary;
    });

    // 创建邮件内容
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { data, error } = await step.run("create-email", async () => {
      console.log("Sending email...");
      const result = await resend.broadcasts.create({
        from: "每日AI新闻 <wulan@wulan.de5.net>",
        segmentId: process.env.RESEND_SEGMENT_ID || "",
        subject:
          "每日AI新闻 " +
          new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        html: newsSummary.html,
      });
      return result;
    });

    if (error) {
      console.error("创建邮件失败:", error);
      return { error: error.message };
    }

    // 发送邮件
    const { error: sendError } = await step.run("send-email", async () => {
      console.log("开始发送邮件...");
      const result = await resend.broadcasts.send(data?.id!);
      return result;
    });

    if (sendError) {
      console.error("发送邮件失败:", sendError);
      return { error: sendError.message };
    }
  }
);
