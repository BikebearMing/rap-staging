import "@/styles/custom.css";
import SiteScripts from "@/components/SiteScripts";
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
