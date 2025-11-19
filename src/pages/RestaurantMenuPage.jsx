import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // <-- Router'dan ID'yi okumak için
import apiClient from '../api.js';

function RestaurantMenuPage() {
    
    // 1. URL'den restoran ID'sini al
    // (main.jsx'te yolu '/restaurants/:restaurantId' yapacağız,
    //  bu 'useParams', o ':restaurantId' değişkenini yakalar)
    const { restaurantId } = useParams();
    const location  = useLocation();
    const restaurantName = location.state?.restaurantName;
    const {user, setCart} = useAuth();
    const navigate = useNavigate();
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Sayfa ilk yüklendiğinde SADECE 1 KEZ çalış
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // 3. Backend'e o ID ile istek at
                const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
                setMenu(response.data);
            } catch (err) {
                setError(err.message);
                console.error("Menü çekilirken hata:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [restaurantId]); // 'restaurantId' değişirse bu efekti tekrar çalıştır


     const handleAddToCart = async(productId) => {
                console.log("Adding product to cart, productId:", productId);
                try {
                    const response = await apiClient.post('/cart/add', { 
                        productId, 
                        quantity: 1 
                    });
                    setCart(response.data);
                    console.log("Ürün sepete eklendi:", response.data);
                    alert("Sepetiniz güncellendi.");

                }
                catch (err) {
                    console.error("Sepete ürün eklenirken hata:", err);
                    alert("Ürün sepete eklenirken bir hata oluştu.");
                }
            }

    // 4. Görünüm (Render)
    if (loading) return <div>Menü Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

    return (
        // Sayfa Konteyneri: Ortalanmış, padding'li, mobil/masaüstü uyumlu
        <div className="container mx-auto p-4 md:p-8">
            
            {/* --- BAŞLIK --- */}
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2 border-b pb-2">
                {/* Bu, 'state'ten gelen restoran adı veya varsayılan metindir */}
                {restaurantName || 'Restoran Menüsü'}
            </h2>
            {/* --- MENÜ LİSTESİ (Responsive Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.length > 0 ? (
                    menu.map(product => (
                        <div 
                            key={product.id} 
                            // Kart stili: Beyaz, yuvarlak köşeler, gölge ve hover efekti
                            className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 flex flex-col justify-between transition duration-300 hover:shadow-xl hover:border-red-500"
                        >
                            {/* Ürün Detayları */}
                            <div>
                                <h4 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h4>
                                <p className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">{product.description || 'Açıklama yok'}</p>
                            </div>

                            {/* Fiyat ve Buton */}
                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                                <span className="text-2xl font-bold text-red-600">
                                    {product.price} TL
                                </span>
                                
                                {/* Sepete Ekle Butonu - Sadece Müşteri İçin (Korumalı) */}
                                {user && user.roles.includes('ROLE_CUSTOMER') && (
                                    <button 
                                        onClick={() => handleAddToCart(product.id)}
                                        // Buton stili: Mavi, kalın, büyük, gölgeli
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                                    >
                                        Sepete Ekle
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">Bu restoranda henüz ürün bulunmamaktadır.</p>
                )}
            </div>
        </div>
    );
}

export default RestaurantMenuPage;