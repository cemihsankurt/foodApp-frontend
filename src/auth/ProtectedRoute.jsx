import React from 'react';
import { Navigate } from 'react-router-dom'; // 'Yönlendirici' bileşeni

/**
 * Bu bileşen, bir güvenlik görevlisi gibi davranır.
 * İçine aldığı 'children'ı (korunan sayfayı) göstermeden önce
 * kullanıcının giriş yapıp yapmadığını kontrol eder.
 */
function ProtectedRoute({ children }) {

    // 1. Tarayıcının hafızasından token'ı oku
    const token = localStorage.getItem('authToken');

    // 2. Token YOKSA (kullanıcı giriş yapmamışsa)
    if (!token) {
        // Kullanıcıyı 'children'ı (Ana Sayfayı) görmekten engelle
        // ve onu zorla '/login' sayfasına yönlendir.
        return <Navigate to="/login" replace />;
    }

    // 3. Token VARSA (kullanıcı giriş yapmışsa)
    // Görevini tamamla ve korunan sayfayı ('children') göster.
    return children;
}

export default ProtectedRoute;