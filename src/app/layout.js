import "@/styles/custom.css";
import SiteScripts from "@/components/SiteScripts";
import PageTransition from "@/components/PageTransition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Rent-A-Pot",
  description: "Rent-A-Pot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
