'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import ProductCard from '../../../components/ProductCard';

export default function CategoryPage({ params }) {
  const unwrappedParams = React.use ? React.use(params) : params;
  const slug = unwrappedParams?.slug;
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [title, setTitle] = useState('');
  const [iconUrl, setIconUrl] = useState(null);

  // Localized mock products
  const mockProducts = [
    {
      id: 1,
      category: 'parta-stullar',
      name_uz: "Ergonomik o'quv partasi va stul to'plami",
      name_ru: "Эргономичный комплект учебной парты и стула",
      price: 1450000,
      old_price: 1720000,
      image_url: "/prod_bedding.jpg",
      is_new: true,
      is_bestseller: true
    },
    {
      id: 2,
      category: 'parta-stullar',
      name_uz: "Bolalar uchun yig'iladigan kichik parta",
      name_ru: "Детская складная мини-парта",
      price: 320000,
      image_url: "/prod_pillows.jpg",
      is_new: true,
      is_bestseller: false
    },
    {
      id: 3,
      category: 'game-kreslolari',
      name_uz: "Premium O'yin Kreslosi (Gaming Chair)",
      name_ru: "Премиум игровое кресло (Gaming Chair)",
      price: 1850000,
      old_price: 2200000,
      image_url: "/prod_blanket.jpg",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      is_new: false,
      is_bestseller: true
    },
    {
      id: 4,
      category: 'kitob-javonlari',
      name_uz: "Minimalist Eman Kitob Javoni (Bookshelf)",
      name_ru: "Минималистичный дубовый книжный шкаф",
      price: 980000,
      image_url: "/prod_towels.jpg",
      is_new: false,
      is_bestseller: false
    }
  ];

  const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

  useEffect(() => {
    const fetchAndFilterProducts = async () => {
      let rawProducts = [];
      try {
        const res = await fetch(`${backendUrl}/products`);
        if (res.ok) {
          rawProducts = await res.json();
        } else {
          rawProducts = [...mockProducts];
        }
      } catch (err) {
        rawProducts = [...mockProducts];
      }

      // Filter by slug
      let filtered = [...rawProducts];
      if (slug === 'yangi') {
        filtered = rawProducts.filter(p => p.is_new);
        setTitle(t('navigation.newArrivals'));
        setIconUrl(null);
      } else if (slug === 'aksiya') {
        filtered = rawProducts.filter(p => p.old_price && parseFloat(p.old_price) > parseFloat(p.price));
        setTitle(t('navigation.promos'));
        setIconUrl(null);
      } else if (slug !== 'all') {
        filtered = rawProducts.filter(p => p.category === slug);

        const iconMap = {
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

        setTitle(t('categories.' + slug) || slug.toUpperCase());
        setIconUrl(iconMap[slug] || null);
      } else {
        setTitle(t('navigation.shop'));
        setIconUrl(null);
      }

      // Sort products
      if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      }

      setProducts(filtered);
    };

    fetchAndFilterProducts();
  }, [slug, sortBy, language]);

  return (
    <main className="section category-page">
      <div className="container">
        {/* Page Header */}
        <div className="category-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            {iconUrl && (
              <img
                src={iconUrl}
                alt=""
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
            )}
            <h1 className="category-title" style={{ margin: 0 }}>{title}</h1>
          </div>
          <div className="category-filters-row">
            <span className="product-count">
              {products.length} {language === 'uz' ? 'ta mahsulot' : 'товаров'}
            </span>
            <div className="sort-selector-wrapper">
              <label htmlFor="sort-select" className="sr-only">Sort</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">
                  {language === 'uz' ? 'Saralash: Standart' : 'Сортировка: По умолчанию'}
                </option>
                <option value="price-asc">
                  {language === 'uz' ? 'Narx: Arzonroq' : 'Цена: По возрастанию'}
                </option>
                <option value="price-desc">
                  {language === 'uz' ? 'Narx: Qimmatroq' : 'Цена: По убыванию'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-category-message">
            <p>{language === 'uz' ? 'Hozircha mahsulotlar mavjud emas.' : 'Товары пока отсутствуют.'}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .category-page {
          background-color: var(--main-bg);
          min-height: 60vh;
        }

        .category-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 40px;
        }

        .category-title {
          font-size: 32px;
          color: var(--primary-dark);
          margin-bottom: 16px;
        }

        @media (min-width: 1024px) {
          .category-title {
            font-size: 42px;
          }
        }

        .category-filters-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .product-count {
          font-size: 14px;
          color: var(--secondary-text);
        }

        .sort-select {
          border: 1px solid var(--border-color);
          background-color: var(--white-surface);
          border-radius: 3px;
          padding: 8px 16px;
          font-size: 13px;
          font-family: var(--font-body);
          color: var(--primary-text);
          outline: none;
          cursor: pointer;
        }

        .products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        .empty-category-message {
          text-align: center;
          padding: 64px 0;
          color: var(--secondary-text);
          font-size: 15px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
      `}</style>
    </main>
  );
}
