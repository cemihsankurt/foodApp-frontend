import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout, cart } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';
    
    // Mobil menü açık mı kapalı mı?
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    // Menü linkine tıklayınca mobil menüyü kapatmak için yardımcı fonksiyon
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    
                    {/* --- 1. LOGO --- */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-extrabold text-red-600 tracking-tight hover:opacity-80 transition" onClick={closeMenu}>
                            İYTE YEMEK <span className="text-gray-800 hidden md:inline text-lg ml-2 font-normal">| En Hızlı Lezzet</span>
                        </Link>
                    </div>

                    {/* --- 2. DESKTOP MENÜ (Sadece Bilgisayarda Görünür) --- */}
                    <div className="hidden md:flex items-center space-x-6 font-medium">
                        {!user ? (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-red-600 transition">Giriş Yap</Link>
                                <Link to="/register-customer" className="bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700 transition shadow-sm font-bold">Kayıt Ol</Link>
                            </>
                        ) : (
                            <>
                                {/* MÜŞTERİ LİNKLERİ */}
                                {user.roles.includes('ROLE_CUSTOMER') && (
                                    <>
                                        <Link to="/my-orders" className="text-gray-600 hover:text-red-600 transition">📦 Siparişlerim</Link>
                                        <Link to="/my-addresses" className="text-gray-600 hover:text-red-600 transition">📍 Adreslerim</Link>
                                        
                                        {/* Sepet Butonu */}
                                        <Link to="/cart" className="relative text-gray-600 hover:text-red-600 transition flex items-center">
                                            🛒 Sepetim
                                            {cart && cart.totalItemCount > 0 && (
                                                <span className="ml-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {cart.totalItemCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                {/* RESTORAN LİNKLERİ */}
                                {user.roles.includes('ROLE_RESTAURANT') && (
                                    <>
                                        <Link to="/restaurant-panel" className="text-gray-600 hover:text-blue-600">📊 Panelim</Link>
                                        <Link to="/restaurant-orders" className="text-gray-600 hover:text-blue-600">📋 Siparişler</Link>
                                    </>
                                )}

                                {/* ADMIN LİNKLERİ */}
                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="text-gray-600 hover:text-purple-600">📋 Restoran Onayları</Link>
                                        <Link to="/register-restaurant" className="text-gray-600 hover:text-purple-600">➕ Yeni Restoran Ekle</Link>
                                        <Link to="/admin-users" className="text-gray-600 hover:text-purple-600">👥 Kullanıcılar</Link>
            

                                    </>
                                )}

                                {/* ÇIKIŞ BUTONU */}
                                <button 
                                    onClick={handleLogout} 
                                    className="text-gray-500 hover:text-red-600 border-l-2 border-gray-200 pl-4 ml-2 font-medium transition"
                                >
                                    Çıkış
                                </button>
                            </>
                        )}
                    </div>

                    {/* --- 3. MOBİL MENÜ BUTONU (Sadece Telefonda Görünür) --- */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-red-600 focus:outline-none p-2"
                        >
                            <span className="sr-only">Menüyü Aç</span>
                            {isMobileMenuOpen ? (
                                // Çarpı İkonu (Kapat)
                                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                // Hamburger İkonu (Aç)
                                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 4. MOBİL MENÜ İÇERİĞİ (Aşağı Açılan Kısım) --- */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-16">
                    <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
                        {!user ? (
                            <>
                                <Link to="/login" onClick={closeMenu} className="block text-center text-gray-600 hover:text-red-600 font-medium py-2 border border-gray-200 rounded-lg">Giriş Yap</Link>
                                <Link to="/register-customer" onClick={closeMenu} className="block text-center bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700">Kayıt Ol</Link>
                            </>
                        ) : (
                            <>
                                {/* ORTAK */}
                                <Link to="/" onClick={closeMenu} className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50">Ana Sayfa</Link>

                                {/* MÜŞTERİ */}
                                {user.roles.includes('ROLE_CUSTOMER') && (
                                    <>
                                        <Link to="/cart" onClick={closeMenu} className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50 flex justify-between">
                                            🛒 Sepetim
                                            {cart && cart.totalItemCount > 0 && <span className="bg-red-600 text-white px-2 rounded-full text-xs flex items-center">{cart.totalItemCount}</span>}
                                        </Link>
                                        <Link to="/my-orders" onClick={closeMenu} className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50">📦 Siparişlerim</Link>
                                        <Link to="/my-addresses" onClick={closeMenu} className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50">📍 Adreslerim</Link>
                                    </>
                                )}

                                {/* RESTORAN */}
                                {user.roles.includes('ROLE_RESTAURANT') && (
                                    <>
                                        <Link to="/restaurant-panel" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50">📊 Panelim</Link>
                                        <Link to="/restaurant-orders" onClick={closeMenu} className="text-gray-700 hover:text-blue-600 font-medium py-2 border-b border-gray-50">📋 Siparişler</Link>
                                    </>
                                )}

                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="text-gray-600 hover:text-purple-600">📋 Restoran Onayları</Link>
                                        <Link to="/register-restaurant" className="text-gray-600 hover:text-purple-600">➕ Yeni Restoran Ekle</Link>
                                        <Link to="/admin-users" className="text-gray-600 hover:text-purple-600">👥 Kullanıcılar</Link>
            

                                    </>
                                )}

                                {/* ÇIKIŞ */}
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full text-left text-red-600 font-bold py-3 mt-2 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Çıkış Yap
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;