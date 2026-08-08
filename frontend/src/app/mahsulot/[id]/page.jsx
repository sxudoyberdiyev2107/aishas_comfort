'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../context/LanguageContext';
import { getImageSrc } from '../../../lib/imageUrl';
import { isSameCartLine } from '../../../lib/cart';

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

  // Tanlangan rang va ko'rsatilayotgan rasm
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  // Mahsulot yuklangach birinchi MAVJUD rangni tanlaymiz.
  // Tugagan ranglar o'tkazib yuboriladi. Hammasi tugagan bo'lsa —
  // hech qaysi rang tanlanmaydi.
  useEffect(() => {
    if (!product) return;
    const colorList = product.colors || [];
    const firstAvailable = colorList.find(c => c.is_available);
    setSelectedColorId(firstAvailable ? firstAvailable.id : null);
    setActiveImageIndex(0);
  }, [product]);

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

  // ===== RANG VARIANTLARI =====
  // Rangi yo'q mahsulot avvalgidek ishlaydi: colors bo'sh bo'ladi va
  // quyidagi bloklar umuman chizilmaydi.
  const colors = product.colors || [];
  const hasColors = colors.length > 0;
  const allColorsOut = hasColors && !colors.some(c => c.is_available);
  const selectedColor = colors.find(c => c.id === selectedColorId) || null;

  // Galereya: tanlangan rangning rasmlari, ular bo'lmasa mahsulotning
  // asosiy rasmi
  const colorImages = selectedColor?.images || [];
  const galleryImages = colorImages.length > 0
    ? colorImages.map(img => img.image_url)
    : (product.image_url ? [product.image_url] : []);

  const safeImageIndex = Math.min(activeImageIndex, Math.max(galleryImages.length - 1, 0));
  const mainImage = galleryImages[safeImageIndex] || product.image_url;

  const handleSelectColor = (color) => {
    // Tugagan rang bosilganda hech narsa bo'lmaydi — u shunchaki
    // "bu rang bor edi, hozir tugagan" degan belgi
    if (!color.is_available) return;
    setSelectedColorId(color.id);
    setActiveImageIndex(0);
  };

  const incrementQty = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    // Rangli mahsulotda rang tanlanmagan bo'lsa (hammasi tugagan)
    // savatga qo'shmaymiz
    if (hasColors && !selectedColor) return;

    setIsAdding(true);

    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      const newLine = {
        id: product.id,
        name_uz: product.name_uz,
        name_ru: product.name_ru,
        price: product.price,
        // Savatchada mijoz aynan tanlagan rangdagi rasmni ko'rsin
        image_url: colorImages[0]?.image_url || product.image_url,
        // Rang NOMI nusxa qilinadi: keyin rang o'chirilsa ham
        // savatchada nima tanlangani ko'rinib turadi
        color_id: selectedColor ? selectedColor.id : null,
        color_name_uz: selectedColor ? selectedColor.name_uz : null,
        color_name_ru: selectedColor ? selectedColor.name_ru : null,
        quantity: quantity
      };

      // Moslik id + rang bo'yicha tekshiriladi, faqat id bo'yicha emas
      const existingItemIdx = cart.findIndex((item) => isSameCartLine(item, newLine));

      if (existingItemIdx > -1) {
        cart[existingItemIdx].quantity += quantity;
      } else {
        cart.push(newLine);
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
              src={getImageSrc(mainImage)}
              alt={name}
              className="detail-image"
            />
            {product.is_new && <span className="detail-badge badge-new">{t('admin.newBadge')}</span>}
            {isOnSale && <span className="detail-badge badge-sale">{t('admin.saleBadge')}</span>}
          </div>

          {/* Kichik rasmlar galereyasi (bittadan ko'p rasm bo'lsa) */}
          {galleryImages.length > 1 && (
            <div className="detail-thumbs">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`detail-thumb ${idx === safeImageIndex ? 'active' : ''}`}
                  aria-label={`${name} — ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageSrc(imgUrl)} alt="" />
                </button>
              ))}
            </div>
          )}

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

          {/* Rang variantlari */}
          {hasColors && (
            <div className="color-select-block">
              <div className="color-select-head">
                <span className="color-select-label">
                  {language === 'uz' ? 'Rang:' : 'Цвет:'}
                </span>
                {selectedColor && (
                  <span className="color-select-value">
                    {language === 'uz' ? selectedColor.name_uz : selectedColor.name_ru}
                  </span>
                )}
              </div>

              <div className="color-swatches">
                {colors.map(color => {
                  const colorName = language === 'uz' ? color.name_uz : color.name_ru;
                  const outText = language === 'uz' ? 'Tugagan' : 'Нет в наличии';
                  const label = color.is_available ? colorName : `${colorName} — ${outText}`;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`color-swatch${selectedColorId === color.id ? ' selected' : ''}${color.is_available ? '' : ' out'}`}
                      style={{ backgroundColor: color.hex_code }}
                      title={label}
                      aria-label={label}
                      aria-disabled={!color.is_available}
                    />
                  );
                })}
              </div>

              {allColorsOut && (
                <p className="colors-out-note">
                  {language === 'uz'
                    ? 'Hozircha barcha ranglar tugagan.'
                    : 'Сейчас все цвета закончились.'}
                </p>
              )}
            </div>
          )}

          <div className="purchase-controls">
            {/* Quantity selector */}
            <div className="quantity-selector">
              <button
                onClick={decrementQty}
                className="qty-btn"
                aria-label="Decrease quantity"
                disabled={allColorsOut}
              >
                -
              </button>
              <span className="qty-number" aria-live="polite">{quantity}</span>
              <button
                onClick={incrementQty}
                className="qty-btn"
                aria-label="Increase quantity"
                disabled={allColorsOut}
              >
                +
              </button>
            </div>

            {/* Add To Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || allColorsOut}
              className={`btn-primary btn-detail-cart ${isAdding ? 'adding' : ''}`}
            >
              {allColorsOut
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

        /* Kichik rasmlar galereyasi */
        .detail-thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .detail-thumb {
          width: 68px;
          height: 68px;
          padding: 0;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          overflow: hidden;
          background: none;
          cursor: pointer;
          transition: border-color 150ms ease;
        }

        .detail-thumb:hover {
          border-color: var(--primary-dark);
        }

        .detail-thumb.active {
          border-color: var(--primary-dark);
          border-width: 2px;
        }

        .detail-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Rang tanlash */
        .color-select-block {
          margin-bottom: 8px;
        }

        .color-select-head {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 10px;
        }

        .color-select-label {
          font-size: 14px;
          color: var(--secondary-text);
        }

        .color-select-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text);
        }

        .color-swatches {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .color-swatch {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          padding: 0;
          cursor: pointer;
          position: relative;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }

        .color-swatch:hover {
          transform: scale(1.08);
        }

        .color-swatch.selected {
          box-shadow: 0 0 0 2px var(--white-surface), 0 0 0 4px var(--primary-dark);
        }

        /* Tugagan rang: kulrang, xira, ustidan qiya chiziq, tanlanmaydi */
        .color-swatch.out {
          filter: grayscale(100%);
          opacity: 0.45;
          cursor: not-allowed;
        }

        .color-swatch.out:hover {
          transform: none;
        }

        .color-swatch.out::after {
          content: '';
          position: absolute;
          left: -3px;
          right: -3px;
          top: 50%;
          height: 2px;
          background-color: var(--primary-text);
          transform: rotate(-45deg);
        }

        .colors-out-note {
          font-size: 13px;
          color: #c62828;
          margin: 12px 0 0;
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
