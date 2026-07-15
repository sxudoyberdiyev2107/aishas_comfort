'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function CartPage() {
  const { t, language } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
    }
    setMounted(true);
  }, []);

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  if (!mounted) return null;

  return (
    <main className="section cart-page">
      <div className="container">
        <h1 className="cart-page-title">{t('cart.title')}</h1>

        {cartItems.length > 0 ? (
          <div className="cart-grid">
            {/* Cart Table Column */}
            <div className="cart-items-col">
              <div className="cart-header-row">
                <span className="col-prod">{language === 'uz' ? 'Mahsulot' : 'Товар'}</span>
                <span className="col-price">{language === 'uz' ? 'Narxi' : 'Цена'}</span>
                <span className="col-qty">{language === 'uz' ? 'Soni' : 'Кол-во'}</span>
                <span className="col-total">{language === 'uz' ? 'Jami' : 'Итого'}</span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const name = language === 'uz' ? item.name_uz : item.name_ru;
                  return (
                    <div className="cart-item" key={item.id}>
                      {/* Product details info */}
                      <div className="item-details">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.image_url} 
                          alt={name} 
                          className="item-image"
                        />
                        <div className="item-name-wrap">
                          <Link href={`/mahsulot/${item.id}`} className="item-name">
                            {name}
                          </Link>
                          <button 
                            onClick={() => removeItem(item.id)} 
                            className="btn-remove-item"
                          >
                            {language === 'uz' ? 'O\'chirish' : 'Удалить'}
                          </button>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="item-price">
                        {parseFloat(item.price).toLocaleString()} {t('products.priceCurrency')}
                      </div>

                      {/* Qty Selector */}
                      <div className="item-qty">
                        <div className="qty-selector">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="qty-btn"
                          >
                            -
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="qty-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal Item Price */}
                      <div className="item-total">
                        {(item.price * item.quantity).toLocaleString()} {t('products.priceCurrency')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary Card Column */}
            <div className="cart-summary-col">
              <div className="summary-card">
                <h2 className="summary-title">{language === 'uz' ? 'Buyurtma Tafsiloti' : 'Итого по заказу'}</h2>
                <div className="summary-row">
                  <span className="summary-label">{language === 'uz' ? 'Mahsulotlar' : 'Товары'}</span>
                  <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} {language === 'uz' ? 'dona' : 'шт.'}</span>
                </div>
                <div className="summary-row divider">
                  <span className="summary-label font-bold">{t('cart.total')}</span>
                  <span className="summary-total-price">
                    {calculateSubtotal().toLocaleString()} {t('products.priceCurrency')}
                  </span>
                </div>
                <div className="summary-action">
                  <Link href="/buyurtma" className="btn-primary w-full btn-checkout">
                    {t('cart.checkout')}
                  </Link>
                </div>
                <div className="summary-continue-shopping">
                  <Link href="/kategoriya/all" className="continue-link">
                    &larr; {t('cart.continue')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-cart-message">
            <p className="empty-text">{t('cart.empty')}</p>
            <Link href="/kategoriya/all" className="btn-primary">
              {language === 'uz' ? 'Do\'konga borish' : 'В магазин'}
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-page {
          background-color: var(--main-bg);
          min-height: 70vh;
        }

        .cart-page-title {
          font-size: 32px;
          margin-bottom: 32px;
          color: var(--primary-dark);
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .cart-grid {
            grid-template-columns: 2.2fr 1fr;
            gap: 48px;
          }
        }

        /* Cart Table Row Headers */
        .cart-header-row {
          display: none;
          grid-template-columns: 3fr 1fr 1fr 1.2fr;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 600;
          color: var(--secondary-text);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        @media (min-width: 768px) {
          .cart-header-row {
            display: grid;
          }
        }

        /* Cart Items list */
        .cart-items-list {
          display: flex;
          flex-direction: column;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 24px 0;
          border-bottom: 1px solid var(--border-color);
          align-items: center;
        }

        @media (min-width: 768px) {
          .cart-item {
            grid-template-columns: 3fr 1fr 1fr 1.2fr;
            padding: 24px 16px;
          }
        }

        .item-details {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 2px;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
        }

        .item-name-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-name {
          font-size: 15px;
          font-weight: 500;
          color: var(--primary-text);
        }

        .item-name:hover {
          color: var(--cta-orange);
        }

        .btn-remove-item {
          font-size: 12px;
          color: var(--secondary-text);
          text-align: left;
          text-decoration: underline;
          width: fit-content;
        }

        .btn-remove-item:hover {
          color: var(--cta-orange);
        }

        .item-price, .item-total {
          font-size: 15px;
          font-weight: 500;
        }

        @media (max-width: 767px) {
          .item-price::before {
            content: "${language === 'uz' ? 'Narxi: ' : 'Цена: '}";
            color: var(--secondary-text);
            font-size: 13px;
          }
          .item-total::before {
            content: "${language === 'uz' ? 'Jami: ' : 'Итого: '}";
            color: var(--secondary-text);
            font-size: 13px;
            font-weight: normal;
          }
          .item-qty::before {
            content: "${language === 'uz' ? 'Soni: ' : 'Кол-во: '}";
            color: var(--secondary-text);
            font-size: 13px;
            margin-right: 12px;
          }
          .item-qty {
            display: flex;
            align-items: center;
          }
        }

        /* Qty Selection Box */
        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          width: fit-content;
          background-color: var(--white-surface);
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-dark);
        }

        .qty-btn:hover {
          background-color: var(--card-bg);
        }

        .qty-number {
          font-size: 13px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        /* Summary Column */
        .summary-card {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 24px;
        }

        .summary-title {
          font-size: 18px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--secondary-text);
        }

        .summary-row.divider {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: 16px;
          margin-bottom: 24px;
          color: var(--primary-text);
        }

        .font-bold {
          font-weight: 600;
        }

        .summary-total-price {
          font-size: 18px;
          font-weight: 600;
          color: var(--cta-orange);
        }

        .w-full {
          width: 100%;
        }

        .btn-checkout {
          height: 46px;
        }

        .summary-continue-shopping {
          text-align: center;
          margin-top: 16px;
        }

        .continue-link {
          font-size: 13px;
          color: var(--secondary-text);
        }

        .continue-link:hover {
          color: var(--cta-orange);
        }

        /* Empty Cart Message */
        .empty-cart-message {
          text-align: center;
          padding: 80px 0;
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .empty-text {
          font-size: 16px;
          color: var(--secondary-text);
        }
      `}</style>
    </main>
  );
}
