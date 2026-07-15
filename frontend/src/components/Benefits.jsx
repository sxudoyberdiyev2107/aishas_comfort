'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Benefits() {
  const { t, language } = useLanguage();

  const items = [
    {
      title: language === 'uz' ? 'Tez yetkazib berish' : 'Быстрая доставка',
      desc: language === 'uz' ? 'Mebellarni uyingizgacha xavfsiz yetkazamiz' : 'Бережная доставка мебели до вашего дома',
      iconUrl: '/brand icons/Aishas_Comfort_Icon_29_Delivery.svg'
    },
    {
      title: language === 'uz' ? 'Yig\'ish xizmati' : 'Сборка мебели',
      desc: language === 'uz' ? 'Professional ustalar tomonidan yig\'ib berish' : 'Сборка мебели профессиональными мастерами',
      iconUrl: '/brand icons/Aishas_Comfort_Icon_30_Assembly.svg'
    },
    {
      title: language === 'uz' ? 'Kafolat' : 'Гарантия качества',
      desc: language === 'uz' ? 'Rasmiy 1 yillik kafolat va servis xizmati' : 'Официальная гарантия 1 год и сервисное обслуживание',
      iconUrl: '/brand icons/Aishas_Comfort_Icon_31_Warranty.svg'
    },
    {
      title: language === 'uz' ? 'Konsultatsiya' : 'Консультация',
      desc: language === 'uz' ? 'Mutaxassislarimizdan bepul maslahat oling' : 'Бесплатная консультация от наших специалистов',
      iconUrl: '/brand icons/Aishas_Comfort_Icon_32_Consultation.svg'
    }
  ];

  return (
    <section className="section benefits-section" aria-labelledby="benefits-heading">
      <div className="container">
        <h2 id="benefits-heading" className="sr-only">{t('benefits.title')}</h2>
        <div className="benefits-grid">
          {items.map((item, idx) => (
            <div className="benefit-card" key={idx}>
              <div className="benefit-icon-wrapper" style={{ backgroundColor: 'transparent', width: '40px', height: '40px' }}>
                <img 
                  src={item.iconUrl} 
                  alt={item.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div className="benefit-content">
                <h3 className="benefit-title">{item.title}</h3>
                <p className="benefit-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .benefits-section {
          background-color: var(--white-surface);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 640px) {
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .benefits-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        .benefit-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .benefit-icon-wrapper {
          color: var(--cta-orange);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          width: 48px;
          border-radius: 50%;
          background-color: var(--card-bg);
        }

        .benefit-icon {
          width: 24px;
          height: 24px;
        }

        .benefit-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .benefit-title {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          text-transform: none;
          letter-spacing: 0;
          color: var(--primary-dark);
          margin: 0;
        }

        .benefit-desc {
          font-size: 13px;
          color: var(--secondary-text);
          line-height: 1.5;
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
    </section>
  );
}
