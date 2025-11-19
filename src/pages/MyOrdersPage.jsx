import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api.js'; // Axios istemcisi
import { Link } from 'react-router-dom';

// import { stompClient } from '../websocket'; // WebSocket kullanacaksan bu import da gerekli

function MyOrdersPage() {
    
    // --- 1. STATE TANIMLARI ---
    const [orders, setOrders] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState(Notification.permission);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const VAPID_PUBLIC_KEY = "BKgmr-ghj5xfxym4HNsrbueHbvl1ZaKEBOf1dT_u7wPPGu6TzvOcWo0JnBCDB4tZy9sq9wL7SnjceLuHg6jCcNo";

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const subscribeUserToPush = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn("Push bildirimleri bu tarayıcıda desteklenmiyor.");
            return;
        }

        try {
            // 1. İzin iste

            console.log("1. Başlangıç İzin Durumu:", Notification.permission);
            
            const permission = await Notification.requestPermission();
            setNotificationStatus(permission);

            if (permission !== 'granted') {
                console.log("Kullanıcı bildirim izni vermedi.");
                return;
            }

            // 2. Service Worker'ın hazır olmasını bekle
            const registration = await navigator.serviceWorker.ready;

            // 3. Abone ol (VAPID key ile)
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            console.log('Web Push Aboneliği alındı:', subscription);

            // 4. Aboneliği backend'e kaydet (Backend'deki DTO'ya uygun hale getir)
            const subscriptionData = {
                endpoint: subscription.endpoint,
                p256dh: subscription.toJSON().keys.p256dh,
                auth: subscription.toJSON().keys.auth
            };
            
            // Backend'de oluşturduğun yeni endpoint'i çağır
            // (Örn: CustomerService'teki addPushSubscription metodunu çağıran Controller)
            await apiClient.post('/customer/subscribe', subscriptionData);
            
            console.log("Web Push aboneliği başarıyla backend'e kaydedildi.");

        } catch (error) {
            console.error("Web Push aboneliği alınırken veya kaydederken hata oluştu:", error);
            setNotificationStatus(Notification.permission); 
        }
    }, [apiClient, VAPID_PUBLIC_KEY]);

    // --- 2. FONKSİYONLAR (useCallback ile güvenli hale getirildi) ---
    
    // Sipariş listesini API'dan çeker
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/orders/my-orders');
            setOrders(response.data);
        } catch (err) {
            console.error("Siparişler çekilirken hata:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []); 

    // Bildirim izni ister ve token'ı backende kaydeder
    

    // Sipariş iptali
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) {
            return;
        }

        try {
            await apiClient.post(`/orders/${orderId}/cancel`);
            
            // Başarılı iptalden sonra listeyi manuel güncelle
            setOrders(currentOrders =>
                currentOrders.map(order => 
                    order.orderId === orderId ? 
                    { ...order, orderStatus: 'CANCELLED' } : 
                    order
                )
            );
            alert("Sipariş başarıyla iptal edildi.");

        } catch (err) {
            console.error("Sipariş iptal edilirken hata:", err);
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };
    
    // --- 3. useEffect BLOKLARI (YAŞAM DÖNGÜSÜ) ---

    // A) Sipariş Listesi Çekme (Sayfa ilk açıldığında)
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]); // fetchOrders'ı bağımlılık olarak ekliyoruz

    useEffect(() => {
        // 1. Sayfa yüklendiğinde VAPID aboneliğini kontrol et/kaydet
        subscribeUserToPush();
        
        // 2. Service Worker'dan gelen 'push-update' mesajını dinle
        const handleServiceWorkerMessage = (event) => {
            if (event.data && event.data.type === 'push-update') {
                console.log('Service Worker\'dan güncelleme mesajı alındı. Siparişler yenileniyor...');
                fetchOrders();
            }
        };

        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

        // Component temizlendiğinde dinleyiciyi kaldır
        return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [fetchOrders, subscribeUserToPush]);
    
    // --- 4. GÖRÜNÜM (RENDER) ---
    if (loading) return <div>Siparişleriniz Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

    return (
        <div>
            <h2>Siparişlerim</h2>
            
            {/* 🔔 BİLDİRİM İZİN BUTONU: Sadece izin verilmemişse göster */}
            {notificationStatus !== 'granted' && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px', marginBottom: '15px' }}>
                    {notificationStatus === 'denied' ? (
                        <p style={{ margin: 0, color: 'red' }}>
                            Bildirimler tarayıcı ayarlarınızdan engellenmiş. Lütfen adres çubuğundan izin verin.
                        </p>
                    ) : (
                        <button 
                            // 🚀 Butona tıklandığında izin isteği ve token kaydı tetiklenir
                            onClick={subscribeUserToPush}
                            style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Yeni Sipariş Bildirimlerini Aç 🔔
                        </button>
                    )}
                </div>
            )}

            {/* Sipariş Listesi */}
            <div className="order-list">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.orderId} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                            <h4>Restoran: {order.restaurantName}</h4>
                            <p>Durum: <strong>{order.orderStatus}</strong></p>
                            
                            <Link to={`/orders/${order.orderId}`}>Detayları Gör</Link>
                            
                            {/* İptal Butonu */}
                            {order.orderStatus === 'PENDING' && (
                                <button 
                                    onClick={() => handleCancelOrder(order.orderId)}
                                    style={{ background: 'red', color: 'white', marginLeft: '10px' }}
                                >
                                    İptal Et
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Henüz hiç sipariş vermemişsiniz.</p>
                )}
            </div>
        </div>
    );
}

export default MyOrdersPage;