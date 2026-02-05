import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日新闻",
  description: "每日新闻，一站式满足你的新闻需求",
};

export default function DailyNewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
