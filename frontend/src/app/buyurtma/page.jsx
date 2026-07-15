'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
    }
    setMounted(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMsg(language === 'uz' ? 'Iltimos, barcha maydonlarni to\'ldiring.' : 'Пожалуйста, заполните все поля.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg(t('checkout.emptyCart'));
      return;
    }

    setIsLoading(true);

    try {
      // Connect to Express backend API
      const response = await fetch('https://aishascomfort-production.up.railway.app/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: formData.name,
          phone_number: formData.phone,
          delivery_address: formData.address,
          total_price: calculateTotal(),
          items: cartItems.map(item => ({
            product_id: item.id,
            name_uz: item.name_uz,
            name_ru: item.name_ru,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API order submission failed');
      }

      // Successful order placement
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        language === 'uz'
          ? 'Buyurtma yuborishda xatolik yuz berdi. Iltimos qayta urunib ko\'ring.'
          : 'Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <main className="section success-page">
        <div className="container">
          <div className="success-card">
            <div className="success-icon-wrap">
              <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="success-title">{t('checkout.successMsg')}</h1>
            <p className="success-text">{t('checkout.successSubMsg')}</p>
            <div className="success-action">
              <Link href="/" className="btn-primary">
                {language === 'uz' ? 'Bosh sahifaga qaytish' : 'На главную'}
              </Link>
            </div>
          </div>
        </div>
        <style jsx>{`
          .success-page {
            min-height: 60vh;
            display: flex;
            align-items: center;
          }
          .success-card {
            background-color: var(--white-surface);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 48px 32px;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .success-icon-wrap {
            color: #2e7d32;
          }
          .success-icon {
            width: 64px;
            height: 64px;
          }
          .success-title {
            font-size: 24px;
            color: var(--primary-dark);
            text-transform: none;
            letter-spacing: 0;
            margin: 0;
          }
          .success-text {
            font-size: 15px;
            color: var(--secondary-text);
            line-height: 1.6;
            margin: 0;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="section checkout-page">
      <div className="container">
        <h1 className="checkout-page-title">{t('checkout.title')}</h1>

        <div className="checkout-grid">
          {/* Checkout Form */}
          <div className="checkout-form-col">
            <form onSubmit={handleSubmit} className="checkout-form">
              {errorMsg && <div className="error-banner">{errorMsg}</div>}

              <div className="form-group">
                <label htmlFor="name-input" className="form-label">{t('checkout.nameLabel')} *</label>
                <input
                  type="text"
                  id="name-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'uz' ? 'Ismingizni kiriting' : 'Введите ваше имя'}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone-input" className="form-label">{t('checkout.phoneLabel')} *</label>
                <input
                  type="tel"
                  id="phone-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+998 90 123 45 67"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address-input" className="form-label">{t('checkout.addressLabel')} *</label>
                <textarea
                  id="address-input"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder={language === 'uz' ? 'Shahar, tuman, ko\'cha, uy/kvartira raqami' : 'Город, район, улица, номер дома/квартиры'}
                  className="form-input form-textarea"
                />
              </div>

              <div className="form-action">
                <button
                  type="submit"
                  disabled={isLoading || cartItems.length === 0}
                  className="btn-primary w-full btn-submit-order"
                >
                  {isLoading ? (language === 'uz' ? 'Yuborilmoqda...' : 'Отправка...') : t('checkout.submitBtn')}
                </button>
              </div>
            </form>
          </div>

          {/* Checkout Sidebar Summary */}
          <div className="checkout-summary-col">
            <div className="checkout-summary-card">
              <h2 className="summary-title">{t('checkout.summaryTitle')}</h2>

              {cartItems.length > 0 ? (
                <>
                  <div className="summary-items-list">
                    {cartItems.map((item) => {
                      const name = language === 'uz' ? item.name_uz : item.name_ru;
                      return (
                        <div className="summary-item" key={item.id}>
                          <div className="summary-item-details">
                            <span className="summary-item-name">{name}</span>
                            <span className="summary-item-qty">x {item.quantity}</span>
                          </div>
                          <span className="summary-item-price">
                            {(item.price * item.quantity).toLocaleString()} {t('products.priceCurrency')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="summary-total-row">
                    <span>{t('checkout.total')}</span>
                    <span className="summary-total-amount">
                      {calculateTotal().toLocaleString()} {t('products.priceCurrency')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="summary-empty-text">{t('checkout.emptyCart')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-page {
          background-color: var(--main-bg);
          min-height: 70vh;
        }

        .checkout-page-title {
          font-size: 32px;
          margin-bottom: 32px;
          color: var(--primary-dark);
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 1.8fr 1fr;
            gap: 48px;
          }
        }

        /* Form styling */
        .checkout-form {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .checkout-form {
            padding: 32px;
          }
        }

        .error-banner {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          padding: 12px;
          border-radius: 3px;
          font-size: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-dark);
        }

        .form-input {
          border: 1px solid var(--border-color);
          background-color: var(--white-surface);
          border-radius: 3px;
          height: 44px;
          padding: 0 16px;
          font-size: 14px;
          color: var(--primary-text);
          outline: none;
          transition: border-color 200ms ease;
        }

        .form-input:focus {
          border-color: var(--cta-orange);
        }

        .form-textarea {
          height: 100px;
          padding: 12px 16px;
          resize: vertical;
        }

        .w-full {
          width: 100%;
        }

        .btn-submit-order {
          height: 46px;
        }

        /* Sidebar card summary */
        .checkout-summary-card {
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

        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          gap: 16px;
        }

        .summary-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-item-name {
          color: var(--primary-text);
          font-weight: 500;
        }

        .summary-item-qty {
          color: var(--secondary-text);
          font-size: 12px;
        }

        .summary-item-price {
          color: var(--primary-dark);
          font-weight: 500;
          white-space: nowrap;
        }

        .summary-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-dark);
        }

        .summary-total-amount {
          color: var(--cta-orange);
          font-size: 18px;
        }

        .summary-empty-text {
          font-size: 14px;
          color: var(--secondary-text);
          text-align: center;
        }
      `}</style>
    </main>
  );
}
