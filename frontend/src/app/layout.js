import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Shriftlar self-host qilingan (next/font/local) — build Google Fonts'ga
// umuman ulanmaydi (tarmoq muammosi build'ni yiqitmaydi). Har biri variable
// woff2, to'liq belgilar to'plami: lotin + kirill (rus tili) + o'zbek
// harflari. Fayllar frontend/src/fonts/ ichida, litsenzasi SIL OFL.

// Oswald — faqat bitta joyda (mahsulot sahifasi video sarlavhasi)
// var(--font-oswald) orqali ishlatiladi. Avvalgidek 600 qalinlik.
const oswald = localFont({
  src: "../fonts/Oswald-Variable.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-oswald",
});

// Manrope — rasmiy brend shrifti. --font-manrope o'zgaruvchisi orqali
// Header va Katalog panellarida ishlatiladi (qolgan saytga tegilmaydi).
const manrope = localFont({
  src: "../fonts/Manrope-Variable.woff2",
  weight: "400 700",
  display: "swap",
  variable: "--font-manrope",
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
    <html lang="uz" className={`${oswald.variable} ${manrope.variable}`}>
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
