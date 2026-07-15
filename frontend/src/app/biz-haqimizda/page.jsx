'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { language } = useLanguage();

  // Set page document titles and meta tags dynamically
  useEffect(() => {
    const titleText = language === 'uz'
      ? "Biz haqimizda | Ofis kreslolari, o'quv partasi va uy uchun trenajyorlar do'koni"
      : "О нас | Магазин офисных кресел, учебных парт и домашних тренажеров";
    
    const descText = language === 'uz'
      ? "2022-yildan beri tayyor ofis stollari, o'quv markazlar uchun mebellar va yugurish yo'laklarini yetkazib beramiz. Mahsulotlar doim omborda tayyor. Kutish shart emas!"
      : "С 2022 года поставляем готовые компьютерные столы, офисную мебель и беговые дорожки. Весь товар в наличии на складе. Быстрая доставка!";

    document.title = titleText;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descText);
  }, [language]);

  return (
    <main className="section about-page">
      <div className="container">
        <h1 className="about-title">
          {language === 'uz' ? 'Biz Haqimizda' : 'О Нас'}
        </h1>

        <div className="about-hero-section">
          <h2 className="about-subtitle">
            {language === 'uz'
              ? 'Biz haqimizda: Qulaylik, sifat va tezkor yetkazib berish'
              : 'О нас: Комфорт, качество и оперативная доставка'}
          </h2>
          <p className="about-lead">
            {language === 'uz'
              ? 'Kompaniyamiz 2022-yildan beri uylar, ofislar va ta\'lim muassasalari uchun yuqori sifatli mebellar hamda sport jihozlarini yetkazib berish bilan shug\'ullanadi. B2C va B2B segmentlarida faoliyat yuritib, yakuniy iste\'molchilar, yirik korxonalar va xususiy biznes egalariga xizmat ko\'rsatamiz. Shu kungacha 10 000 dan ortiq mamnun mijozlar o\'z ish va dam olish maydonini biz bilan qulaylashgan.'
              : 'Наша компания с 2022 года занимается поставками высококачественной мебели и спортивного инвентаря. Мы работаем в сегментах B2C и B2B, обеспечивая комфортом как частных лиц, так и крупные организации, офисы и частный бизнес. На сегодняшний день более 10 000 довольных клиентов выбрали нас для обустройства своего рабочего пространства и дома.'}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="about-grid">
          <h3 className="section-title-small">
            {language === 'uz' ? 'Biz taklif qiladigan mahsulotlar:' : 'Наш ассортимент:'}
          </h3>
          
          <div className="about-cards-row">
            <div className="about-card">
              <div className="card-header">
                <img src="/brand icons/Aishas_Comfort_Icon_12_Office_Chair.svg" alt="" className="card-icon" />
                <h4>{language === 'uz' ? 'Ofis va ish joyi uchun' : 'Офисная мебель'}</h4>
              </div>
              <p>
                {language === 'uz'
                  ? 'Har qanday interyerga mos ofis kreslolari, zamonaviy ofis stollari, qulay ish stollari hamda turli xil stollar. Dasturchilar va geymerlar uchun maxsus game kreslolar.'
                  : 'Удобные офисные кресла, современные офисные столы, эргономичные письменные столы и компьютерные столы. Для геймеров и IT-специалистов — специализированные игровые кресла.'}
              </p>
            </div>

            <div className="about-card">
              <div className="card-header">
                <img src="/brand icons/Aishas_Comfort_Icon_15_School_Desk.svg" alt="" className="card-icon" />
                <h4>{language === 'uz' ? 'Ta\'lim muassasalari uchun' : 'Для учебных заведений'}</h4>
              </div>
              <p>
                {language === 'uz'
                  ? 'Maktab va bog\'chalar uchun mustahkam parta stul va o\'quv partasi. Shuningdek, o\'quv markazlar uchun mebellar.'
                  : 'Надежная мебель для учебных центров, включая школьные парты, стулья и ученические столы, адаптированные для интенсивного использования.'}
              </p>
            </div>

            <div className="about-card">
              <div className="card-header">
                <img src="/brand icons/Aishas_Comfort_Icon_03_Coffee_Table.svg" alt="" className="card-icon" />
                <h4>{language === 'uz' ? 'Sport va dam olish uchun' : 'Спорт и отдых'}</h4>
              </div>
              <p>
                {language === 'uz'
                  ? 'Uyda sport bilan shug\'ullanish uchun mo\'ljallangan zamonaviy uy uchun trinajorlar va yugurish yo\'laklari. Kafelar va oshxonalar uchun bar kreslolari.'
                  : 'Все для того, чтобы заниматься спортом дома: современные домашние тренажеры и беговые дорожки. В наличии также стильные барные стулья для кафе и кухни.'}
              </p>
            </div>
          </div>
        </div>

        {/* Advantages */}
        <div className="about-advantages-section">
          <h3 className="section-title-small">
            {language === 'uz' ? 'Bizning asosiy ustunligimiz (Nega bizni tanlashadi?):' : 'Наши главные преимущества:'}
          </h3>
          <div className="advantages-row">
            <div className="advantage-item">
              <h5>{language === 'uz' ? 'Kutish shart emas' : 'Товар в наличии'}</h5>
              <p>
                {language === 'uz'
                  ? 'Mahsulotlarimiz doimiy tayyor holatda, omborimizda mavjud. Buyurtma berganingizdan so\'ng tovarlar qisqa muddatda yetkazib beriladi.'
                  : 'Вам не нужно ждать поставок — вся продукция готова к отправке прямо со склада.'}
              </p>
            </div>
            <div className="advantage-item">
              <h5>{language === 'uz' ? 'Maxsus buyurtmalar' : 'Индивидуальный заказ'}</h5>
              <p>
                {language === 'uz'
                  ? 'Mijozlarning istak va xohishlariga qarab, joriy assortimentimizda yo\'q tovarlarni ham topib, qisqa vaqt ichida keltirib beramiz.'
                  : 'Если вы не нашли нужную модель в каталоге, мы привезём её под заказ, полностью учитывая ваши требования.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="about-cta-banner">
          <p className="cta-text">
            {language === 'uz'
              ? 'O\'zingizga kerakli mebel yoki sport jihozini hoziroq tanlang!'
              : 'Обустройте свое пространство с нами — переходите в каталог!'}
          </p>
          <Link href="/kategoriya/all" className="btn-primary cta-btn">
            {language === 'uz' ? 'Katalogga o\'tish' : 'Перейти в каталог'}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .about-page {
          background-color: var(--main-bg);
          min-height: 80vh;
          padding-top: 40px;
          padding-bottom: 80px;
        }

        .about-title {
          font-family: var(--font-headings);
          font-size: 32px;
          color: var(--primary-dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 32px;
        }

        .about-hero-section {
          margin-bottom: 48px;
        }

        .about-subtitle {
          font-family: var(--font-headings);
          font-size: 22px;
          color: var(--primary-dark);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .about-lead {
          font-size: 16px;
          line-height: 1.7;
          color: var(--primary-text);
        }

        .section-title-small {
          font-family: var(--font-headings);
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--primary-dark);
          margin-bottom: 24px;
          border-left: 3px solid var(--cta-orange);
          padding-left: 12px;
        }

        .about-cards-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 48px;
        }

        @media (min-width: 768px) {
          .about-cards-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .about-card {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .card-header h4 {
          font-family: var(--font-headings);
          font-size: 15px;
          text-transform: uppercase;
          color: var(--primary-dark);
          margin: 0;
        }

        .about-card p {
          font-size: 13px;
          line-height: 1.6;
          color: var(--secondary-text);
          margin: 0;
        }

        .about-advantages-section {
          margin-bottom: 56px;
        }

        .advantages-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .advantages-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .advantage-item {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 24px;
        }

        .advantage-item h5 {
          font-family: var(--font-headings);
          font-size: 16px;
          text-transform: uppercase;
          color: var(--cta-orange);
          margin-top: 0;
          margin-bottom: 12px;
        }

        .advantage-item p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--primary-text);
          margin: 0;
        }

        .about-cta-banner {
          background-color: var(--primary-dark);
          color: var(--white-surface);
          border-radius: 4px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 20px;
        }

        .cta-text {
          font-size: 18px;
          font-weight: 500;
          margin: 0;
        }

        .cta-btn {
          min-width: 200px;
        }
      `}</style>
    </main>
  );
}
