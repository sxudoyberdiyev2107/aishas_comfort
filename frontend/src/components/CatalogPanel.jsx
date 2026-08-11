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
  const { language } = useLanguage();
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
        {/* Chap ustun — asosiy kategoriyalar */}
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

        {/* O'ng ustun — tanlangan kategoriyaning pod'lari */}
        <div className="catalog-sub">
          {activeCat && (
            <>
              <Link
                href={`/kategoriya/${activeCat.slug}`}
                className="catalog-sub-title"
                onClick={onClose}
              >
                {catName(activeCat)}
              </Link>

              {activeCat.children && activeCat.children.length > 0 ? (
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
              ) : (
                <Link
                  href={`/kategoriya/${activeCat.slug}`}
                  className="catalog-sub-viewall"
                  onClick={onClose}
                >
                  {language === 'uz' ? "Barchasini ko'rish" : 'Смотреть все'}
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Orqa fon: header (76px) ostidagi maydonni yumshoq qoraytiradi */
        .catalog-backdrop {
          position: fixed;
          top: 76px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(16, 24, 32, 0.32);
          z-index: 900;
          animation: catalogFade 0.2s ease;
        }

        .catalog-panel {
          position: fixed;
          top: 76px;
          left: 0;
          height: calc(100vh - 76px);
          width: 760px;
          max-width: 92vw;
          background-color: var(--white-surface);
          z-index: 950;
          display: flex;
          box-shadow: 4px 0 24px rgba(16, 24, 32, 0.12);
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

        /* Chap ustun — asosiy kategoriyalar */
        .catalog-main-list {
          list-style: none;
          width: 300px;
          flex-shrink: 0;
          height: 100%;
          overflow-y: auto;
          border-right: 1px solid var(--border-color);
          padding: 12px 0;
        }

        .catalog-main-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 500;
          color: var(--primary-text);
          transition: background-color 150ms ease, color 150ms ease;
        }

        /* Hover yoki tanlangan (faol) qatorda och kulrang fon + apelsin matn */
        .catalog-main-item:hover,
        .catalog-main-item.active {
          background-color: var(--card-bg);
          color: var(--cta-orange);
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

        /* Ikonka rangi matndan (currentColor) meros — hoverda apelsinga o'tadi.
           Qizil/sariq accentlar ikonkaning ichida saqlanadi. */
        .catalog-icon,
        .catalog-icon-placeholder {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
        }

        /* Strelka faqat pod'i bor kategoriyada ko'rinadi */
        .catalog-arrow {
          font-size: 20px;
          line-height: 1;
          color: var(--secondary-text);
          flex-shrink: 0;
          transition: color 150ms ease;
        }

        .catalog-main-item:hover .catalog-arrow,
        .catalog-main-item.active .catalog-arrow {
          color: var(--cta-orange);
        }

        /* O'ng ustun — pod-kategoriyalar */
        .catalog-sub {
          flex: 1;
          height: 100%;
          overflow-y: auto;
          padding: 24px 28px;
        }

        .catalog-sub-title {
          display: inline-block;
          font-size: 18px;
          font-weight: 700;
          color: var(--primary-dark);
          margin-bottom: 16px;
          transition: color 150ms ease;
        }

        .catalog-sub-title:hover {
          color: var(--cta-orange);
        }

        .catalog-sub-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 2px 24px;
        }

        .catalog-sub-item {
          display: block;
          padding: 7px 10px;
          margin-left: -10px;
          border-radius: 6px;
          font-size: 14px;
          color: var(--primary-text);
          transition: background-color 150ms ease, color 150ms ease;
        }

        /* Pod ustiga borilganda ham belgilansin — och kulrang fon + apelsin matn */
        .catalog-sub-item:hover {
          background-color: var(--card-bg);
          color: var(--cta-orange);
        }

        .catalog-sub-viewall {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          color: var(--cta-orange);
        }

        .catalog-sub-viewall:hover {
          color: var(--cta-hover);
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
