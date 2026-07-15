'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef(null);

  const slides = [
    {
      title: t('hero.slide1.title'),
      sub: t('hero.slide1.sub'),
      cta: t('hero.slide1.cta'),
      link: '/kategoriya/yotoqxona',
      image: '/hero_bedroom_linen.webp'
    },
    {
      title: t('hero.slide2.title'),
      sub: t('hero.slide2.sub'),
      cta: t('hero.slide2.cta'),
      link: '/kategoriya/yangi',
      image: '/hero_luxury_pillows.webp'
    },
    {
      title: t('hero.slide3.title'),
      sub: t('hero.slide3.sub'),
      cta: t('hero.slide3.cta'),
      link: '/kategoriya/aksiya',
      image: '/hero_bedding_set.webp'
    }
  ];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentSlide((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        ),
      4500 // Switch every 4.5 seconds
    );

    return () => {
      resetTimeout();
    };
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const setSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero-section" aria-label="Featured promotions" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative pattern overlay */}
      <div 
        className="hero-pattern-overlay" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/brand/Aishas_Comfort_Pattern.svg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div className="hero-carousel" style={{ position: 'relative', zIndex: 2 }}>
        {slides.map((slide, index) => (
          <div
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            key={index}
            style={{ display: index === currentSlide ? 'flex' : 'none' }}
          >
            <div className="hero-content-grid container">
              {/* Left Column: Text & CTA */}
              <div className="hero-text-col">
                <h1 className="hero-heading">{slide.title}</h1>
                <p className="hero-subtext">{slide.sub}</p>
                <div>
                  <Link href={slide.link} className="btn-primary">
                    {slide.cta}
                  </Link>
                </div>
              </div>
              
              {/* Right Column: Visual Composition */}
              <div className="hero-image-col">
                <div className="hero-image-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="hero-image"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow arrow-left" 
          onClick={prevSlide} 
          aria-label="Previous slide"
        >
          <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="carousel-arrow arrow-right" 
          onClick={nextSlide} 
          aria-label="Next slide"
        >
          <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Navigation Indicators (Dots) */}
        <div className="carousel-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            ></button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          background-color: var(--hero-bg);
          position: relative;
          overflow: hidden;
        }

        .hero-carousel {
          position: relative;
          min-height: 500px;
          display: flex;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .hero-carousel {
            height: 600px;
          }
        }

        .hero-slide {
          width: 100%;
          display: flex;
          align-items: center;
          animation: fadeEffect 600ms ease;
        }

        @keyframes fadeEffect {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }

        .hero-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: center;
          padding-top: 48px;
          padding-bottom: 64px;
        }

        @media (min-width: 768px) {
          .hero-content-grid {
            grid-template-columns: 1.2fr 1fr;
            padding-top: 0;
            padding-bottom: 0;
          }
        }

        .hero-text-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hero-heading {
          margin: 0;
          color: var(--primary-dark);
        }

        .hero-subtext {
          font-family: var(--font-body);
          font-size: 16px;
          color: var(--secondary-text);
          max-width: 480px;
          line-height: 1.6;
        }

        .hero-image-col {
          display: flex;
          justify-content: center;
        }

        .hero-image-wrapper {
          width: 100%;
          max-width: 420px;
          aspect-ratio: 1 / 1;
          position: relative;
          overflow: hidden;
          background-color: rgba(0,0,0,0.03);
          border-radius: 4px;
        }

        @media (min-width: 1024px) {
          .hero-image-wrapper {
            max-width: 500px;
          }
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 6s ease;
        }

        .hero-slide.active .hero-image {
          transform: scale(1.03);
        }

        /* Carousel Navigation Controls */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.4);
          color: var(--primary-dark);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 200ms ease, color 200ms ease;
          z-index: 10;
        }

        .carousel-arrow:hover {
          background-color: var(--primary-dark);
          color: var(--white-surface);
        }

        .arrow-left {
          left: 16px;
        }

        .arrow-right {
          right: 16px;
        }

        @media (max-width: 767px) {
          .carousel-arrow {
            display: none; /* Hide arrows on mobile for clean screen spacing */
          }
        }

        .arrow-icon {
          width: 24px;
          height: 24px;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(16, 24, 32, 0.2);
          transition: background-color 200ms ease, width 200ms ease;
          padding: 0;
        }

        .indicator-dot.active {
          background-color: var(--cta-orange);
          width: 24px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}
