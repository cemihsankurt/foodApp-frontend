import { AuthProvider } from './context/AuthContext.jsx';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


import {
  createBrowserRouter, // Tarayıcı router'ını oluşturan fonksiyon
  RouterProvider,     // O router'ı uygulamaya sağlayan bileşen
} from 'react-router-dom';

import App from './App.jsx'; // Bizim ana "layout" (çerçeve) dosyamız
import HomePage from './pages/HomePage.jsx'; // Ana sayfamız
import LoginPage from './pages/LoginPage.jsx'; // Login sayfamız
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import RegisterCustomerPage from './pages/RegisterCustomerPage.jsx';
import RegisterRestaurantPage from './pages/RegisterRestaurantPage.jsx';
import RestaurantMenuPage from './pages/RestaurantMenuPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AddressPage from './pages/AddressPage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx'; // <-- YENİ SAYFAYI İMPORT ET
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import RestaurantPanelPage from './pages/RestaurantPanelPage.jsx';
import RestaurantOrdersPage from './pages/RestaurantOrdersPage.jsx';
import RestaurantOrderDetailPage from './pages/RestaurantOrderDetailPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // <-- YENİ SAYFAYI İMPORT ET
import AdminRoute from './auth/AdminRoute.jsx'; // <-- YENİ GÖREVLİYİ İMPORT ET
import UserManagementPage from './pages/UserManagementPage.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

// (CSS importları da burada kalabilir, örn: import './index.css')

// --- YOL HARİTASI ---

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker başarıyla kaydedildi (Scope):', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker kaydedilemedi:', error);
      });
  });
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Ana çerçeve
    errorElement: <ErrorPage />,
    children: [ 
      {
        path: '/', 
        element: <HomePage />, // <-- ARTIK KORUMALI DEĞİL. HERKESE AÇIK!
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register-customer',
        element: <RegisterCustomerPage />,
      },
      {
        path: '/restaurants/:restaurantId',
        element: <RestaurantMenuPage />,
      },
      {
        path: '/cart', // '/cart' adresine gidilince
        element: (
          <ProtectedRoute> {/* Önce Güvenlik Görevlisine sor */}
            <CartPage /> {/* Token varsa, Sepet Sayfasını göster */}
          </ProtectedRoute>
        )
      },
      {
        path: '/my-addresses', // '/my-addresses' adresine gidilince
        element: (
          <ProtectedRoute> {/* Güvenlik Görevlisine sor */}
            <AddressPage /> {/* Token varsa, Adres Sayfasını göster */}
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-orders', // '/my-orders' adresine gidilince
        element: (
          <ProtectedRoute> {/* Güvenlik Görevlisine sor */}
            <MyOrdersPage /> {/* Token varsa, Siparişlerim Sayfasını göster */}
          </ProtectedRoute>
        ),
      },
      {
            path: '/orders/:orderId', // '/orders/123' gibi
            element: (
                <ProtectedRoute>
                    <OrderDetailPage />
                </ProtectedRoute>
            )
        },
        {
        path: '/restaurant-panel',
        element: (
          <ProtectedRoute>
            <RestaurantPanelPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/restaurant-orders',
        element: (
          <ProtectedRoute>
            <RestaurantOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/restaurant-panel/orders/:orderId', // '/restaurant-panel/orders/3'
        element: (
          <ProtectedRoute> {/* Güvenlik Görevlisine sor */}
            <RestaurantOrderDetailPage /> {/* Sipariş Yönetim Sayfasını göster */}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin', // '/admin-panel' adresine gidilince
        element: (
          <AdminRoute> {/* Önce YENİ Güvenlik Görevlisine sor */}
            <AdminDashboard /> {/* Rolü Admin ise, Admin Sayfasını göster */}
          </AdminRoute>
        ),
      },
      {
        path: '/admin-users',
        element: (
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: '/register-restaurant',
        element:(
          <AdminRoute>
            <RegisterRestaurantPage />
          </AdminRoute>
          
        ), 
      },
    ],
  },
]);
// --- YOL HARİTASI BİTTİ ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Artık <App />'ı değil, 'router'ı render ediyoruz */}
    <AuthProvider>
      <RouterProvider router={router} /> 
    </AuthProvider>
  </React.StrictMode>
);