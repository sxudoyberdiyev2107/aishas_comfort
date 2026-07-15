import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  variable: "--font-oswald",
});

export const metadata = {
  title: "Aisha's Comfort | Ergonomik Mebel va Aksessuarlar",
  description: "Premium o'quv partalari, stullar, professional o'yin (gaming) kreslolari va kitob javonlari onlayn do'koni.",
  icons: {
    icon: "/brand/Aishas_Comfort_Symbol_Primary.svg",
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <LanguageProvider>
          <div className="app-layout">
            <Header />
            <div className="page-wrapper">
              {children}
            </div>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
