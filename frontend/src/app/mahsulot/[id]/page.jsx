'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId = null;
  if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts.length > 1) videoId = parts[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts.length > 1) videoId = parts[1].split('?')[0];
  } else if (url.includes('embed/')) {
    const parts = url.split('embed/');
    if (parts.length > 1) videoId = parts[1].split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export default function ProductDetailPage({ params }) {
  const unwrappedParams = React.use ? React.use(params) : params;
  const id = unwrappedParams?.id;
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Localized mock products
  const mockProducts = [
    {
      id: 1,
      name_uz: "Ergonomik o'quv partasi va stul to'plami",
      name_ru: "Эргономичный комплект учебной парты и стула",
      desc_uz: "Balandligi sozlanadigan, bolalar va o'smirlar uchun mo'ljallangan qulay o'quv partasi va ergonomik stul to'plami.",
      desc_ru: "Регулируемый по высоте эргономичный комплект учебной парты и стула для детей и подростков.",
      price: 1450000,
      old_price: 1720000,
      image_url: "/prod_bedding.jpg",
      stock: 12,
      is_new: true
    },
    {
      id: 2,
      name_uz: "Bolalar uchun yig'iladigan kichik parta",
      name_ru: "Детская складная мини-парта",
      desc_uz: "Kichik joylar uchun qulay, oson yig'iluvchi ekologik toza yog'ochdan yasalgan bolalar partasi.",
      desc_ru: "Удобная, легко складывающаяся детская парта из экологически чистого дерева для небольших помещений.",
      price: 320000,
      image_url: "/prod_pillows.jpg",
      stock: 35,
      is_new: true
    },
    {
      id: 3,
      name_uz: "Premium O'yin Kreslosi (Gaming Chair)",
      name_ru: "Премиум игровое кресло (Gaming Chair)",
      desc_uz: "Ergonomik dizayn, 4D tirsaklagichlar va qulay bel yostiqchalariga ega professional o'yin va ish kreslosi.",
      desc_ru: "Профессиональное игровое и рабочее кресло с эргономичным дизайном, 4D подлокотниками и удобной поясничной подушкой.",
      price: 1850000,
      old_price: 2200000,
      image_url: "/prod_blanket.jpg",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      stock: 5,
      is_new: false
    },
    {
      id: 4,
      name_uz: "Minimalist Eman Kitob Javoni (Bookshelf)",
      name_ru: "Минималистичный дубовый книжный шкаф",
      desc_uz: "Zamonaviy Skandinaviya uslubidagi, ochiq javonli sifatli emandan yasalgan ixcham kitob javoni.",
      desc_ru: "Компактный книжный шкаф из качественного дуба в современном скандинавском стиле с открытыми полками.",
      price: 980000,
      image_url: "/prod_towels.jpg",
      stock: 22,
      is_new: false
    }
  ];

  const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${backendUrl}/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          // Fallback to mock
          const prod = mockProducts.find((p) => p.id === parseInt(id));
          if (prod) setProduct(prod);
        }
      } catch (err) {
        // Fallback to mock
        const prod = mockProducts.find((p) => p.id === parseInt(id));
        if (prod) setProduct(prod);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (!product) {
    return (
      <div className="container product-not-found">
        <p>{language === 'uz' ? 'Mahsulot topilmadi.' : 'Товар не найден.'}</p>
      </div>
    );
  }

  const name = language === 'uz' ? product.name_uz : product.name_ru;
  const desc = language === 'uz' ? product.desc_uz : product.desc_ru;
  const isOnSale = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
  const embedUrl = getYouTubeEmbedUrl(product.video_url);

  const incrementQty = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIdx = cart.findIndex((item) => item.id === product.id);

      if (existingItemIdx > -1) {
        cart[existingItemIdx].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name_uz: product.name_uz,
          name_ru: product.name_ru,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));

      // Dispatch custom event to notify Header
      window.dispatchEvent(new Event('cartUpdated'));

      setTimeout(() => {
        setIsAdding(false);
      }, 800);
    }
  };

  return (
    <main className="section product-detail-page">
      <div className="container detail-grid">
        {/* Left Column: Image */}
        <div className="detail-image-col">
          <div className="detail-image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={name}
              className="detail-image"
            />
            {product.is_new && <span className="detail-badge badge-new">{t('admin.newBadge')}</span>}
            {isOnSale && <span className="detail-badge badge-sale">{t('admin.saleBadge')}</span>}
          </div>

          {/* YouTube Video Embed */}
          {embedUrl && (
            <div className="detail-video-wrapper" style={{ marginTop: '32px' }}>
              <h3 style={{
                fontSize: '14px',
                fontFamily: 'var(--font-oswald)',
                textTransform: 'uppercase',
                marginBottom: '16px',
                letterSpacing: '1px',
                color: 'var(--primary-dark)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '8px'
              }}>
                {language === 'uz' ? 'Mahsulot videosi' : 'Видео о товаре'}
              </h3>
              <div className="iframe-container" style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  src={embedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Text and Actions */}
        <div className="detail-info-col">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">{t('navigation.home')}</Link>
            <span className="separator">/</span>
            <Link href="/kategoriya/all">{t('navigation.shop')}</Link>
            <span className="separator">/</span>
            <span className="current">{name}</span>
          </nav>

          <h1 className="detail-title">{name}</h1>

          <div className="detail-price-row">
            <span className="detail-price">
              {parseFloat(product.price).toLocaleString()} {t('products.priceCurrency')}
            </span>
            {isOnSale && (
              <span className="detail-old-price">
                {parseFloat(product.old_price).toLocaleString()} {t('products.priceCurrency')}
              </span>
            )}
          </div>

          <p className="detail-desc">{desc}</p>

          <div className="detail-stock-status">
            <span>
              {language === 'uz' ? 'Holati:' : 'Статус:'}{' '}
              <strong className={product.in_stock ? 'in-stock' : 'out-of-stock'}>
                {product.in_stock
                  ? (language === 'uz' ? 'Mavjud' : 'В наличии')
                  : (language === 'uz' ? 'Tugagan' : 'Нет в наличии')}
              </strong>
            </span>
          </div>

          <div className="purchase-controls">
            {/* Quantity selector */}
            <div className="quantity-selector">
              <button
                onClick={decrementQty}
                className="qty-btn"
                aria-label="Decrease quantity"
                disabled={!product.in_stock}
              >
                -
              </button>
              <span className="qty-number" aria-live="polite">{quantity}</span>
              <button
                onClick={incrementQty}
                className="qty-btn"
                aria-label="Increase quantity"
                disabled={!product.in_stock}
              >
                +
              </button>
            </div>

            {/* Add To Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !product.in_stock}
              className={`btn-primary btn-detail-cart ${isAdding ? 'adding' : ''}`}
            >
              {!product.in_stock
                ? (language === 'uz' ? 'Tugagan' : 'Нет в наличии')
                : (isAdding ? t('products.added') : t('products.addToCart'))}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail-page {
          background-color: var(--white-surface);
          min-height: 70vh;
        }

        .product-not-found {
          text-align: center;
          padding: 100px 0;
          color: var(--secondary-text);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr 1fr;
            gap: 48px;
          }
        }

        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1.1fr 1fr;
            gap: 64px;
          }
        }

        /* Image Column */
        .detail-image-col {
          position: relative;
        }

        .detail-image-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: hidden;
          background-color: var(--card-bg);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .detail-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-sale {
          background-color: var(--cta-orange);
          color: var(--white-surface);
        }

        .badge-new {
          background-color: var(--primary-dark);
          color: var(--white-surface);
        }

        /* Info Column */
        .detail-info-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .breadcrumb {
          font-size: 13px;
          color: var(--secondary-text);
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .breadcrumb a:hover {
          color: var(--cta-orange);
        }

        .separator {
          opacity: 0.5;
        }

        .current {
          color: var(--primary-text);
          font-weight: 500;
        }

        .detail-title {
          font-size: 32px;
          color: var(--primary-dark);
          text-transform: none;
          letter-spacing: -0.01em;
          line-height: 1.2;
          margin: 0;
        }

        @media (min-width: 1024px) {
          .detail-title {
            font-size: 40px;
          }
        }

        .detail-price-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .detail-price {
          font-size: 24px;
          font-weight: 600;
          color: var(--cta-orange);
        }

        .detail-old-price {
          font-size: 18px;
          color: var(--secondary-text);
          text-decoration: line-through;
        }

        .detail-desc {
          font-size: 15px;
          color: var(--secondary-text);
          line-height: 1.6;
        }

        .detail-stock-status {
          font-size: 14px;
          color: var(--primary-text);
        }

        .in-stock {
          color: #2e7d32;
        }

        .out-of-stock {
          color: #c62828;
        }

        /* Purchase Controls */
        .purchase-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          height: 46px;
        }

        .qty-btn {
          width: 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--primary-dark);
        }

        .qty-btn:hover {
          background-color: var(--card-bg);
        }

        .qty-number {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }

        .btn-detail-cart {
          flex-grow: 1;
          height: 46px;
        }

        .btn-detail-cart.adding {
          background-color: #2e7d32;
          border-color: #2e7d32;
        }
      `}</style>
    </main>
  );
}
