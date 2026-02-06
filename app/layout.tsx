import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
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
      {/* <meta
        name="google-adsense-account"
        content="ca-pub-5659389507566454"
      ></meta> */}
      <body className="bg-[#0a0a0a]">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
