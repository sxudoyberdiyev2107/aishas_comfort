'use client';

// Mobil pastki navigatsiya paneli (bottom bar) — faqat kichik ekranda
// (max-width: 1023px). Ekran pastida doim ko'rinib turadi (fixed), 5 ta
// teng tugma: Bosh sahifa, Katalog, Savat, Qo'ng'iroq, Telegram.
//
// Holat qayta ishlatiladi (yangi mantiq yozilmaydi):
//   - onOpenCatalog  → Header'dagi MobileCatalog'ni ochadi (aynan bir xil).
//   - cartCount      → Header'dagi mavjud savat count'i (badge uchun).
// Telefon/Telegram manzillari env'dan, fallback bilan (build vaqtida inline).

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

// Telefon raqami va Telegram — NEXT_PUBLIC_* dan; yo'q bo'lsa fallback.
const PHONE = process.env.NEXT_PUBLIC_PHONE || '+998770043324';
const TELEGRAM_RAW = process.env.NEXT_PUBLIC_TELEGRAM || 'aishas_comfort_uz';
// tel: uchun bo'shliqlarni olib tashlaymiz.
const PHONE_HREF = `tel:${PHONE.replace(/\s+/g, '')}`;
// To'liq URL berilса o'shани, aks holda username'ni t.me ga qo'shamiz.
const TELEGRAM_URL = /^https?:\/\//.test(TELEGRAM_RAW)
  ? TELEGRAM_RAW
  : `https://t.me/${TELEGRAM_RAW.replace(/^@/, '')}`;

// 24px, 2px stroke ikonкалar — currentColor (navy → :active da coral).
const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const HomeIcon = (
  <svg {...svgProps}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </svg>
);

const CatalogIcon = (
  <svg {...svgProps}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </svg>
);

const CartIcon = (
  <svg {...svgProps}>
    <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const PhoneIcon = (
  <svg {...svgProps}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const TelegramIcon = (
  <svg {...svgProps}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9 22 2z" />
  </svg>
);

export default function MobileBottomBar({ cartCount = 0, onOpenCatalog }) {
  const { language } = useLanguage();
  const uz = language === 'uz';

  return (
    <nav className="mbb-root" aria-label={uz ? 'Pastki navigatsiya' : 'Нижняя навигация'}>
      {/* 1. Bosh sahifa */}
      <Link href="/" className="mbb-item">
        {HomeIcon}
        <span className="mbb-label">{uz ? 'Bosh sahifa' : 'Главная'}</span>
      </Link>

      {/* 2. Katalog — mavjud MobileCatalog'ni ochadi */}
      <button
        type="button"
        className="mbb-item"
        onClick={onOpenCatalog}
        aria-label={uz ? 'Katalog' : 'Каталог'}
      >
        {CatalogIcon}
        <span className="mbb-label">{uz ? 'Katalog' : 'Каталог'}</span>
      </button>

      {/* 3. Savat — badge = cartCount (Header mantig'idan) */}
      <Link href="/savatcha" className="mbb-item">
        <span className="mbb-cart-wrap">
          {CartIcon}
          {cartCount > 0 && <span className="mbb-badge">{cartCount}</span>}
        </span>
        <span className="mbb-label">{uz ? 'Savat' : 'Корзина'}</span>
      </Link>

      {/* 4. Qo'ng'iroq — tel: havola */}
      <a href={PHONE_HREF} className="mbb-item">
        {PhoneIcon}
        <span className="mbb-label">{uz ? "Qo'ng'iroq" : 'Звонок'}</span>
      </a>

      {/* 5. Telegram — yangi tabда */}
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="mbb-item">
        {TelegramIcon}
        <span className="mbb-label">Telegram</span>
      </a>

      <style jsx global>{`
        /* Pastki panel — faqat mobilда. z-index MobileCatalog(2500) va
           drawer(2000) ostида: katalog ochilганда ustига chiqmaydi. */
        .mbb-root {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1500;
          display: flex;
          background-color: var(--white-surface);
          border-top: 1px solid rgba(255, 194, 122, 0.5);
          box-shadow: 0 -2px 12px rgba(23, 35, 60, 0.06);
          font-family: var(--font-manrope), var(--font-body);
          /* Notchli telefonlar uchun pastki xavfsiz zona */
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .mbb-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 58px;
          background: transparent;
          border: none;
          color: var(--brand-navy);
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 600;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: color 150ms ease, transform 120ms ease;
        }

        /* Bosilganда coral urg'u + yengil "porlash" */
        .mbb-item:active {
          color: var(--brand-coral);
          transform: scale(0.93);
        }

        .mbb-item svg {
          width: 24px;
          height: 24px;
        }

        .mbb-label {
          line-height: 1;
          white-space: nowrap;
        }

        /* Savat ikonкаси ustида badge joylashishi uchun */
        .mbb-cart-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mbb-badge {
          position: absolute;
          top: -6px;
          right: -9px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background-color: var(--brand-coral);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          line-height: 1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Sahifa kontenti panel ostида qolmasин — mobilда body'ga pastki
           padding (panel balandligi + xavfsiz zona). Desktopда tegilmaydi. */
        @media (max-width: 1023px) {
          body {
            padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
          }
        }

        /* Katta ekranда pastki panel umuman yo'q */
        @media (min-width: 1024px) {
          .mbb-root {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
