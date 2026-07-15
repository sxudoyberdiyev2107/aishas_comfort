'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { language, changeLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Cart item counter listener
  useEffect(() => {
    const updateCartCount = () => {
      if (typeof window !== 'undefined') {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      }
    };

    updateCartCount();

    // Custom event to sync cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    // Standard storage listener for tab-syncing
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Scroll listener for sticky styles
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/kategoriya/all?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { name: t('navigation.home'), path: '/' },
    { name: t('navigation.shop'), path: '/kategoriya/all' },
    { name: t('navigation.newArrivals'), path: '/kategoriya/yangi' },
    { name: t('navigation.promos'), path: '/kategoriya/aksiya' },
    { name: t('navigation.about'), path: '/biz-haqimizda' },
    { name: t('navigation.contact'), path: '/aloqa' }
  ];

  const categoriesList = [
    { nameKey: 'parta-stullar', slug: 'parta-stullar' },
    { nameKey: 'bolalar-o-yingohlari', slug: 'bolalar-o-yingohlari' },
    { nameKey: 'kompyuter-ish-stollari', slug: 'kompyuter-ish-stollari' },
    { nameKey: 'ofis-kreslolari', slug: 'ofis-kreslolari' },
    { nameKey: 'game-kreslolari', slug: 'game-kreslolari' },
    { nameKey: 'bar-stullari', slug: 'bar-stullari' },
    { nameKey: 'boshqa-stul-kreslolar', slug: 'boshqa-stul-kreslolar' },
    { nameKey: 'yugurish-yo-laklari', slug: 'yugurish-yo-laklari' },
    { nameKey: 'velo-trenajyorlar', slug: 'velo-trenajyorlar' },
    { nameKey: 'tebratma-kursilar', slug: 'tebratma-kursilar' },
    { nameKey: 'kitob-javonlari', slug: 'kitob-javonlari' },
    { nameKey: 'kemping-uchun', slug: 'kemping-uchun' },
    { nameKey: 'stollar', slug: 'stollar' }
  ];

  return (
    <>
      <header className={`header ${isSticky ? 'sticky' : ''}`} id="main-header">
        <div className="header-container">
          {/* Mobile Hamburguer Toggle */}
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Logo */}
          <div className="logo-section">
            <Link href="/" className="logo-link">
              <img 
                src="/brand/Aishas_Comfort_Logo_Horizontal.svg" 
                alt="Aisha's Comfort" 
                className="logo-img logo-desktop" 
              />
              <img 
                src="/brand/Aishas_Comfort_Symbol_Primary.svg" 
                alt="Aisha's Comfort" 
                className="logo-img logo-mobile" 
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Desktop navigation">
            <ul>
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.path} className="nav-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Controls (Search, Account, Cart, Language Switcher) */}
          <div className="header-controls">
            {/* Language Switcher */}
            <div className="lang-switcher">
              <button 
                className={`lang-btn ${language === 'uz' ? 'active' : ''}`}
                onClick={() => changeLanguage('uz')}
              >
                UZ
              </button>
              <span className="lang-separator">|</span>
              <button 
                className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                onClick={() => changeLanguage('ru')}
              >
                RU
              </button>
            </div>

            {/* Search Button */}
            <button 
              className="control-btn" 
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('header.search')}
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account Profile Link */}
            <Link href="/admin" className="control-btn" aria-label={t('header.account')}>
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Shopping Cart Button */}
            <Link href="/savatcha" className="control-btn cart-btn-link" aria-label={t('header.cart')}>
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link href="/" className="logo-link" onClick={() => setIsMobileMenuOpen(false)}>
            AISHA'S COMFORT
          </Link>
          <button 
            className="close-drawer" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <ul>
            {navItems.map((item, idx) => (
              <li key={idx}>
                <Link 
                  href={item.path} 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mobile-drawer-divider"></div>
          
          <div className="mobile-drawer-section-title">
            {language === 'uz' ? 'Kategoriyalar' : 'Категории'}
          </div>
          
          <ul className="mobile-categories-list">
            {categoriesList.map((cat, idx) => (
              <li key={idx}>
                <Link 
                  href={`/kategoriya/${cat.slug}`} 
                  className="mobile-cat-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('categories.' + cat.nameKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-content">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input 
                type="text" 
                placeholder={t('header.search')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button type="submit" className="search-submit-btn">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <button 
              className="close-search-btn" 
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Styled Specifics for Header */}
      <style jsx global>{`
        /* Header styling inside components/Header.jsx to maintain encapsulation */
        .header {
          background-color: var(--white-surface);
          border-bottom: 1px solid var(--border-color);
          height: 76px;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: box-shadow 200ms ease, background-color 200ms ease;
        }
        
        .header.sticky {
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        
        .header-container {
          max-width: var(--max-width);
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        @media (min-width: 768px) {
          .header-container {
            padding: 0 24px;
          }
        }
        
        @media (min-width: 1024px) {
          .header-container {
            padding: 0 32px;
          }
        }

        .logo-link {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .logo-desktop {
          display: none;
          height: 48px;
          width: auto;
        }

        .logo-mobile {
          display: block;
          height: 52px;
          width: auto;
        }

        @media (min-width: 1024px) {
          .logo-desktop {
            display: block;
          }
          .logo-mobile {
            display: none;
          }
        }

        .desktop-nav {
          display: none;
        }

        .desktop-nav ul {
          display: flex;
          list-style: none;
          gap: 24px;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--primary-text);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .nav-link:hover {
          color: var(--cta-orange);
        }

        @media (min-width: 1024px) {
          .desktop-nav {
            display: block;
          }
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-btn {
          color: var(--primary-text);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          width: 44px;
          border-radius: 50%;
          transition: color 200ms ease;
        }

        .control-btn:hover {
          color: var(--cta-orange);
        }

        .icon {
          width: 22px;
          height: 22px;
        }

        .cart-btn-link {
          position: relative;
        }

        .cart-counter {
          position: absolute;
          top: 6px;
          right: 6px;
          background-color: var(--cta-orange);
          color: var(--white-surface);
          font-size: 10px;
          font-weight: 700;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lang-switcher {
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--secondary-text);
        }

        .lang-btn {
          color: var(--secondary-text);
          padding: 4px;
          transition: color 200ms ease;
        }

        .lang-btn.active {
          color: var(--cta-orange);
        }

        .lang-separator {
          margin: 0 4px;
          opacity: 0.3;
        }

        /* Hamburger Menu */
        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 20px;
          height: 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }

        .hamburger span {
          width: 20px;
          height: 2px;
          background-color: var(--primary-dark);
          transition: all 0.3s linear;
          transform-origin: 1px;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg);
        }

        @media (min-width: 1024px) {
          .hamburger {
            display: none;
          }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: -280px;
          width: 280px;
          height: 100%;
          background-color: var(--white-surface);
          z-index: 2000;
          box-shadow: 4px 0 12px rgba(0,0,0,0.1);
          transition: left 0.3s ease;
          padding: 24px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .mobile-drawer.open {
          left: 0;
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .close-drawer {
          height: 44px;
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-text);
        }

        .mobile-nav ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile-nav-link {
          font-size: 16px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--primary-text);
          display: block;
          padding: 8px 0;
        }

        .mobile-nav-link:hover {
          color: var(--cta-orange);
        }

        .mobile-drawer-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 20px 0;
        }

        .mobile-drawer-section-title {
          font-family: var(--font-headings);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--secondary-text);
          margin-bottom: 12px;
        }

        .mobile-categories-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 0 20px 0;
        }

        .mobile-cat-link {
          font-size: 14px;
          color: var(--primary-text);
          display: block;
          padding: 4px 0;
          transition: color 200ms ease;
        }

        .mobile-cat-link:hover {
          color: var(--cta-orange);
        }

        /* Search Overlay */
        .search-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(250, 250, 248, 0.95);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .search-overlay-content {
          max-width: 600px;
          width: 100%;
          position: relative;
        }

        .search-form {
          display: flex;
          align-items: center;
          border-bottom: 2px solid var(--primary-dark);
          padding-bottom: 8px;
        }

        .search-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 24px;
          font-weight: 500;
          color: var(--primary-dark);
          outline: none;
        }

        .search-submit-btn {
          color: var(--primary-dark);
          margin-left: 12px;
        }

        .close-search-btn {
          position: absolute;
          top: -64px;
          right: 0;
          color: var(--primary-dark);
          height: 44px;
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
}
