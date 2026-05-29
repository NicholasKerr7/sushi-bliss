import "./globals.css";
import localFont from "next/font/local";

const bodyFont = localFont({
  src: [
    { path: "./fonts/space-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/space-grotesk-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/space-grotesk-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/space-grotesk-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const displayFont = localFont({
  src: [
    { path: "./fonts/chakra-petch-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/chakra-petch-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/chakra-petch-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/chakra-petch-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: "Sushi Bliss",
  description: "Mobile-web app for a sushi restaurant",
};

/** Provides the global document shell and bundled local fonts. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-brand-ink">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased text-white bg-brand-ink`}>
        {children}
      </body>
    </html>
  );
}
