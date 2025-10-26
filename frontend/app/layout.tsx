import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "의료 가이드라인 검색",
  description: "한국 의학회 진료지침서 AI 검색 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
