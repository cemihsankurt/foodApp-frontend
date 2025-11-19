import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';
import { jwtDecode } from 'jwt-decode';

// 1. "Global Hafıza"nın (Context) kendisini oluştur
const AuthContext = createContext(null);

/**
 * Bu, 'main.jsx'te tüm uygulamamızı saracak olan 'Sağlayıcı'dır (Provider).
 * Hafızayı bu bileşen tutar.
 */

function decodeToken(token) {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token); // Token'ı çöz
        // Backend'deki JwtTokenProvider'da 'roles' ve 'sub' (email)
        // kullandığımızdan emin olmalıyız (ki öyle yaptık).
        return {
            id: decoded.userId,
            email: decoded.sub,
            roles: decoded.roles || [], // 'roles' yoksa boş liste
            restaurantId: decoded.restaurantId || null
        };
    } catch (e) {
        console.error("Token çözülemedi:", e);
        return null;
    }
}
export function AuthProvider({ children }) {
    
    // 2. Hafızanın ilk durumu: localStorage'daki token'ı oku
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    const [user, setUser] = useState(() => decodeToken(token));

    const [cart, setCart] = useState(null);

    const fetchCart = async() => {
        if (!token) { return; }
        try {
            const response = await apiClient.get('/cart', {});
            setCart(response.data);
        }
        catch (err) {
            console.error("Sepet bilgisi çekilirken hata:", err);
        }
    };
    
    // 'login' fonksiyonu (LoginPage'den çağrılacak)
    const login = (newToken) => {
        localStorage.setItem('authToken', newToken); // Hafızaya kaydet
        setToken(newToken); // React'in hafızasını güncelle (ekran yenilensin)
        const decodedUser = decodeToken(newToken);
        setUser(decodedUser);
        fetchCart();
    };

    // 'logout' fonksiyonu (Logout butonu için)
    const logout = () => {
        localStorage.removeItem('authToken'); // Hafızadan sil
        setToken(null); // React'in hafızasını güncelle
        setUser(null);
        setCart(null);
    };

   useEffect(() => {
        if (token && user?.roles.includes('ROLE_CUSTOMER')) {
            fetchCart();
        } else {
            setCart(null); // Admin veya Restoran giriş yaptıysa sepeti 'null' yap
        }
    }, [token, user]); // 'user' değiştiğinde de tetikle
        

    // 4. Bu 'değerleri' (token, login, logout) alt bileşenlere 'sağla'
    const value = {
        token,
        user,
        cart,
        setCart,
        login,
        logout,
        isAuthenticated: !!user // (token varsa true, yoksa false döner)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Bu, 'App.jsx' veya 'HomePage.jsx' gibi bileşenlerin
 * o hafızaya kolayca erişmesini sağlayan kısa bir yoldur.
 */
export function useAuth() {
    return useContext(AuthContext);
}