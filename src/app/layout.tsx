import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "SEO Onpage Generator",
  description: "สร้างเนื้อหา SEO คุณภาพสูงสำหรับเว็บไซต์ของคุณ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.className} min-h-screen bg-gray-50`} suppressHydrationWarning>
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
