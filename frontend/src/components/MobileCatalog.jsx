'use client';

// Mobil to'liq ekran katalog — kichik ekranlar uchun (Wildberries mantiqi).
//   1-daraja — asosiy kategoriyalar ro'yxati (ikonka + nom).
//   2-daraja — tanlangan kategoriyaning pod-kategoriyalari + "Orqaga" tugmasi.
// Ma'lumot GET /api/categories/tree dan keladi (arxivlanganlar server
// tomonidan allaqachon yashiringan). Faqat kichik ekranda ko'rinadi —
// katta ekran uchun alohida CatalogPanel bor (unga tegilmaydi). Hozircha
// hamburger menyudagi "Katalog" tugmasidan ochiladi.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import CategoryIcon from './CategoryIcon';

const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

// Modul darajasidagi kesh — desktop paneldagidek. Daraxt bir marta yuklansa,
// brauzer sessiyasi davomida shu yerda saqlanadi (qayta ochilganda tarmoqqa
// qayta murojaat qilinmaydi). Bo'sh ro'yxat keshlanmaydi — keyin qayta uriniladi.
let treeCache = null;

export default function MobileCatalog({ isOpen, onClose }) {
  const { language, t } = useLanguage();
  const [tree, setTree] = useState(treeCache || []);
  // Ochilgan asosiy kategoriyaning id'si (2-daraja ko'rinishi). null = 1-daraja.
  const [openId, setOpenId] = useState(null);

  // Kategoriya nomini tanlangan tilda qaytaramiz (nom bo'lmasa — slug).
  const catName = (cat) => (language === 'uz' ? cat.name_uz : cat.name_ru) || cat.slug;

  // Yopishda 1-darajaga tozalab qaytamiz (keyingi ochilish toza boshlansin).
  // Holatni effektda emas, aynan yopish hodisasida tozalaymiz.
  const handleClose = () => {
    setOpenId(null);
    onClose();
  };

  // Daraxtni bir marta yuklab keshga solamiz. Kesh mavjud bo'lsa —
  // tarmoqqa umuman chiqilmaydi.
  useEffect(() => {
    if (!isOpen || treeCache) return;
    let cancelled = false;
    fetch(`${backendUrl}/categories/tree`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) treeCache = list;
        if (!cancelled) setTree(list);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isOpen]);

  // Ochiq turganda orqadagi sahifa scroll bo'lmasin (body scroll lock).
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Esc: pod-ko'rinishda bo'lsak 1-darajaga qaytamiz, aks holda katalogni yopamiz.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (openId) setOpenId(null);
      else handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, openId, onClose]);

  if (!isOpen) return null;

  // Ochilgan kategoriyani id bo'yicha topamiz (daraxt yangilansa ham ishonchli).
  const activeCat = openId ? tree.find(c => c.id === openId) || null : null;

  return (
    <div
      className="mcat-root"
      role="dialog"
      aria-label={language === 'uz' ? 'Katalog' : 'Каталог'}
    >
      {/* Sarlavha qatori — 1-darajada faqat "Katalog" + yopish (✕),
          2-darajada "Orqaga" + kategoriya nomi + yopish (✕) */}
      <div className="mcat-header">
        {activeCat ? (
          <button
            type="button"
            className="mcat-back"
            onClick={() => setOpenId(null)}
            aria-label={language === 'uz' ? 'Orqaga' : 'Назад'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="mcat-header-title">{catName(activeCat)}</span>
          </button>
        ) : (
          <span className="mcat-header-title">
            {language === 'uz' ? 'Katalog' : 'Каталог'}
          </span>
        )}

        <button
          type="button"
          className="mcat-close"
          onClick={handleClose}
          aria-label={language === 'uz' ? 'Yopish' : 'Закрыть'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Tana — daraja o'zgarganda yumshoq paydo bo'lsin (key orqali qayta animatsiya) */}
      <div className="mcat-body" key={activeCat ? activeCat.id : 'root'}>
        {activeCat ? (
          // 2-daraja — tanlangan kategoriyaning pod'lari
          <ul className="mcat-list">
            <li>
              <Link
                href={`/kategoriya/${activeCat.slug}`}
                className="mcat-all-link"
                onClick={handleClose}
              >
                {language === 'uz' ? 'Barchasini ko‘rish' : 'Смотреть все'}
                <span className="mcat-arrow" aria-hidden="true">›</span>
              </Link>
            </li>
            {activeCat.children.map(sub => (
              <li key={sub.id}>
                <Link
                  href={`/kategoriya/${sub.slug}`}
                  className="mcat-sub-item"
                  onClick={handleClose}
                >
                  {catName(sub)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          // 1-daraja — maxsus havolalar + asosiy kategoriyalar
          <>
            <div className="mcat-featured">
              <Link href="/kategoriya/yangi" className="mcat-featured-item" onClick={handleClose}>
                {t('navigation.newArrivals')}
              </Link>
              <Link href="/kategoriya/aksiya" className="mcat-featured-item" onClick={handleClose}>
                {t('navigation.promos')}
              </Link>
            </div>

            <ul className="mcat-list">
              {tree.map(cat => {
                const hasChildren = cat.children && cat.children.length > 0;
                const inner = (
                  <span className="mcat-main-left">
                    {cat.icon
                      ? <CategoryIcon name={cat.icon} className="mcat-icon" />
                      : <span className="mcat-icon-placeholder" aria-hidden="true" />}
                    <span className="mcat-main-name">{catName(cat)}</span>
                  </span>
                );

                // Pod'i bor — bosilsa 2-darajaga ochamiz (sahifaga o'tmaydi).
                if (hasChildren) {
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        className="mcat-main-item"
                        onClick={() => setOpenId(cat.id)}
                      >
                        {inner}
                        <span className="mcat-arrow" aria-hidden="true">›</span>
                      </button>
                    </li>
                  );
                }

                // Pod'i yo'q — to'g'ridan-to'g'ri o'sha kategoriya sahifasiga.
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/kategoriya/${cat.slug}`}
                      className="mcat-main-item"
                      onClick={handleClose}
                    >
                      {inner}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <style jsx global>{`
        /* To'liq ekran ildiz — cream fon, navy matn, Manrope shrift.
           z-index header (1000) va mobil drawer (2000) ustidan, lekin
           search overlay (3000) ostidan. */
        .mcat-root {
          position: fixed;
          inset: 0;
          z-index: 2500;
          background-color: var(--brand-cream);
          color: var(--brand-navy);
          font-family: var(--font-manrope), var(--font-body);
          display: flex;
          flex-direction: column;
          animation: mcatFadeIn 0.2s ease;
        }

        @keyframes mcatFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes mcatBodyIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Sarlavha qatori — tepada, ajratuvchi chiziq bilan */
        .mcat-header {
          flex-shrink: 0;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 14px;
          border-bottom: 1px solid rgba(23, 35, 60, 0.10);
        }

        .mcat-header-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--brand-navy);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* "Orqaga" tugmasi — strelka + kategoriya nomi (bosilsa 1-darajaga) */
        .mcat-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          padding: 6px 6px 6px 0;
          background: transparent;
          border: none;
          color: var(--brand-navy);
          cursor: pointer;
        }

        .mcat-back svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          color: var(--brand-coral);
        }

        /* Yopish (✕) tugmasi */
        .mcat-close {
          flex-shrink: 0;
          height: 44px;
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--brand-navy);
          cursor: pointer;
          transition: color 150ms ease;
        }

        .mcat-close:hover {
          color: var(--brand-coral);
        }

        .mcat-close svg {
          width: 24px;
          height: 24px;
        }

        /* Tana — qolgan balandlikni egallaydi va scroll bo'ladi */
        .mcat-body {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 10px 0 24px;
          animation: mcatBodyIn 0.18s ease;
        }

        /* Maxsus havolalar — yumshoq peach "pill" tugmalar (desktop panel bilan
           bir xil uslub), ro'yxatdan chiziq bilan ajralgan */
        .mcat-featured {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 8px 16px 16px;
          border-bottom: 1px solid rgba(23, 35, 60, 0.10);
        }

        .mcat-featured-item {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          border-radius: 999px;
          background-color: rgba(255, 194, 122, 0.30);
          color: var(--brand-coral);
          font-size: 14px;
          font-weight: 700;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .mcat-featured-item:hover {
          background-color: rgba(255, 194, 122, 0.55);
          color: var(--brand-coral-strong);
        }

        .mcat-list {
          list-style: none;
          padding: 6px 0;
          margin: 0;
        }

        /* Asosiy kategoriya qatori — button ham, Link (a) ham shu klass.
           Button uchun default ko'rinishni tozalaymiz. */
        .mcat-main-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          padding: 14px 18px;
          font-size: 16px;
          font-weight: 500;
          color: var(--brand-navy);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .mcat-main-item:hover,
        .mcat-main-item:active {
          background-color: rgba(255, 194, 122, 0.28);
          color: var(--brand-coral);
        }

        .mcat-main-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .mcat-main-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Ikonka rangi matndan (currentColor) meros — hoverda coralga o'tadi.
           Qizil/sariq accentlar ikonka ichida saqlanadi. */
        .mcat-icon,
        .mcat-icon-placeholder {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
        }

        /* Strelka — Warm Coral (pod'i bor kategoriyada va "barchasini ko'rish"da) */
        .mcat-arrow {
          font-size: 22px;
          line-height: 1;
          color: rgba(244, 91, 91, 0.6);
          flex-shrink: 0;
          transition: color 150ms ease;
        }

        .mcat-main-item:hover .mcat-arrow,
        .mcat-main-item:active .mcat-arrow {
          color: var(--brand-coral);
        }

        /* 2-daraja: "Barchasini ko'rish" — coral, chiziq bilan ajralgan */
        .mcat-all-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          color: var(--brand-coral);
          border-bottom: 1px solid rgba(23, 35, 60, 0.08);
          margin-bottom: 4px;
        }

        .mcat-all-link .mcat-arrow {
          color: var(--brand-coral);
        }

        /* 2-daraja: pod-kategoriya qatori */
        .mcat-sub-item {
          display: block;
          padding: 13px 18px;
          font-size: 15px;
          color: var(--brand-navy);
          transition: background-color 150ms ease, color 150ms ease;
        }

        .mcat-sub-item:hover,
        .mcat-sub-item:active {
          background-color: rgba(255, 194, 122, 0.28);
          color: var(--brand-coral);
        }

        /* Xavfsizlik: katta ekranda mobil katalog ko'rinmasin (u yerda CatalogPanel) */
        @media (min-width: 1024px) {
          .mcat-root {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
