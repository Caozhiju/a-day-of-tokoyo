import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "梦华一日 - 在东京梦华录中过一天",
  description: "穿越北宋东京城，体验普通人的一天。沉浸式宋代文化体验平台。",
  keywords: "东京梦华录, 宋代文化, 传统文化, 梦华一日",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-chinese">
        <div className="absolute inset-0 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
