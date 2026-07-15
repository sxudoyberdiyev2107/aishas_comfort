'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';

export default function ProductCard({ product }) {
  const { language, t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const name = language === 'uz' ? product.name_uz : product.name_ru;
  const isOnSale = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);

  const handleCardClick = (e) => {
    // Prevent navigation if the user clicked the button or button container
    if (e.target.closest('.btn-add-to-cart') || e.target.closest('.product-action')) {
      return;
    }
    router.push(`/mahsulot/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIdx = cart.findIndex((item) => item.id === product.id);

      if (existingItemIdx > -1) {
        cart[existingItemIdx].quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name_uz: product.name_uz,
          name_ru: product.name_ru,
          price: product.price,
          image_url: product.image_url,
          quantity: 1
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
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <Link href={`/mahsulot/${product.id}`} className="product-card-link" onClick={(e) => e.preventDefault()}>
        {/* Product Image and Badges */}
        <div className="product-image-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.image_url || '/placeholder.jpg'} 
            alt={name} 
            className="product-image"
            loading="lazy"
          />
          <div className="product-badges">
            {isOnSale && <span className="badge badge-sale">{t('admin.saleBadge')}</span>}
            {product.is_new && <span className="badge badge-new">{t('admin.newBadge')}</span>}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-title">{name}</h3>
          <div className="product-price-row">
            <span className="product-price">
              {parseFloat(product.price).toLocaleString()} {t('products.priceCurrency')}
            </span>
            {isOnSale && (
              <span className="product-old-price">
                {parseFloat(product.old_price).toLocaleString()} {t('products.priceCurrency')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add To Cart CTA Button */}
      <div className="product-action">
        <button 
          onClick={handleAddToCart} 
          disabled={isAdding}
          className={`btn-add-to-cart ${isAdding ? 'adding' : ''}`}
        >
          {isAdding ? t('products.added') : t('products.addToCart')}
        </button>
      </div>

      <style jsx>{`
        .product-card {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 200ms ease, box-shadow 200ms ease;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }

        .product-card-link {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .product-image-container {
          width: 100%;
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: hidden;
          background-color: var(--card-bg);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.03);
        }

        .product-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .badge {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
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

        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-title {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          line-height: 1.4;
          text-transform: none;
          letter-spacing: 0;
          color: var(--primary-text);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 42px;
        }

        .product-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .product-price {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          color: var(--primary-dark);
        }

        .product-old-price {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--secondary-text);
          text-decoration: line-through;
        }

        .product-action {
          padding: 0 16px 16px 16px;
        }

        .btn-add-to-cart {
          width: 100%;
          height: 38px;
          background-color: transparent;
          color: var(--primary-dark);
          border: 1px solid var(--primary-dark);
          border-radius: 3px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
        }

        .btn-add-to-cart:hover {
          background-color: var(--primary-dark);
          color: var(--white-surface);
        }

        .btn-add-to-cart.adding {
          background-color: #2e7d32;
          color: var(--white-surface);
          border-color: #2e7d32;
        }
      `}</style>
    </div>
  );
}
