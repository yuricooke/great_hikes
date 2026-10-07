import type { Metadata, Viewport } from "next";
import { Exo_2, Mukta } from "next/font/google";

import Menu from "@/components/Menu/Menu";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "@/styles/globals.css";

const exo2 = Exo_2({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-exo2" });
const mukta = Mukta({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-mukta" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#090909",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${exo2.variable} ${mukta.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Menu />
        <main id="main" className="page">
          {children}
        </main>
      </body>
    </html>
  );
}
