import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./journey.css";

export const metadata: Metadata = {
  title: {
    default: "Prashant Bhattarai — Mechanical Engineering",
    template: "%s | Prashant Bhattarai",
  },
  description: "The engineering portfolio of Prashant Bhattarai. Mechanical engineering at Mississippi State University, brought to life through design, research, and hands-on problem solving.",
  openGraph: {
    title: "Prashant Bhattarai — Engineered to move forward.",
    description: "Mechanical engineering. Thoughtful design. Real-world impact. Explore my work.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#101311" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
