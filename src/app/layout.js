import "@/styles/custom.css";
import SiteScripts from "@/components/SiteScripts";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GA_ID = "G-9SSDHVEK3M";

export const metadata = {
  title: "Rent-A-Pot",
  description: "Rent-A-Pot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
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
