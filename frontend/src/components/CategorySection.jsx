'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function CategorySection() {
  const { t } = useLanguage();

  const categories = [
    {
      name: t('categories.parta-stullar'),
      slug: 'parta-stullar',
      image: '/prod_bedding.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_15_School_Desk.svg'
    },
    {
      name: t('categories.bolalar-o-yingohlari'),
      slug: 'bolalar-o-yingohlari',
      image: '/home_decor.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_17_Kids_Swing.svg'
    },
    {
      name: t('categories.kompyuter-ish-stollari'),
      slug: 'kompyuter-ish-stollari',
      image: '/prod_bedding.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_11_Office_Desk.svg'
    },
    {
      name: t('categories.ofis-kreslolari'),
      slug: 'ofis-kreslolari',
      image: '/prod_pillows.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_12_Office_Chair.svg'
    },
    {
      name: t('categories.game-kreslolari'),
      slug: 'game-kreslolari',
      image: '/prod_pillows.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_02_Armchair.svg'
    },
    {
      name: t('categories.bar-stullari'),
      slug: 'bar-stullari',
      image: '/prod_pillows.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_16_Student_Chair.svg'
    },
    {
      name: t('categories.boshqa-stul-kreslolar'),
      slug: 'boshqa-stul-kreslolar',
      image: '/prod_pillows.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_10_Dining_Chair.svg'
    },
    {
      name: t('categories.yugurish-yo-laklari'),
      slug: 'yugurish-yo-laklari',
      image: '/home_decor.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_26_Home_Decor.svg'
    },
    {
      name: t('categories.velo-trenajyorlar'),
      slug: 'velo-trenajyorlar',
      image: '/home_decor.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_26_Home_Decor.svg'
    },
    {
      name: t('categories.tebratma-kursilar'),
      slug: 'tebratma-kursilar',
      image: '/prod_pillows.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_01_Sofa.svg'
    },
    {
      name: t('categories.kitob-javonlari'),
      slug: 'kitob-javonlari',
      image: '/prod_blanket.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_14_Bookshelf.svg'
    },
    {
      name: t('categories.kemping-uchun'),
      slug: 'kemping-uchun',
      image: '/prod_towels.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_03_Coffee_Table.svg'
    },
    {
      name: t('categories.stollar'),
      slug: 'stollar',
      image: '/prod_bedding.jpg',
      icon: '/brand icons/Aishas_Comfort_Icon_09_Dining_Table.svg'
    }
  ];

  return (
    <section className="section categories-section" aria-labelledby="categories-heading">
      <div className="container">
        <div className="section-header">
          <h2 id="categories-heading" className="section-title">{t('categories.title')}</h2>
        </div>
        
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <Link href={`/kategoriya/${cat.slug}`} key={idx} className="category-card">
              <div className="category-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="category-image"
                  loading="lazy"
                />
              </div>
              <div className="category-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={cat.icon} 
                    alt="" 
                    style={{ width: '24px', height: '24px', opacity: 0.8 }} 
                  />
                  <span className="category-name">{cat.name}</span>
                </div>
                <span className="category-arrow">→</span>
              </div>
            </Link>
          ))}
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
