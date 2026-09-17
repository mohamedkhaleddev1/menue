import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});
export const metadata: Metadata = {
  title: "Savor & Co. — Digital Menu",
  description: "Season-led comfort food, crafted with soul.",
  openGraph: { title: "Savor & Co.", description: "Explore our latest menu." },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
