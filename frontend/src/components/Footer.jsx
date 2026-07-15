'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Simulate API call
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="footer" id="main-footer">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link href="/" className="footer-logo-link" style={{ display: 'inline-block', marginBottom: '20px' }}>
            <img 
              src="/brand/Aishas_Comfort_Logo_Mono_White.svg" 
              alt="Aisha's Comfort" 
              className="footer-logo-img" 
              style={{ height: '36px', width: 'auto' }}
            />
          </Link>
          <p className="brand-description">
            {t('hero.slide1.sub')}
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Telegram">
              <svg className="social-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.61l-1.91 9c-.14.65-.53.81-1.08.5l-2.92-2.15-1.41 1.36c-.16.16-.29.29-.6.29l.21-2.99 5.44-4.92c.24-.21-.05-.33-.37-.11L8.13 13.06l-2.9-.91c-.63-.2-1.09-.63-.04-.99l11.27-4.34c.52-.19.98.12.8.79z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="footer-col links-col">
          <h4 className="footer-title">{t('navigation.shop')}</h4>
          <ul className="footer-links">
            <li><Link href="/kategoriya/parta-stullar">{t('categories.parta-stullar')}</Link></li>
            <li><Link href="/kategoriya/kompyuter-ish-stollari">{t('categories.kompyuter-ish-stollari')}</Link></li>
            <li><Link href="/kategoriya/ofis-kreslolari">{t('categories.ofis-kreslolari')}</Link></li>
            <li><Link href="/kategoriya/kitob-javonlari">{t('categories.kitob-javonlari')}</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-col contact-col">
          <h4 className="footer-title">{t('navigation.contact')}</h4>
          <ul className="footer-contact-info">
            <li>
              <span>
                {language === 'uz' 
                  ? 'Toshkent shahar, Chilonzor tumani, 9-kvartal' 
                  : 'г. Ташкент, Чиланзарский район, 9-й квартал'}
              </span>
            </li>
            <li>
              <a href="tel:+998770043324">+998 77 004 33 24</a>
            </li>
            <li>
              <a href="tel:+998920433356">+998 92 043 33 56</a>
            </li>
            <li>
              <a href="mailto:Aishas_comfort@mail.ru">Aishas_comfort@mail.ru</a>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-title">Newsletter</h4>
          <p className="newsletter-text">
            {t('language') === 'uz' 
              ? 'Yangi kolleksiyalar va aksiyalar haqida birinchilardan bo\'lib biling.' 
              : 'Узнавайте первыми о новых коллекциях и акциях.'}
          </p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input 
              type="email" 
              placeholder="Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              aria-label="Email address"
            />
            <button type="submit" className="newsletter-btn">
              {subscribed ? '✓' : '→'}
            </button>
          </form>
          {subscribed && (
            <p className="newsletter-success">
              {t('language') === 'uz' ? 'Muvaffaqiyatli obuna bo\'ldingiz!' : 'Вы успешно подписались!'}
            </p>
          )}
        </div>
      </div>
      
      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} Aisha's Comfort. All rights reserved.</p>
      </div>

      <style jsx>{`
        .footer {
          background-color: var(--primary-dark);
          color: var(--white-surface);
          padding-top: 64px;
          padding-bottom: 32px;
          margin-top: auto;
          border-top: 1px solid var(--border-color);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          border-bottom: 1px solid rgba(226, 226, 222, 0.1);
          padding-bottom: 48px;
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 2fr;
          }
        }

        .footer-col {
          display: flex;
          flex-direction: column;
        }

        .footer-logo {
          font-family: var(--font-headings);
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--white-surface);
          margin-bottom: 16px;
          display: inline-block;
        }

        .brand-description {
          font-size: 14px;
          color: var(--secondary-text);
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 320px;
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-link {
          color: var(--secondary-text);
          transition: color 200ms ease;
        }

        .social-link:hover {
          color: var(--cta-orange);
        }

        .social-icon {
          width: 20px;
          height: 20px;
        }

        .footer-title {
          font-family: var(--font-headings);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-links, .footer-contact-info {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 14px;
        }

        .footer-links a, .footer-contact-info a {
          color: var(--secondary-text);
          transition: color 200ms ease;
        }

        .footer-links a:hover, .footer-contact-info a:hover {
          color: var(--cta-orange);
        }

        .footer-contact-info li span {
          color: var(--secondary-text);
        }

        .newsletter-text {
          font-size: 14px;
          color: var(--secondary-text);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .newsletter-form {
          display: flex;
          border-bottom: 1px solid rgba(226, 226, 222, 0.3);
          padding-bottom: 8px;
          align-items: center;
        }

        .newsletter-input {
          background: transparent;
          border: none;
          color: var(--white-surface);
          width: 100%;
          outline: none;
          font-size: 14px;
        }

        .newsletter-input::placeholder {
          color: rgba(226, 226, 222, 0.4);
        }

        .newsletter-btn {
          color: var(--cta-orange);
          font-size: 18px;
          padding: 0 8px;
          transition: transform 200ms ease, color 200ms ease;
        }

        .newsletter-btn:hover {
          transform: translateX(2px);
          color: var(--cta-hover);
        }

        .newsletter-success {
          font-size: 12px;
          color: #2e7d32;
          margin-top: 8px;
        }

        .footer-bottom {
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--secondary-text);
        }
      `}</style>
    </footer>
  );
}
