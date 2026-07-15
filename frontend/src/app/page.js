'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import Benefits from '../components/Benefits';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { t, language } = useLanguage();

  // Localized mock products matching categories and specs
  const mockProducts = [
    {
      id: 1,
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
      name_uz: "Bolalar uchun yig'iladigan kichik parta",
      name_ru: "Детская складная мини-парта",
      price: 320000,
      image_url: "/prod_pillows.jpg",
      is_new: true,
      is_bestseller: false
    },
    {
      id: 3,
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
      name_uz: "Minimalist Eman Kitob Javoni (Bookshelf)",
      name_ru: "Минималистичный дубовый книжный шкаф",
      price: 980000,
      image_url: "/prod_towels.jpg",
      is_new: false,
      is_bestseller: false
    }
  ];

  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          setProducts(mockProducts);
        }
      } catch (err) {
        setProducts(mockProducts);
      }
    };
    fetchProducts();
  }, []);

  const newArrivals = products.filter(p => p.is_new);
  const bestSellers = products.filter(p => p.is_bestseller);

  const reviews = [
    {
      name: "Sabina A.",
      text_uz: "O'quv partasi va stul to'plami sifati ajoyib! Bolamga juda yoqdi, ergonomikasi a'lo darajada. Tavsiya qilaman.",
      text_ru: "Качество комплекта парты и стула потрясающее! Ребенку очень понравилось, эргономика на высшем уровне. Рекомендую.",
      rating: 5
    },
    {
      name: "Doston K.",
      text_uz: "Yetkazib berish juda tez. Buyurtma qilgan kunimning o'zidayoq olib kelib berishdi. Sifatiga gap yo'q.",
      text_ru: "Очень быстрая доставка. Привезли в тот же день, когда я сделал заказ. К качеству претензий нет.",
      rating: 5
    }
  ];

  const instagramPics = [
    "/insta_1.jpg",
    "/insta_2.jpg",
    "/insta_3.jpg",
    "/insta_4.jpg"
  ];

  return (
    <main className="main-content">
      {/* 1. Hero banner slideshow */}
      <Hero />

      {/* 2. Product categories */}
      <CategorySection />

      {/* 3. New arrivals grid */}
      <section className="section product-grid-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('products.newArrivalsTitle')}</h2>
            <Link href="/kategoriya/yangi" className="view-all-link">
              {t('categories.viewAll')} &rarr;
            </Link>
          </div>
          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional banner */}
      <section className="promo-banner-section">
        <div className="container promo-banner-container">
          <div className="promo-banner-content">
            <span className="promo-tag">
              {language === 'uz' ? 'MAVSUMIY CHEGIRMA' : 'СЕЗОННАЯ СКИДКА'}
            </span>
            <h2 className="promo-title">
              {language === 'uz' ? 'Uyingizga shinamlik ulashing' : 'Подарите уют вашему дому'}
            </h2>
            <p className="promo-description">
              {language === 'uz' 
                ? 'Barcha yotoqxona va hammom to\'plamlariga 20% gacha yozgi chegirmalar.' 
                : 'Летние скидки до 20% на все спальные и банные комплекты.'}
            </p>
            <div>
              <Link href="/kategoriya/aksiya" className="btn-primary">
                {t('hero.slide3.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best-selling products grid */}
      <section className="section product-grid-section card-bg-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('products.bestsellerTitle')}</h2>
            <Link href="/kategoriya/all" className="view-all-link">
              {t('categories.viewAll')} &rarr;
            </Link>
          </div>
          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Store benefits */}
      <Benefits />

      {/* 7. Customer reviews */}
      <section className="section reviews-section">
        <div className="container">
          <div className="section-header centered">
            <h2 className="section-title">
              {language === 'uz' ? 'Mijozlarimizdan sharhlar' : 'Отзывы наших клиентов'}
            </h2>
          </div>
          <div className="reviews-grid">
            {reviews.map((rev, idx) => (
              <div className="review-card" key={idx}>
                <div className="review-rating">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="review-text">
                  "{language === 'uz' ? rev.text_uz : rev.text_ru}"
                </p>
                <span className="review-author">- {rev.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Instagram gallery */}
      <section className="section instagram-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Instagram @aishas_comfort</h2>
          </div>
          <div className="instagram-grid">
            {instagramPics.map((pic, idx) => (
              <div className="instagram-card" key={idx}>
                <div className="instagram-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pic} alt="Instagram post" className="instagram-image" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .section-header.centered {
          justify-content: center;
          text-align: center;
        }

        .section-title {
          font-size: 24px;
          margin: 0;
        }

        @media (min-width: 1024px) {
          .section-title {
            font-size: 30px;
          }
        }

        .view-all-link {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-dark);
          border-bottom: 1px solid var(--primary-dark);
          padding-bottom: 2px;
          transition: color 200ms ease, border-color 200ms ease;
        }

        .view-all-link:hover {
          color: var(--cta-orange);
          border-color: var(--cta-orange);
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        .card-bg-section {
          background-color: var(--card-bg);
        }

        /* Promo Banner Section */
        .promo-banner-section {
          background-image: linear-gradient(rgba(16, 24, 32, 0.4), rgba(16, 24, 32, 0.4)), url('/hero_bedding_set.webp');
          background-size: cover;
          background-position: center;
          color: var(--white-surface);
          padding-top: 100px;
          padding-bottom: 100px;
          text-align: center;
        }

        .promo-banner-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .promo-tag {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--cta-orange);
        }

        .promo-title {
          font-size: 32px;
          color: var(--white-surface);
          margin: 0;
        }

        @media (min-width: 1024px) {
          .promo-title {
            font-size: 48px;
          }
        }

        .promo-description {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 8px;
        }

        /* Reviews Styling */
        .reviews-section {
          background-color: var(--white-surface);
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .reviews-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .review-card {
          background-color: var(--main-bg);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-rating {
          color: var(--cta-orange);
          font-size: 18px;
        }

        .review-text {
          font-size: 15px;
          color: var(--primary-text);
          font-style: italic;
          line-height: 1.6;
          flex-grow: 1;
        }

        .review-author {
          font-size: 13px;
          font-weight: 600;
          color: var(--secondary-text);
        }

        /* Instagram Styling */
        .instagram-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 768px) {
          .instagram-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }

        .instagram-card {
          border-radius: 4px;
          overflow: hidden;
        }

        .instagram-image-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1;
          background-color: var(--card-bg);
        }

        .instagram-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 300ms ease;
        }

        .instagram-card:hover .instagram-image {
          transform: scale(1.03);
        }
      `}</style>
    </main>
  );
}
