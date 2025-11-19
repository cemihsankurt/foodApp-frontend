import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // URL'den ID'yi okumak için
import apiClient from '../api.js';

function OrderDetailPage() {
    
    // 1. URL'den ':orderId'yi yakala
    const { orderId } = useParams();

    // 2. HAFIZA: Sipariş detayını tutmak için
    const [order, setOrder] = useState(null); // Başlangıçta null (boş)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 3. EFEKT: Sayfa ilk yüklendiğinde SADECE 1 KEZ çalış
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Backend'deki korumalı '/api/orders/:orderId' endpoint'ini çağır
                // (apiClient buna 'Authorization' token'ını otomatik ekleyecek)
                const response = await apiClient.get(`/orders/${orderId}`);
                
                setOrder(response.data); // Gelen 'OrderDetailsResponseDto'yu hafızaya al
                
            } catch (err) {
                console.error("Sipariş detayı çekilirken hata:", err);
                // 403 (Yetkisiz Erişim) hatasını da yakala
                if (err.response && err.response.status === 403) {
                    setError("Bu siparişi görüntüleme yetkiniz yok.");
                } else {
                    setError(err.response?.data?.message || err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]); // 'orderId' değişirse bu efekti tekrar çalıştır

    // 4. GÖRÜNÜM (Render)
    if (loading) return <div>Sipariş Detayları Yükleniyor...</div>;
    // (403 veya 404 hatası varsa 'error' nesnesi onu gösterecek)
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;
    if (!order) return <div>Sipariş bulunamadı.</div>; // Ekstra kontrol

    // Her şey yolundaysa, detayı göster:
    return (
        <div>
            <h2>Sipariş Detayı:</h2>
            <p><strong>Restoran:</strong> {order.restaurantName}</p>
            <p><strong>Durum:</strong> {order.orderStatus}</p>
            <p><strong>Tarih:</strong> {new Date(order.orderTime).toLocaleString('tr-TR')}</p>

            <p style={{background: '#f0f0f0', padding: '10px'}}>
                <strong>Teslimat Adresi:</strong> {order.deliveryAddress}
            </p>
            
            <h3 style={{marginTop: '20px'}}>Ürünler</h3>
            <div className="order-items-list">
                
                {order.orderItems && order.orderItems.map((item, index) => ( // <-- 'index'i al
                    
                    // --- DÜZELTME BURADA ---
                    // 'key' olarak 'item.productId' yerine 'index'i kullan
                    <div key={index} style={{ borderBottom: '1px solid #eee', padding: '5px' }}>
                    {/* --- BİTTİ --- */}
                    
                        <p><strong>{item.productName}</strong></p>
                        <p>{item.quantity} Adet <br /> {item.price} TL</p>
                    </div>
                ))}
            </div>

            <h2 style={{marginTop: '20px', color: 'green'}}>
                Toplam Tutar: {order.totalPrice} TL
            </h2>
            
            <Link to="/my-orders">Tüm Siparişlerime Geri Dön</Link>
        </div>
    );
}

export default OrderDetailPage;