import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom'; // <-- Link'i IMPORT 
import { useAuth } from './context/AuthContext.jsx';

function App() {

  const { user, logout, cart } = useAuth(); // <-- Hafızadan durumu ve 'logout'u al
  const navigate = useNavigate();

  // Çıkış yap butonuna basılınca...
  const handleLogout = () => {
    logout(); // Hafızayı temizle
    navigate('/login'); // Login sayfasına yönlendir
  };

  const isCustomer = user && user.roles.includes('ROLE_CUSTOMER');
  const isRestaurant = user && user.roles.includes('ROLE_RESTAURANT');
  const isAdmin = user && user.roles.includes('ROLE_ADMIN');

 return (
    // Ana Kapsayıcı: Minimum ekran yüksekliği ve varsayılan font/renkler
    // `min-h-screen` ve `bg-gray-50` tüm arkaplanı kaplamalı
    <div className="min-h-screen w-full bg-gray-50">
        
        {/* --- NAVBAR (Sabit Üst Menü) --- */}
        <nav className="bg-white shadow-md h-16 px-4 md:px-8 flex justify-between items-center fixed top-0 left-0 w-full z-50">
            
            {/* SOL: Logo */}
            <div className="flex items-center">
                <Link to="/" className="text-2xl font-extrabold text-red-600 tracking-tight hover:opacity-80 transition">
                    İYTE YEMEK <span className="text-gray-800 hidden md:inline">| En Hızlı Lezzet</span>
                </Link>
            </div>

            {/* SAĞ: Linkler */}
            <div className="flex items-center space-x-6 font-medium text-sm md:text-base">
                
                {!user ? (
                    // GİRİŞ YAPMAMIŞ
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-red-600 transition">Giriş Yap</Link>
                        <Link to="/register-customer" className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition shadow-sm">Kayıt Ol</Link>
                    </>
                ) : (
                    // GİRİŞ YAPMIŞ
                    <>
                        {user.roles.includes('ROLE_CUSTOMER') && (
                            <>
                                <Link to="/my-orders" className="text-gray-600 hover:text-red-600">Siparişlerim</Link>
                                <Link to="/my-addresses" className="text-gray-600 hover:text-red-600">Adreslerim</Link> {/* Adres linkini eklemiştim */}
                                <Link to="/cart" className="relative text-gray-600 hover:text-red-600">
                                    Sepetim
                                    {cart && cart.totalItemCount > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                            {cart.totalItemCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {user.roles.includes('ROLE_RESTAURANT') && (
                            <>
                                <Link to="/restaurant-panel" className="text-gray-600 hover:text-blue-600">Panelim</Link>
                                <Link to="/restaurant-orders" className="text-gray-600 hover:text-blue-600">Siparişler</Link>
                            </>
                        )}

                        {user.roles.includes('ROLE_ADMIN') && (
                            <>
                                <Link to="/admin-panel" className="text-gray-600 hover:text-purple-600">Restoran Onay</Link>
                                <Link to="/admin-users" className="text-gray-600 hover:text-purple-600">Kullanıcılar</Link>
                            </>
                        )}
                        
                        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 border-l pl-4 md:pl-6 ml-2">
                            Çıkış
                        </button>
                    </>
                )}
            </div>
        </nav>

        {/* --- MAIN CONTENT (İÇERİK) --- */}
        {/* SADECE NAVBAR YÜKSEKLİĞİ KADAR BOŞLUK BIRAK, BAŞKA HİÇBİR ŞEY EKLEME */}
        <main className="pt-16"> 
            <Outlet /> 
        </main>
    </div>
  );
}

export default App;