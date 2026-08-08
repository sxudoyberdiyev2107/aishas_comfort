'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getImageSrc } from '../../lib/imageUrl';

export default function AdminPage() {
  const { t, language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // products, orders

  // Login Form States
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Catalog CRUD States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  // Image Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Rang variantlari (faqat mavjud mahsulotni tahrirlashda ishlaydi)
  const [colors, setColors] = useState([]);
  const [colorForm, setColorForm] = useState({ name_uz: '', name_ru: '', hex_code: '#1E5AA8' });
  const [colorError, setColorError] = useState('');
  const [colorImageUploadingId, setColorImageUploadingId] = useState(null);

  // Product Form States
  const [productForm, setProductForm] = useState({
    name_uz: '',
    name_ru: '',
    desc_uz: '',
    desc_ru: '',
    price: '',
    old_price: '',
    category: 'parta-stullar',
    image_url: '',
    video_url: ''
  });

  const backendUrl = 'https://aishascomfort-production.up.railway.app/api';

  // 1. Verify Auth session on load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch(`${backendUrl}/admin/verify`, {
          method: 'GET',
          // Send cookies (HttpOnly admin_token)
          credentials: 'include'
        });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchDashboardData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Products
      // credentials: 'include' MUHIM — shu cookie orqali server bizni
      // admin deb taniydi va yashirilgan/arxivlangan mahsulotlarni ham beradi
      const prodRes = await fetch(`${backendUrl}/products`, { credentials: 'include' });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Fetch Orders
      const orderRes = await fetch(`${backendUrl}/orders`, { credentials: 'include' });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  // 2. Handle Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${backendUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include' // allow backend to set cookies
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setLoginError(t('admin.loginError'));
      }
    } catch (err) {
      setLoginError(t('admin.loginError'));
    }
  };

  // 3. Handle Logout
  const handleLogout = async () => {
    try {
      // Call backend to clear cookie
      await fetch(`${backendUrl}/admin/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  // 4. Product Form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  // 4b. Rasm faylini serverga yuklash
  const handleImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadError('');

    // Fayl turi tekshiruvi (backend faqat jpg, png, webp qabul qiladi)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(language === 'uz'
        ? 'Faqat JPG, PNG yoki WEBP formatidagi rasmlarni yuklash mumkin.'
        : 'Можно загружать только изображения в формате JPG, PNG или WEBP.');
      e.target.value = '';
      return;
    }

    // Hajm tekshiruvi (backend chegarasi - 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(language === 'uz'
        ? 'Rasm hajmi 5 MB dan oshmasligi kerak.'
        : 'Размер изображения не должен превышать 5 МБ.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file); // <-- backend/routes/upload.js dagi nom bilan bir xil bo'lishi shart

      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData, // Content-Type ni QO'LDA yozmaymiz - brauzer o'zi qo'yadi
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          setProductForm(prev => ({ ...prev, image_url: data.url }));
        } else {
          setUploadError(language === 'uz'
            ? 'Server rasm manzilini qaytarmadi.'
            : 'Сервер не вернул ссылку на изображение.');
        }
      } else {
        // Backend o'z xato matnini qaytarsa, o'shani ko'rsatamiz
        let msg = language === 'uz'
          ? 'Rasm yuklanmadi. Qaytadan urinib ko\'ring.'
          : 'Изображение не загружено. Попробуйте снова.';
        try {
          const errData = await res.json();
          if (errData && errData.error) msg = errData.error;
        } catch (parseErr) {
          // javob JSON emas - standart xabar qoladi
        }
        setUploadError(msg);
      }
    } catch (err) {
      setUploadError(language === 'uz'
        ? 'Serverga ulanishda xatolik.'
        : 'Ошибка соединения с сервером.');
    } finally {
      setUploading(false);
      e.target.value = ''; // bir xil faylni qayta tanlash mumkin bo'lsin
    }
  };

  // 4c. Tanlangan rasmni olib tashlash
  const handleRemoveImage = () => {
    setProductForm(prev => ({ ...prev, image_url: '' }));
    setUploadError('');
  };

  // 5. Create or Update Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');

    const url = isEditing
      ? `${backendUrl}/products/${editingId}`
      : `${backendUrl}/products`;

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          old_price: productForm.old_price ? parseFloat(productForm.old_price) : null
        }),
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        // Token expired/invalid - kick out to login
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        setCrudSuccess(
          isEditing
            ? (language === 'uz' ? 'Mahsulot muvaffaqiyatli tahrirlandi.' : 'Товар успешно изменен.')
            : (language === 'uz' ? 'Mahsulot muvaffaqiyatli qo\'shildi.' : 'Товар успешно добавлен.')
        );
        resetProductForm();
        fetchDashboardData();
      } else {
        const errData = await res.json();
        setCrudError(errData.message || 'Error occurred');
      }
    } catch (err) {
      setCrudError('Server connection error.');
    }
  };

  // 6. Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return;
    setCrudError('');
    setCrudSuccess('');
    try {
      const res = await fetch(`${backendUrl}/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        setCrudSuccess(language === 'uz' ? 'Mahsulot o\'chirildi.' : 'Товар удален.');
        fetchDashboardData();
      } else {
        setCrudError('Failed to delete product.');
      }
    } catch (err) {
      setCrudError('Server connection error.');
    }
  };

  // 6b. Mahsulot holatini o'zgartirish (yashirish / arxivlash)
  //
  // changes — masalan { is_hidden: true } yoki { is_archived: false }.
  // Faqat yuborilgan maydon o'zgaradi.
  const handleStatusChange = async (id, changes, successMessage) => {
    setCrudError('');
    setCrudSuccess('');
    try {
      const res = await fetch(`${backendUrl}/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        setCrudSuccess(successMessage);
        fetchDashboardData();
      } else {
        setCrudError(language === 'uz'
          ? 'Mahsulot holatini o\'zgartirib bo\'lmadi.'
          : 'Не удалось изменить статус товара.');
      }
    } catch (err) {
      setCrudError('Server connection error.');
    }
  };

  // ===== RANG VARIANTLARI =====

  const fetchColors = async (productId) => {
    try {
      const res = await fetch(`${backendUrl}/products/${productId}/colors`);
      if (res.ok) {
        setColors(await res.json());
      }
    } catch (err) {
      console.error('Ranglarni yuklashda xato:', err);
    }
  };

  const handleColorFormChange = (e) => {
    const { name, value } = e.target;
    setColorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    setColorError('');

    if (!colorForm.name_uz.trim() || !colorForm.name_ru.trim()) {
      setColorError(language === 'uz'
        ? 'Rang nomini ikkala tilda ham yozing.'
        : 'Введите название цвета на обоих языках.');
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/products/${editingId}/colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorForm),
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        setColorForm({ name_uz: '', name_ru: '', hex_code: '#1E5AA8' });
        fetchColors(editingId);
      } else {
        const data = await res.json();
        setColorError(data.message || 'Rangni saqlab bo\'lmadi.');
      }
    } catch (err) {
      setColorError('Server connection error.');
    }
  };

  const handleDeleteColor = async (colorId) => {
    const confirmText = language === 'uz'
      ? 'Bu rang va uning barcha rasmlari o\'chiriladi. Davom etamizmi?'
      : 'Этот цвет и все его изображения будут удалены. Продолжить?';
    if (!window.confirm(confirmText)) return;

    setColorError('');
    try {
      const res = await fetch(`${backendUrl}/colors/${colorId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        fetchColors(editingId);
      } else {
        setColorError(language === 'uz' ? 'Rangni o\'chirib bo\'lmadi.' : 'Не удалось удалить цвет.');
      }
    } catch (err) {
      setColorError('Server connection error.');
    }
  };

  // Rangga rasm yuklash: avval /api/upload ga fayl, keyin qaytgan
  // manzilni rangga bog'laymiz
  const handleColorImageUpload = async (colorId, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setColorError('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setColorError(language === 'uz'
        ? 'Faqat JPG, PNG yoki WEBP formatidagi rasmlarni yuklash mumkin.'
        : 'Можно загружать только изображения в формате JPG, PNG или WEBP.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setColorError(language === 'uz'
        ? 'Rasm hajmi 5 MB dan oshmasligi kerak.'
        : 'Размер изображения не должен превышать 5 МБ.');
      e.target.value = '';
      return;
    }

    setColorImageUploadingId(colorId);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (uploadRes.status === 401 || uploadRes.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (!uploadRes.ok) {
        setColorError(language === 'uz' ? 'Rasmni yuklab bo\'lmadi.' : 'Не удалось загрузить изображение.');
        return;
      }

      const { url } = await uploadRes.json();

      const linkRes = await fetch(`${backendUrl}/colors/${colorId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url }),
        credentials: 'include'
      });

      if (linkRes.ok) {
        fetchColors(editingId);
      } else {
        setColorError(language === 'uz' ? 'Rasmni rangga bog\'lab bo\'lmadi.' : 'Не удалось привязать изображение к цвету.');
      }
    } catch (err) {
      setColorError('Server connection error.');
    } finally {
      setColorImageUploadingId(null);
      e.target.value = '';
    }
  };

  const handleDeleteColorImage = async (imageId) => {
    setColorError('');
    try {
      const res = await fetch(`${backendUrl}/colors/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }

      if (res.ok) {
        fetchColors(editingId);
      } else {
        setColorError(language === 'uz' ? 'Rasmni o\'chirib bo\'lmadi.' : 'Не удалось удалить изображение.');
      }
    } catch (err) {
      setColorError('Server connection error.');
    }
  };

  // 7. Load Product into Form for Edit
  const handleEditProduct = (prod) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setUploadError('');
    setColorError('');
    setColorForm({ name_uz: '', name_ru: '', hex_code: '#1E5AA8' });
    fetchColors(prod.id);
    setProductForm({
      name_uz: prod.name_uz || '',
      name_ru: prod.name_ru || '',
      desc_uz: prod.desc_uz || '',
      desc_ru: prod.desc_ru || '',
      price: prod.price || '',
      old_price: prod.old_price || '',
      category: prod.category || 'parta-stullar',
      image_url: prod.image_url || '',
      video_url: prod.video_url || ''
    });
  };

  const resetProductForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setUploadError('');
    setColorError('');
    setColors([]);
    setColorForm({ name_uz: '', name_ru: '', hex_code: '#1E5AA8' });
    setProductForm({
      name_uz: '',
      name_ru: '',
      desc_uz: '',
      desc_ru: '',
      price: '',
      old_price: '',
      category: 'parta-stullar',
      image_url: '',
      video_url: ''
    });
  };

  // Katalog va Arxiv ro'yxatlari.
  // Arxivlangan mahsulot asosiy katalogda ko'rinmaydi, faqat "Arxiv"da.
  const activeProducts = products.filter(p => !p.is_archived);
  const archivedProducts = products.filter(p => p.is_archived);

  if (authLoading) {
    return (
      <div className="container admin-loading">
        <p>{language === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}</p>
      </div>
    );
  }

  // A. RENDER LOGIN GATE IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <main className="section admin-login-page">
        <div className="container">
          <div className="login-card">
            <h1 className="login-title">{t('admin.loginTitle')}</h1>
            {loginError && <div className="error-banner">{loginError}</div>}
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="user-input" className="form-label">{t('admin.username')}</label>
                <input
                  type="text"
                  id="user-input"
                  required
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="admin"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="pass-input" className="form-label">{t('admin.password')}</label>
                <input
                  type="password"
                  id="pass-input"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary w-full login-btn">
                {t('admin.loginBtn')}
              </button>
            </form>
          </div>
        </div>
        <style jsx>{`
          .admin-login-page {
            min-height: 70vh;
            display: flex;
            align-items: center;
          }
          .login-card {
            background-color: var(--white-surface);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 40px 32px;
            max-width: 440px;
            margin: 0 auto;
          }
          .login-title {
            font-size: 24px;
            color: var(--primary-dark);
            margin-bottom: 24px;
            text-align: center;
            text-transform: none;
            letter-spacing: 0;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .error-banner {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ffcdd2;
            padding: 12px;
            border-radius: 3px;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-label {
            font-size: 14px;
            font-weight: 500;
          }
          .form-input {
            border: 1px solid var(--border-color);
            background-color: var(--white-surface);
            border-radius: 3px;
            height: 44px;
            padding: 0 16px;
            font-size: 14px;
            outline: none;
          }
          .form-input:focus {
            border-color: var(--cta-orange);
          }
          .w-full { width: 100%; }
        `}</style>
      </main>
    );
  }

  // B. RENDER AUTHENTICATED DASHBOARD CONTENT
  return (
    <main className="section admin-dashboard-page">
      <div className="container">
        {/* Dashboard Header Banner */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('admin.title')}</h1>
            <p className="welcome-text">
              {language === 'uz' ? 'Xush kelibsiz, Admin!' : 'Добро пожаловать, Админ!'}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-secondary logout-btn">
            {t('admin.logoutBtn')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            {language === 'uz' ? 'Mahsulotlar Katalogi' : 'Каталог товаров'}
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            {t('admin.ordersTitle')} ({orders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => setActiveTab('archive')}
          >
            {language === 'uz' ? 'Arxiv' : 'Архив'} ({archivedProducts.length})
          </button>
        </div>

        {crudError && <div className="error-banner">{crudError}</div>}
        {crudSuccess && <div className="success-banner">{crudSuccess}</div>}

        {/* TAB 1: PRODUCT CATALOG & CRUD */}
        {activeTab === 'products' && (
          <div className="dashboard-layout">
            {/* Left: Product Form (Add/Edit) */}
            <div className="product-form-panel">
              <h2 className="panel-title">
                {isEditing ? t('admin.editProduct') : t('admin.addProduct')}
              </h2>
              <form onSubmit={handleProductSubmit} className="dashboard-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="name-uz-input">{t('admin.productNameUz')} *</label>
                    <input
                      type="text"
                      id="name-uz-input"
                      name="name_uz"
                      required
                      value={productForm.name_uz}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name-ru-input">{t('admin.productNameRu')} *</label>
                    <input
                      type="text"
                      id="name-ru-input"
                      name="name_ru"
                      required
                      value={productForm.name_ru}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="desc-uz-input">{t('admin.productDescUz')}</label>
                  <textarea
                    id="desc-uz-input"
                    name="desc_uz"
                    value={productForm.desc_uz}
                    onChange={handleFormChange}
                    className="form-input form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="desc-ru-input">{t('admin.productDescRu')}</label>
                  <textarea
                    id="desc-ru-input"
                    name="desc_ru"
                    value={productForm.desc_ru}
                    onChange={handleFormChange}
                    className="form-input form-textarea"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="price-input">{t('admin.productPrice')} *</label>
                    <input
                      type="number"
                      id="price-input"
                      name="price"
                      required
                      value={productForm.price}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="old-price-input">{language === 'uz' ? 'Eski narx' : 'Старая цена'}</label>
                    <input
                      type="number"
                      id="old-price-input"
                      name="old_price"
                      value={productForm.old_price}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="cat-select">{t('admin.category')}</label>
                    <select
                      id="cat-select"
                      name="category"
                      value={productForm.category}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      <option value="parta-stullar">{t('categories.parta-stullar')}</option>
                      <option value="bolalar-o-yingohlari">{t('categories.bolalar-o-yingohlari')}</option>
                      <option value="kompyuter-ish-stollari">{t('categories.kompyuter-ish-stollari')}</option>
                      <option value="ofis-kreslolari">{t('categories.ofis-kreslolari')}</option>
                      <option value="game-kreslolari">{t('categories.game-kreslolari')}</option>
                      <option value="bar-stullari">{t('categories.bar-stullari')}</option>
                      <option value="boshqa-stul-kreslolar">{t('categories.boshqa-stul-kreslolar')}</option>
                      <option value="yugurish-yo-laklari">{t('categories.yugurish-yo-laklari')}</option>
                      <option value="velo-trenajyorlar">{t('categories.velo-trenajyorlar')}</option>
                      <option value="tebratma-kursilar">{t('categories.tebratma-kursilar')}</option>
                      <option value="kitob-javonlari">{t('categories.kitob-javonlari')}</option>
                      <option value="kemping-uchun">{t('categories.kemping-uchun')}</option>
                      <option value="stollar">{t('categories.stollar')}</option>
                    </select>
                  </div>
                </div>

                {/* ===== RASM YUKLASH (fayl tanlash) ===== */}
                <div className="form-group">
                  <label htmlFor="img-input">{t('admin.image')}</label>

                  <input
                    type="file"
                    id="img-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="file-input"
                  />

                  {uploading && (
                    <p className="upload-status">
                      {language === 'uz' ? 'Rasm yuklanmoqda...' : 'Изображение загружается...'}
                    </p>
                  )}

                  {uploadError && <p className="upload-error">{uploadError}</p>}

                  {productForm.image_url && !uploading && (
                    <div className="image-preview-row">
                      <img
                        src={getImageSrc(productForm.image_url)}
                        alt=""
                        className="image-preview"
                      />
                      <div className="image-preview-info">
                        <span className="image-path">{productForm.image_url}</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="remove-image-btn"
                        >
                          {language === 'uz' ? 'Rasmni olib tashlash' : 'Удалить изображение'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* ===== RASM YUKLASH TUGADI ===== */}

                <div className="form-group">
                  <label htmlFor="video-input">{language === 'uz' ? 'Video havolasi (YouTube)' : 'Ссылка на видео (YouTube)'}</label>
                  <input
                    type="text"
                    id="video-input"
                    name="video_url"
                    value={productForm.video_url}
                    onChange={handleFormChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-input"
                  />
                </div>

                <div className="form-actions-row">
                  <button type="submit" className="btn-primary flex-grow" disabled={uploading}>
                    {t('admin.saveBtn')}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetProductForm} className="btn-secondary">
                      {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                    </button>
                  )}
                </div>
              </form>

              {/* ===== RANG VARIANTLARI ===== */}
              <div className="colors-section">
                <h3 className="colors-title">
                  {language === 'uz' ? 'Rang variantlari' : 'Цветовые варианты'}
                </h3>

                {!isEditing ? (
                  <p className="colors-hint">
                    {language === 'uz'
                      ? 'Ranglar qo\'shish uchun avval mahsulotni saqlang, so\'ng uni ro\'yxatdan "Tahrirlash" tugmasi bilan oching.'
                      : 'Чтобы добавить цвета, сначала сохраните товар, затем откройте его кнопкой «Редактировать» из списка.'}
                  </p>
                ) : (
                  <>
                    <p className="colors-hint">
                      {language === 'uz'
                        ? 'Ranglar ixtiyoriy. Rang qo\'shmasangiz, mahsulot avvalgidek ishlaydi.'
                        : 'Цвета необязательны. Без них товар работает как обычно.'}
                    </p>

                    {colorError && <div className="error-banner">{colorError}</div>}

                    {/* Mavjud ranglar */}
                    {colors.map(color => (
                      <div className="color-card" key={color.id}>
                        <div className="color-card-head">
                          <span
                            className="color-dot"
                            style={{ backgroundColor: color.hex_code }}
                            title={color.hex_code}
                          />
                          <span className="color-name">
                            {color.name_uz} / {color.name_ru}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteColor(color.id)}
                            className="action-link delete-link"
                          >
                            {language === 'uz' ? 'O\'chirish' : 'Удалить'}
                          </button>
                        </div>

                        {/* Shu rangning rasmlari */}
                        <div className="color-images-row">
                          {color.images.map(img => (
                            <div className="color-image-item" key={img.id}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getImageSrc(img.image_url)}
                                alt=""
                                className="color-image-thumb"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteColorImage(img.id)}
                                className="color-image-remove"
                                aria-label={language === 'uz' ? 'Rasmni o\'chirish' : 'Удалить изображение'}
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {color.images.length === 0 && (
                            <span className="colors-hint">
                              {language === 'uz' ? 'Bu rangda hali rasm yo\'q' : 'У этого цвета пока нет изображений'}
                            </span>
                          )}
                        </div>

                        <label className="btn-secondary color-upload-btn">
                          {colorImageUploadingId === color.id
                            ? (language === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...')
                            : (language === 'uz' ? '+ Rasm qo\'shish' : '+ Добавить фото')}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleColorImageUpload(color.id, e)}
                            disabled={colorImageUploadingId !== null}
                            hidden
                          />
                        </label>
                      </div>
                    ))}

                    {/* Yangi rang qo'shish */}
                    <div className="color-add-row">
                      <input
                        type="text"
                        name="name_uz"
                        value={colorForm.name_uz}
                        onChange={handleColorFormChange}
                        placeholder={language === 'uz' ? 'Rang nomi (uz)' : 'Название (uz)'}
                        className="form-input"
                      />
                      <input
                        type="text"
                        name="name_ru"
                        value={colorForm.name_ru}
                        onChange={handleColorFormChange}
                        placeholder={language === 'uz' ? 'Rang nomi (ru)' : 'Название (ru)'}
                        className="form-input"
                      />
                      <input
                        type="color"
                        name="hex_code"
                        value={colorForm.hex_code}
                        onChange={handleColorFormChange}
                        className="color-picker"
                        title={language === 'uz' ? 'Rangni tanlang' : 'Выберите цвет'}
                      />
                      <button type="button" onClick={handleAddColor} className="btn-secondary">
                        {language === 'uz' ? 'Qo\'shish' : 'Добавить'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* ===== RANG VARIANTLARI TUGADI ===== */}
            </div>

            {/* Right: Products List */}
            <div className="products-list-panel">
              <h2 className="panel-title">{language === 'uz' ? 'Mahsulotlar Ro\'yxati' : 'Список товаров'}</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{language === 'uz' ? 'Rasm' : 'Фото'}</th>
                      <th>{language === 'uz' ? 'Nomi' : 'Название'}</th>
                      <th>{t('admin.productPrice')}</th>
                      <th>{language === 'uz' ? 'Holati' : 'Статус'}</th>
                      <th>{t('admin.actionColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProducts.map(prod => {
                      const name = language === 'uz' ? prod.name_uz : prod.name_ru;
                      return (
                        <tr key={prod.id} className={prod.is_hidden ? 'row-hidden' : ''}>
                          <td>{prod.id}</td>
                          <td>
                            {prod.image_url ? (
                              <img
                                src={getImageSrc(prod.image_url)}
                                alt=""
                                className="table-thumb"
                              />
                            ) : (
                              <span className="text-secondary">—</span>
                            )}
                          </td>
                          <td className="font-medium">{name}</td>
                          <td>{parseFloat(prod.price).toLocaleString()} {t('products.priceCurrency')}</td>
                          <td>
                            {prod.is_hidden ? (
                              <span className="status-badge status-hidden">
                                {language === 'uz' ? 'Yashirilgan' : 'Скрыт'}
                              </span>
                            ) : (
                              <span className="status-badge status-visible">
                                {language === 'uz' ? 'Saytda' : 'На сайте'}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="action-link edit-link"
                              >
                                {t('admin.editProduct')}
                              </button>
                              <button
                                onClick={() => handleStatusChange(
                                  prod.id,
                                  { is_hidden: !prod.is_hidden },
                                  prod.is_hidden
                                    ? (language === 'uz' ? 'Mahsulot saytda ko\'rinadigan bo\'ldi.' : 'Товар снова виден на сайте.')
                                    : (language === 'uz' ? 'Mahsulot saytdan yashirildi.' : 'Товар скрыт с сайта.')
                                )}
                                className="action-link hide-link"
                              >
                                {prod.is_hidden
                                  ? (language === 'uz' ? 'Ko\'rsatish' : 'Показать')
                                  : (language === 'uz' ? 'Yashirish' : 'Скрыть')}
                              </button>
                              <button
                                onClick={() => handleStatusChange(
                                  prod.id,
                                  { is_archived: true },
                                  language === 'uz' ? 'Mahsulot arxivga o\'tkazildi.' : 'Товар перемещен в архив.'
                                )}
                                className="action-link archive-link"
                              >
                                {language === 'uz' ? 'Arxivlash' : 'В архив'}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="action-link delete-link"
                              >
                                {t('admin.deleteProduct')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ARXIV */}
        {activeTab === 'archive' && (
          <div className="orders-panel">
            <h2 className="panel-title">
              {language === 'uz' ? 'Arxivlangan mahsulotlar' : 'Архивированные товары'}
            </h2>
            <p className="archive-hint">
              {language === 'uz'
                ? 'Bu mahsulotlar saytda ko\'rinmaydi. Istalgan payt katalogga qaytarishingiz mumkin.'
                : 'Эти товары не видны на сайте. Вы можете вернуть их в каталог в любой момент.'}
            </p>

            {archivedProducts.length === 0 ? (
              <p className="text-secondary">
                {language === 'uz' ? 'Arxiv bo\'sh.' : 'Архив пуст.'}
              </p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{language === 'uz' ? 'Rasm' : 'Фото'}</th>
                      <th>{language === 'uz' ? 'Nomi' : 'Название'}</th>
                      <th>{t('admin.productPrice')}</th>
                      <th>{t('admin.actionColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedProducts.map(prod => {
                      const name = language === 'uz' ? prod.name_uz : prod.name_ru;
                      return (
                        <tr key={prod.id}>
                          <td>{prod.id}</td>
                          <td>
                            {prod.image_url ? (
                              <img
                                src={getImageSrc(prod.image_url)}
                                alt=""
                                className="table-thumb"
                              />
                            ) : (
                              <span className="text-secondary">—</span>
                            )}
                          </td>
                          <td className="font-medium">{name}</td>
                          <td>{parseFloat(prod.price).toLocaleString()} {t('products.priceCurrency')}</td>
                          <td>
                            <div className="actions-cell">
                              <button
                                onClick={() => handleStatusChange(
                                  prod.id,
                                  { is_archived: false },
                                  language === 'uz' ? 'Mahsulot katalogga qaytarildi.' : 'Товар возвращен в каталог.'
                                )}
                                className="action-link edit-link"
                              >
                                {language === 'uz' ? 'Katalogga qaytarish' : 'Вернуть в каталог'}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="action-link delete-link"
                              >
                                {t('admin.deleteProduct')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="orders-panel">
            <h2 className="panel-title">{t('admin.ordersTitle')}</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('admin.customer')}</th>
                    <th>{t('admin.phone')}</th>
                    <th>{t('admin.address')}</th>
                    <th>{language === 'uz' ? 'Mahsulotlar' : 'Товары'}</th>
                    <th>{t('admin.totalPrice')}</th>
                    <th>{t('admin.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td className="font-medium">{order.customer_name}</td>
                      <td>{order.phone_number}</td>
                      <td>{order.delivery_address}</td>
                      <td>
                        <ul className="order-items-bullet">
                          {order.items && order.items.map((it, idx) => {
                            const name = language === 'uz' ? it.name_uz : it.name_ru;
                            return (
                              <li key={idx}>
                                {name} - <strong>{it.quantity}x</strong>
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td className="font-semibold text-orange">
                        {parseFloat(order.total_price).toLocaleString()} {t('products.priceCurrency')}
                      </td>
                      <td className="text-secondary">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard-page {
          background-color: var(--main-bg);
          min-height: 80vh;
        }

        .admin-loading {
          text-align: center;
          padding: 100px 0;
          color: var(--secondary-text);
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-size: 28px;
          margin-bottom: 4px;
          color: var(--primary-dark);
          text-transform: none;
          letter-spacing: 0;
        }

        .welcome-text {
          font-size: 14px;
          color: var(--secondary-text);
        }

        .logout-btn {
          height: 38px;
        }

        /* Tabs Nav */
        .tabs-nav {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          gap: 24px;
          margin-bottom: 32px;
        }

        .tab-btn {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 500;
          color: var(--secondary-text);
          padding: 12px 4px;
          position: relative;
          transition: color 200ms ease;
        }

        .tab-btn:hover {
          color: var(--primary-dark);
        }

        .tab-btn.active {
          color: var(--cta-orange);
          font-weight: 600;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--cta-orange);
        }

        /* Panels layout */
        .dashboard-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (min-width: 1024px) {
          .dashboard-layout {
            grid-template-columns: 1.1fr 1.9fr;
          }
        }

        .panel-title {
          font-size: 18px;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-color);
        }

        /* Forms in Dashboard */
        .dashboard-form {
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .form-group-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--primary-dark);
        }

        .form-input {
          border: 1px solid var(--border-color);
          background-color: var(--white-surface);
          border-radius: 3px;
          height: 40px;
          padding: 0 12px;
          font-size: 13px;
          outline: none;
        }

        .form-textarea {
          height: 70px;
          padding: 8px 12px;
          resize: vertical;
        }

        /* Rasm yuklash bloki */
        .file-input {
          border: 1px dashed var(--border-color);
          background-color: var(--card-bg);
          border-radius: 3px;
          padding: 10px 12px;
          font-size: 13px;
          width: 100%;
          cursor: pointer;
          outline: none;
        }

        .file-input:hover:not(:disabled) {
          border-color: var(--cta-orange);
        }

        .file-input:focus-visible {
          border-color: var(--cta-orange);
          outline: 2px solid var(--cta-orange);
          outline-offset: 2px;
        }

        .file-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-status {
          font-size: 12px;
          color: var(--cta-orange);
          margin-top: 2px;
        }

        .upload-error {
          font-size: 12px;
          color: #c62828;
          margin-top: 2px;
        }

        .image-preview-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          background-color: var(--card-bg);
        }

        .image-preview {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          background-color: var(--white-surface);
          flex-shrink: 0;
        }

        .image-preview-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .image-path {
          font-size: 11px;
          color: var(--secondary-text);
          word-break: break-all;
        }

        .remove-image-btn {
          font-size: 12px;
          font-weight: 600;
          color: #c62828;
          text-decoration: underline;
          text-align: left;
        }

        .remove-image-btn:hover {
          color: #b71c1c;
        }

        .table-thumb {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          background-color: var(--card-bg);
          display: block;
        }

        .form-actions-row {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .flex-grow {
          flex-grow: 1;
        }

        /* Tables */
        .table-responsive {
          overflow-x: auto;
          width: 100%;
          background-color: var(--white-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .admin-table th, .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .admin-table th {
          background-color: var(--card-bg);
          font-family: var(--font-body);
          font-weight: 600;
          color: var(--primary-dark);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .admin-table tr:last-child td {
          border-bottom: none;
        }

        .font-medium {
          font-weight: 500;
        }

        .font-semibold {
          font-weight: 600;
        }

        .text-orange {
          color: var(--cta-orange);
        }

        .text-secondary {
          color: var(--secondary-text);
          font-size: 12px;
        }

        .actions-cell {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .action-link {
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
        }

        .edit-link {
          color: var(--primary-dark);
        }

        .edit-link:hover {
          color: var(--cta-orange);
        }

        .delete-link {
          color: #c62828;
        }

        .delete-link:hover {
          color: #b71c1c;
        }

        .hide-link,
        .archive-link {
          color: var(--secondary-text);
        }

        .hide-link:hover,
        .archive-link:hover {
          color: var(--primary-dark);
        }

        /* Yashirilgan mahsulot qatori xiraroq ko'rinadi */
        .row-hidden {
          opacity: 0.55;
        }

        .status-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 3px;
          white-space: nowrap;
        }

        .status-visible {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-hidden {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        .archive-hint {
          font-size: 13px;
          color: var(--secondary-text);
          margin-bottom: 16px;
        }

        /* ===== Rang variantlari ===== */
        .colors-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }

        .colors-title {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .colors-hint {
          font-size: 12px;
          color: var(--secondary-text);
          margin: 0 0 16px;
        }

        .color-card {
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .color-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .color-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .color-name {
          font-size: 13px;
          font-weight: 600;
          flex-grow: 1;
        }

        .color-images-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        .color-image-item {
          position: relative;
        }

        .color-image-thumb {
          width: 56px;
          height: 56px;
          object-fit: cover;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          display: block;
        }

        .color-image-remove {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #c62828;
          color: #fff;
          font-size: 14px;
          line-height: 1;
          border: none;
          cursor: pointer;
        }

        .color-upload-btn {
          display: inline-block;
          font-size: 12px;
          padding: 6px 12px;
          cursor: pointer;
        }

        .color-add-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-top: 16px;
        }

        .color-add-row .form-input {
          flex: 1 1 120px;
          min-width: 0;
        }

        .color-picker {
          width: 44px;
          height: 38px;
          padding: 2px;
          border: 1px solid var(--border-color);
          border-radius: 3px;
          background: none;
          cursor: pointer;
          flex-shrink: 0;
        }

        .order-items-bullet {
          padding-left: 16px;
          font-size: 13px;
        }

        .error-banner {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
          padding: 12px;
          border-radius: 3px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .success-banner {
          background-color: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
          padding: 12px;
          border-radius: 3px;
          font-size: 14px;
          margin-bottom: 24px;
        }
      `}</style>
    </main>
  );
}
