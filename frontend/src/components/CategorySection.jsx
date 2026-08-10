'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

// Har bir kategoriya uchun kartochkada ko'rinadigan ikona va rasm.
// Kalit — kategoriya slug'i. Bu yerda yozilmagan yangi kategoriya
// uchun DEFAULT'lar ishlatiladi (pastda).
const CATEGORY_ICON_MAP = {
  'parta-stullar': '/brand icons/Aishas_Comfort_Icon_15_School_Desk.svg',
  'bolalar-o-yingohlari': '/brand icons/Aishas_Comfort_Icon_17_Kids_Swing.svg',
  'kompyuter-ish-stollari': '/brand icons/Aishas_Comfort_Icon_11_Office_Desk.svg',
  'ofis-kreslolari': '/brand icons/Aishas_Comfort_Icon_12_Office_Chair.svg',
  'game-kreslolari': '/brand icons/Aishas_Comfort_Icon_02_Armchair.svg',
  'bar-stullari': '/brand icons/Aishas_Comfort_Icon_16_Student_Chair.svg',
  'boshqa-stul-kreslolar': '/brand icons/Aishas_Comfort_Icon_10_Dining_Chair.svg',
  'yugurish-yo-laklari': '/brand icons/Aishas_Comfort_Icon_26_Home_Decor.svg',
  'velo-trenajyorlar': '/brand icons/Aishas_Comfort_Icon_26_Home_Decor.svg',
  'tebratma-kursilar': '/brand icons/Aishas_Comfort_Icon_01_Sofa.svg',
  'kitob-javonlari': '/brand icons/Aishas_Comfort_Icon_14_Bookshelf.svg',
  'kemping-uchun': '/brand icons/Aishas_Comfort_Icon_03_Coffee_Table.svg',
  'stollar': '/brand icons/Aishas_Comfort_Icon_09_Dining_Table.svg'
};

const CATEGORY_IMAGE_MAP = {
  'parta-stullar': '/prod_bedding.jpg',
  'bolalar-o-yingohlari': '/home_decor.jpg',
  'kompyuter-ish-stollari': '/prod_bedding.jpg',
  'ofis-kreslolari': '/prod_pillows.jpg',
  'game-kreslolari': '/prod_pillows.jpg',
  'bar-stullari': '/prod_pillows.jpg',
  'boshqa-stul-kreslolar': '/prod_pillows.jpg',
  'yugurish-yo-laklari': '/home_decor.jpg',
  'velo-trenajyorlar': '/home_decor.jpg',
  'tebratma-kursilar': '/prod_pillows.jpg',
  'kitob-javonlari': '/prod_blanket.jpg',
  'kemping-uchun': '/prod_towels.jpg',
  'stollar': '/prod_bedding.jpg'
};

// Xaritada bo'lmagan yangi kategoriya uchun zaxira ko'rinish
const DEFAULT_ICON = '/brand/Aishas_Comfort_Symbol_Primary.svg';
const DEFAULT_IMAGE = '/prod_pillows.jpg';

const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

export default function CategorySection() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState([]);

  // Kategoriyalarni bazadan olib kelamiz. credentials: 'include' yo'q —
  // ya'ni server bizni oddiy foydalanuvchi deb ko'radi va arxivlangan
  // kategoriyalarni O'ZI yashirib qaytaradi. Alohida filter shart emas.
  useEffect(() => {
    let cancelled = false;
    fetch(`${backendUrl}/categories`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (!cancelled) setCategories(data); })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="section categories-section" aria-labelledby="categories-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="categories-heading" className="section-title">{t('categories.title')}</h2>
        </div>

        <div className="categories-grid">
          {categories.map(cat => {
            const name = (language === 'uz' ? cat.name_uz : cat.name_ru) || cat.slug;
            const icon = CATEGORY_ICON_MAP[cat.slug] || DEFAULT_ICON;
            const image = CATEGORY_IMAGE_MAP[cat.slug] || DEFAULT_IMAGE;

            return (
              <Link href={`/kategoriya/${cat.slug}`} key={cat.id} className="category-card">
                <div className="category-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={name}
                    className="category-image"
                    loading="lazy"
                  />
                </div>
                <div className="category-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={icon}
                      alt=""
                      style={{ width: '24px', height: '24px', opacity: 0.8 }}
                    />
                    <span className="category-name">{name}</span>
                  </div>
                  <span className="category-arrow">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .categories-section {
          background-color: var(--white-surface);
        }

        .section-header {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 24px;
          color: var(--primary-dark);
          text-align: left;
          letter-spacing: -0.01em;
        }

        @media (min-width: 1024px) {
          .section-title {
            font-size: 30px;
          }
        }

        .categories-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        .category-card {
          display: block;
          background-color: var(--card-bg);
          border-radius: 4px;
          overflow: hidden;
          transition: transform 200ms ease;
        }

        .category-image-wrapper {
          width: 100%;
          aspect-ratio: 4 / 5;
          position: relative;
          overflow: hidden;
          background-color: rgba(0,0,0,0.03);
        }

        .category-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .category-card:hover .category-image {
          transform: scale(1.04);
        }

        .category-info {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--card-bg);
        }

        .category-name {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .category-arrow {
          font-size: 16px;
          color: var(--primary-text);
          transition: transform 200ms ease;
        }

        .category-card:hover .category-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
