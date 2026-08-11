'use client';

// Katalog paneli — desktop (Wildberries uslubidagi ikki ustunli menyu).
//   Chap ustun  — asosiy kategoriyalar (ikonka + nom).
//   O'ng ustun  — sichqoncha ustiga borgan asosiy kategoriyaning pod'lari.
// Ma'lumot GET /api/categories/tree dan keladi (arxivlanganlar server
// tomonidan allaqachon yashiringan). Faqat katta ekranda ko'rinadi —
// kichik ekran uchun keyingi bosqichda alohida mobil katalog qilinadi.

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import CategoryIcon from './CategoryIcon';

const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

// Modul darajasidagi kesh: daraxt bir marta yuklansa, brauzer sessiyasi
// davomida shu yerda saqlanadi. Panel qayta ochilganda (hatto boshqa
// sahifaga o'tib qaytganda ham) tarmoqqa qayta murojaat qilinmaydi.
let treeCache = null;

// Hover debounce: sichqoncha kategoriyalar ustidan tez o'tganda o'ng ustun
// "miltillamasligi" uchun — pod'lar faqat foydalanuvchi bir kategoriyada
// shu muddat to'xtaganda almashadi.
const HOVER_DELAY = 180; // ms

export default function CatalogPanel({ isOpen, onClose }) {
  const { language, t } = useLanguage();
  const [tree, setTree] = useState(treeCache || []);
  const [activeId, setActiveId] = useState(null);
  const hoverTimer = useRef(null);

  // Kategoriya nomini tanlangan tilda qaytaramiz (nom bo'lmasa — slug).
  const catName = (cat) => (language === 'uz' ? cat.name_uz : cat.name_ru) || cat.slug;

  // Daraxtni bir marta yuklab keshga solamiz. Kesh mavjud bo'lsa —
  // tarmoqqa umuman chiqilmaydi. Yuklash muvaffaqiyatsiz bo'lsa (bo'sh
  // ro'yxat) keshlanmaydi, shuning uchun keyingi ochilishda qayta uriniladi.
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

  // Panel har ochilganda o'ng ustun bo'sh turmasin — birinchi asosiy
  // kategoriya default tanlangan bo'lsin.
  useEffect(() => {
    if (isOpen && tree.length > 0) setActiveId(tree[0].id);
  }, [isOpen, tree]);

  // Panel ochiq turganda orqadagi sahifa scroll bo'lmasin (body scroll lock).
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Esc bosilganda ham yopilsin.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Panel yopilganda kutib turgan hover taymerini bekor qilamiz.
  useEffect(() => {
    if (isOpen) return;
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, [isOpen]);

  // Komponent yo'q qilinganda ham taymer qolib ketmasin.
  useEffect(() => () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  if (!isOpen) return null;

  // Sichqoncha kategoriyada qisqa to'xtaganda o'ng ustunni almashtiramiz.
  // Tez o'tib ketilsa oldingi taymer bekor qilinadi — miltillash bo'lmaydi.
  const scheduleActivate = (id) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(id), HOVER_DELAY);
  };

  const activeCat = tree.find(c => c.id === activeId) || null;

  return (
    <>
      {/* Orqa fon — bosilsa panel yopiladi (faqat header ostidagi qismni qoraytiradi) */}
      <div className="catalog-backdrop" onClick={onClose} aria-hidden="true" />

      <div
        className="catalog-panel"
        role="dialog"
        aria-label={language === 'uz' ? 'Katalog' : 'Каталог'}
      >
        {/* Chap ustun — maxsus havolalar + asosiy kategoriyalar */}
        <div className="catalog-left">
          {/* Maxsus havolalar — doim Warm Coral rangda, ro'yxat tepasida */}
          <div className="catalog-featured">
            <Link href="/kategoriya/yangi" className="catalog-featured-item" onClick={onClose}>
              {t('navigation.newArrivals')}
            </Link>
            <Link href="/kategoriya/aksiya" className="catalog-featured-item" onClick={onClose}>
              {t('navigation.promos')}
            </Link>
          </div>

          <ul className="catalog-main-list">
            {tree.map(cat => {
              const hasChildren = cat.children && cat.children.length > 0;
              const active = cat.id === activeId;
              return (
                <li key={cat.id}>
                  <Link
                    href={`/kategoriya/${cat.slug}`}
                    className={`catalog-main-item ${active ? 'active' : ''}`}
                    onMouseEnter={() => scheduleActivate(cat.id)}
                    onFocus={() => scheduleActivate(cat.id)}
                    onClick={onClose}
                  >
                    <span className="catalog-main-left">
                      {cat.icon
                        ? <CategoryIcon name={cat.icon} className="catalog-icon" />
                        : <span className="catalog-icon-placeholder" aria-hidden="true" />}
                      <span className="catalog-main-name">{catName(cat)}</span>
                    </span>
                    {hasChildren && <span className="catalog-arrow" aria-hidden="true">›</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* O'ng ustun — tanlangan kategoriyaning pod'lari (bir ustunda, ostma-ost) */}
        <div className="catalog-sub">
          {activeCat && (() => {
            const activeHasChildren = activeCat.children && activeCat.children.length > 0;
            return (
              <>
                <Link
                  href={`/kategoriya/${activeCat.slug}`}
                  className="catalog-sub-title"
                  onClick={onClose}
                >
                  {catName(activeCat)}
                  {/* Pod'i yo'q kategoriyada — sahifaga o'tish uchun coral strelka */}
                  {!activeHasChildren && <span className="catalog-sub-arrow" aria-hidden="true">›</span>}
                </Link>

                {activeHasChildren && (
                  <ul className="catalog-sub-list">
                    {activeCat.children.map(sub => (
                      <li key={sub.id}>
                        <Link
                          href={`/kategoriya/${sub.slug}`}
                          className="catalog-sub-item"
                          onClick={onClose}
                        >
                          {catName(sub)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <style jsx global>{`
        /* Orqa fon: header (76px) ostidagi maydonni yumshoq qoraytiradi (navy tus) */
        .catalog-backdrop {
          position: fixed;
          top: 76px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(23, 35, 60, 0.34);
          z-index: 900;
          animation: catalogFade 0.2s ease;
        }

        .catalog-panel {
          position: fixed;
          top: 76px;
          left: 0;
          height: calc(100vh - 76px);
          width: 600px;
          max-width: 90vw;
          background-color: var(--brand-cream);
          color: var(--brand-navy);
          font-family: var(--font-manrope), var(--font-body);
          z-index: 950;
          display: flex;
          box-shadow: 4px 0 24px rgba(23, 35, 60, 0.14);
          overflow: hidden;
          animation: catalogSlideIn 0.25s ease;
        }

        @keyframes catalogSlideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes catalogFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Chap ustun — maxsus havolalar + kategoriyalar ro'yxati */
        .catalog-left {
          width: 288px;
          flex-shrink: 0;
          height: 100%;
          overflow-y: auto;
          border-right: 1px solid rgba(23, 35, 60, 0.10);
          display: flex;
          flex-direction: column;
        }

        /* Maxsus havolalar — yumshoq peach "pill" tugmalar, ro'yxatdan
           chiziq bilan ajralgan. Nozik: kontent bo'ylab, ostma-ost. */
        .catalog-featured {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(23, 35, 60, 0.10);
        }

        .catalog-featured-item {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 999px;
          background-color: rgba(255, 194, 122, 0.30);
          color: var(--brand-coral);
          font-size: 14px;
          font-weight: 700;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .catalog-featured-item:hover {
          background-color: rgba(255, 194, 122, 0.55);
          color: var(--brand-coral-strong);
        }

        .catalog-main-list {
          list-style: none;
          padding: 8px 0;
        }

        .catalog-main-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 500;
          color: var(--brand-navy);
          transition: background-color 150ms ease, color 150ms ease;
        }

        /* Hover yoki tanlangan (faol) qatorda yumshoq peach fon + coral matn */
        .catalog-main-item:hover,
        .catalog-main-item.active {
          background-color: rgba(255, 194, 122, 0.28);
          color: var(--brand-coral);
        }

        .catalog-main-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .catalog-main-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Ikonka rangi matndan (currentColor) meros — hoverda coralga o'tadi.
           Qizil/sariq accentlar ikonkaning ichida saqlanadi. */
        .catalog-icon,
        .catalog-icon-placeholder {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
        }

        /* Strelka faqat pod'i bor kategoriyada ko'rinadi — Warm Coral */
        .catalog-arrow {
          font-size: 20px;
          line-height: 1;
          color: rgba(244, 91, 91, 0.55);
          flex-shrink: 0;
          transition: color 150ms ease;
        }

        .catalog-main-item:hover .catalog-arrow,
        .catalog-main-item.active .catalog-arrow {
          color: var(--brand-coral);
        }

        /* O'ng ustun — pod-kategoriyalar (bir ustunda, ostma-ost) */
        .catalog-sub {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          padding: 24px 26px;
        }

        .catalog-sub-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 18px;
          font-weight: 700;
          color: var(--brand-navy);
          margin-bottom: 14px;
          transition: color 150ms ease;
        }

        .catalog-sub-title:hover {
          color: var(--brand-coral);
        }

        /* Pod'i yo'q kategoriyada sahifaga o'tish uchun Warm Coral strelka */
        .catalog-sub-arrow {
          font-size: 22px;
          line-height: 1;
          color: var(--brand-coral);
        }

        .catalog-sub-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .catalog-sub-item {
          display: block;
          padding: 8px 12px;
          margin-left: -12px;
          border-radius: 8px;
          font-size: 15px;
          color: var(--brand-navy);
          transition: background-color 150ms ease, color 150ms ease;
        }

        /* Pod ustiga borilganda ham belgilansin — yumshoq peach fon + coral matn */
        .catalog-sub-item:hover {
          background-color: rgba(255, 194, 122, 0.28);
          color: var(--brand-coral);
        }

        /* Xavfsizlik: kichik ekranda panel ko'rinmasin (mobil katalog alohida) */
        @media (max-width: 1023px) {
          .catalog-backdrop,
          .catalog-panel {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
