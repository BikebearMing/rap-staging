import "@/styles/custom.css";
import SiteScripts from "@/components/SiteScripts";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { siteSchema } from "@/lib/schema";
import { getSiteSettings } from "@/lib/wp";

const GA_ID = "G-9SSDHVEK3M";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({ children }) {
  const site = await getSiteSettings();

  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
      </head>
      <body>
        {/* Business and website structured data, on every page */}
        <JsonLd data={siteSchema(site)} />
        <SiteScripts />
        <PageTransition />
        <Header />
        {/* Page transitions shrink and slide this as one card (see custom.css) */}
        <div className="site-page">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
