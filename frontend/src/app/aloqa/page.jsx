'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  // Set document title and metadata dynamically
  useEffect(() => {
    document.title = language === 'uz'
      ? "Aloqa | Aisha's Comfort mebel do'koni"
      : "Контакты | Магазин мебели Aisha's Comfort";
  }, [language]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <main className="section contact-page">
      <div className="container">
        <h1 className="contact-title">
          {language === 'uz' ? 'Aloqa' : 'Контакты'}
        </h1>

        <div className="contact-grid">
          {/* Contact Details Column */}
          <div className="contact-details-col">
            <h2 className="contact-subtitle">
              {language === 'uz' ? 'Biz bilan bog\'laning' : 'Свяжитесь с нами'}
            </h2>
            <p className="contact-lead">
              {language === 'uz'
                ? 'Savollaringiz bormi, hamkorlik qilmoqchimisiz yoki buyurtma rasmiylashtirishda yordam kerakmi? Biz sizga yordam berishdan doim xursandmiz. Quyidagi raqamlar yoki tarmoqlar orqali bizga murojaat qiling.'
                : 'У вас есть вопросы, хотите обсудить сотрудничество или нужна помощь с оформлением заказа? Мы всегда рады помочь. Свяжитесь с нами по указанным контактам.'}
            </p>

            <div className="contact-info-list">
              {/* Address */}
              <div className="info-card">
                <span className="info-icon">📍</span>
                <div className="info-body">
                  <h5>{language === 'uz' ? 'Bizning manzil:' : 'Наш адрес:'}</h5>
                  <p>
                    {language === 'uz' 
                      ? 'Toshkent shahar, Chilonzor tumani, 9-kvartal' 
                      : 'г. Ташкент, Чиланзарский район, 9-й квартал'}
                  </p>
                  <a 
                    href="https://yandex.com/maps" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="map-link"
                  >
                    {language === 'uz' ? 'Yandex xaritada ochish →' : 'Открыть в Яндекс Картах →'}
                  </a>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="info-card">
                <span className="info-icon">📞</span>
                <div className="info-body">
                  <h5>{language === 'uz' ? 'Telefon raqamlarimiz:' : 'Наши телефоны:'}</h5>
                  <p className="phone-numbers">
                    <a href="tel:+998770043324">+998 77 004 33 24</a>
                    <a href="tel:+998920433356">+998 92 043 33 56</a>
                  </p>
                </div>
              </div>

              {/* Telegram Link */}
              <div className="info-card">
                <span className="info-icon">📱</span>
                <div className="info-body">
                  <h5>{language === 'uz' ? 'Telegram orqali bog\'lanish:' : 'Связь через Telegram:'}</h5>
                  <p>
                    <a 
                      href="https://t.me/aishas_comfort_uz" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="telegram-link"
                    >
                      @aishas_comfort_uz
                    </a>
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="info-card">
                <span className="info-icon">🕒</span>
                <div className="info-body">
                  <h5>{language === 'uz' ? 'Ish vaqtimiz:' : 'Режим работы:'}</h5>
                  <p>
                    {language === 'uz'
                      ? 'Dushanba – Shanba: 09:00 – 19:00'
                      : 'Понедельник – Суббота: 09:00 – 19:00'}
                    <br />
                    <strong>
                      {language === 'uz' ? 'Yakshanba: Dam olish kuni' : 'Воскресенье: Выходной'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Email & Website */}
              <div className="info-card">
                <span className="info-icon">✉️</span>
                <div className="info-body">
                  <h5>{language === 'uz' ? 'Aloqa kanallari:' : 'Каналы связи:'}</h5>
                  <p>
                    <strong>Email:</strong> <a href="mailto:Aishas_comfort@mail.ru">Aishas_comfort@mail.ru</a>
                    <br />
                    <strong>Web-site:</strong> <a href="https://www.Aishas-comfort.uz" target="_blank" rel="noreferrer">www.Aishas-comfort.uz</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="contact-form-col">
            <h2 className="contact-subtitle">
              {language === 'uz' ? 'Xabar yuborish' : 'Написать нам'}
            </h2>
            {submitted ? (
              <div className="success-alert">
                {language === 'uz'
                  ? 'Sizning xabaringiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog\'lanamiz!'
                  : 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время!'}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="form-name" className="form-label">
                    {language === 'uz' ? 'Ismingiz *' : 'Ваше имя *'}
                  </label>
                  <input
                    type="text"
                    id="form-name"
                    required
                    placeholder={language === 'uz' ? 'Ismingizni kiriting' : 'Введите ваше имя'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-phone" className="form-label">
                    {language === 'uz' ? 'Telefon raqamingiz' : 'Номер телефона'}
                  </label>
                  <input
                    type="tel"
                    id="form-phone"
                    placeholder="+998 (90) 123-45-67"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-msg" className="form-label">
                    {language === 'uz' ? 'Xabaringiz *' : 'Ваше сообщение *'}
                  </label>
                  <textarea
                    id="form-msg"
                    required
                    placeholder={language === 'uz' ? 'Murojaat matnini kiriting...' : 'Введите текст обращения...'}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input form-textarea"
                  />
                </div>

                <button type="submit" className="btn-primary submit-btn">
                  {language === 'uz' ? 'Xabarni yuborish' : 'Отправить сообщение'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-page {
          background-color: var(--main-bg);
          min-height: 80vh;
          padding-top: 40px;
          padding-bottom: 80px;
        }

        .contact-title {
          font-family: var(--font-headings);
          font-size: 32px;
          color: var(--primary-dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 32px;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }

        @media (min-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1.2fr 1fr;
            gap: 64px;
          }
        }

        .contact-subtitle {
          font-family: var(--font-headings);
          font-size: 22px;
          color: var(--primary-dark);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 16px;
        }

        .contact-lead {
          font-size: 15px;
          line-height: 1.6;
          color: var(--primary-text);
          margin-bottom: 32px;
        }

        .contact-info-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-card {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 24px;
          line-height: 1;
        }

        .info-body h5 {
          font-family: var(--font-headings);
          font-size: 14px;
          text-transform: uppercase;
          color: var(--cta-orange);
          margin: 0 0 8px 0;
          letter-spacing: 0.03em;
        }

        .info-body p {
          font-size: 14px;
          line-height: 1.5;
          color: var(--primary-text);
          margin: 0;
        }

        .phone-numbers {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-body a {
          color: var(--primary-dark);
          font-weight: 500;
          transition: color 200ms ease;
        }

        .info-body a:hover {
          color: var(--cta-orange);
        }

        .map-link, .telegram-link {
          display: inline-block;
          margin-top: 8px;
          font-size: 13px;
          text-decoration: underline !important;
          color: var(--cta-orange) !important;
        }

        .contact-form {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--primary-text);
        }

        .form-input {
          border: 1px solid var(--border-color);
          background-color: var(--main-bg);
          border-radius: 3px;
          height: 44px;
          padding: 0 16px;
          font-size: 14px;
          outline: none;
          color: var(--primary-dark);
          transition: border-color 200ms ease;
        }

        .form-input:focus {
          border-color: var(--cta-orange);
        }

        .form-textarea {
          padding: 12px 16px;
          min-height: 120px;
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          margin-top: 8px;
        }

        .success-alert {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
          padding: 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
        }
      `}</style>
    </main>
  );
}
