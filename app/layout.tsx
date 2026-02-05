import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Daily News",
  description:
    "AI Daily News is your go-to source for the latest updates and insights in the world of artificial intelligence.",
};

export default function DailyNewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0a0a0a]">{children}</body>
    </html>
  );
}
