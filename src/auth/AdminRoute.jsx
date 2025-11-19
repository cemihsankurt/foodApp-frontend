import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function AdminRoute({ children }) {
    
    // 1. Global hafızadan 'user' (rolleriyle) ve 'token'ı al
    const { user, token } = useAuth();

    // 2. Token var mı (giriş yapmış mı) diye bak
    if (!token) {
        // Giriş yapmamışsa, login'e yolla
        return <Navigate to="/login" replace />;
    }

    // 3. Giriş yapmış, peki ROLÜ ADMIN Mİ?
    if (user && !user.roles.includes('ROLE_ADMIN')) {
        // Admin değilse (Müşteri veya Restoran ise),
        // Ana Sayfaya yolla ve "Yetkin yok" de
        alert("Bu alana erişim yetkiniz bulunmamaktadır.");
        return <Navigate to="/" replace />;
    }
    
    // 4. Hem token'ı var hem de rolü Admin ise, sayfayı göster
    return children;
}

export default AdminRoute;