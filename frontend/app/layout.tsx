import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Ruleout",
  description: "한국 의학회 진료지침서 AI 검색 플랫폼",
  icons: {
    icon: [
      { url: '/image/clinical4-Photoroom.png', sizes: '32x32', type: 'image/png' },
      { url: '/image/clinical4-Photoroom.png', sizes: '64x64', type: 'image/png' },
      { url: '/image/clinical4-Photoroom.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: '/image/clinical4-Photoroom.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
