import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-noto-serif-sc",
});

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
    <html lang="zh-CN" className={notoSerifSC.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-chinese">
        <div className="absolute inset-0 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
