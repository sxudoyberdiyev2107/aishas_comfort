'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

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

  // Product Form States
  const [productForm, setProductForm] = useState({
    name_uz: '',
    name_ru: '',
    desc_uz: '',
    desc_ru: '',
    price: '',
    old_price: '',
    stock: '',
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
      const prodRes = await fetch(`${backendUrl}/products`);
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
          old_price: productForm.old_price ? parseFloat(productForm.old_price) : null,
          stock: parseInt(productForm.stock)
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

  // 7. Load Product into Form for Edit
  const handleEditProduct = (prod) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setProductForm({
      name_uz: prod.name_uz || '',
      name_ru: prod.name_ru || '',
      desc_uz: prod.desc_uz || '',
      desc_ru: prod.desc_ru || '',
      price: prod.price || '',
      old_price: prod.old_price || '',
      stock: prod.stock || '',
      category: prod.category || 'parta-stullar',
      image_url: prod.image_url || '',
      video_url: prod.video_url || ''
    });
  };

  const resetProductForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setProductForm({
      name_uz: '',
      name_ru: '',
      desc_uz: '',
      desc_ru: '',
      price: '',
      old_price: '',
      stock: '',
      category: 'parta-stullar',
      image_url: '',
      video_url: ''
    });
  };

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
                    <label htmlFor="stock-input">{t('admin.productStock')} *</label>
                    <input
                      type="number"
                      id="stock-input"
                      name="stock"
                      required
                      value={productForm.stock}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
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

                <div className="form-group">
                  <label htmlFor="img-input">{t('admin.image')}</label>
                  <input
                    type="text"
                    id="img-input"
                    name="image_url"
                    value={productForm.image_url}
                    onChange={handleFormChange}
                    placeholder="/prod_bedding.jpg"
                    className="form-input"
                  />
                </div>

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
                  <button type="submit" className="btn-primary flex-grow">
                    {t('admin.saveBtn')}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetProductForm} className="btn-secondary">
                      {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Products List */}
            <div className="products-list-panel">
              <h2 className="panel-title">{language === 'uz' ? 'Mahsulotlar Ro\'yxati' : 'Список товаров'}</h2>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{language === 'uz' ? 'Nomi' : 'Название'}</th>
                      <th>{t('admin.productPrice')}</th>
                      <th>{t('admin.productStock')}</th>
                      <th>{t('admin.actionColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => {
                      const name = language === 'uz' ? prod.name_uz : prod.name_ru;
                      return (
                        <tr key={prod.id}>
                          <td>{prod.id}</td>
                          <td className="font-medium">{name}</td>
                          <td>{parseFloat(prod.price).toLocaleString()} {t('products.priceCurrency')}</td>
                          <td>{prod.stock}</td>
                          <td>
                            <div className="actions-cell">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="action-link edit-link"
                              >
                                {t('admin.editProduct')}
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
