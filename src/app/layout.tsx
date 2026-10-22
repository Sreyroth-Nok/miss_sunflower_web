import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miss Sunflower — Sun Serum SPF 50+ PA++++",
  description:
    "Discover Miss Sunflower Sun Serum SPF 50+ PA++++ — a lightweight, hydrating daily sun serum that protects and illuminates without white cast.",
  keywords: [
    "Miss Sunflower",
    "sun serum",
    "SPF 50+",
    "PA++++",
    "sunscreen",
    "skincare",
    "glow",
    "sunflower",
  ],
  openGraph: {
    title: "Miss Sunflower — Sun Serum SPF 50+ PA++++",
    description:
      "Let Your Glow Meet the Sun. Discover Miss Sunflower — your daily sun-care ritual.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
