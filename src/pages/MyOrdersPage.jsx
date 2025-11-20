import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api.js'; // Axios istemcisi
import { Link } from 'react-router-dom';

// import { stompClient } from '../websocket'; // WebSocket kullanacaksan bu import da gerekli

function MyOrdersPage() {
    
    // --- 1. STATE TANIMLARI ---
    const [orders, setOrders] = useState([]);
    const [notificationStatus, setNotificationStatus] = useState(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'unsupported'; // Desteklenmiyor
    });
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

        if (Notification.permission === 'denied') {
            alert("⚠️ Bildirimler daha önce engellenmiş!\n\nLütfen telefonunuzun 'Ayarlar' kısmından bu uygulama için bildirimleri manuel olarak açın.");
            return;
        }
        
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            alert("Maalesef bu cihaz/tarayıcı bildirimleri desteklemiyor (iOS ise Ana Ekrana Ekle yapmalısınız).");
            setNotificationStatus('unsupported');
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

            const debugError = {
                message: err.message, // Hata mesajı
                url: err.config?.url, // Hangi adrese istek attı? (En önemlisi bu!)
                baseURL: err.config?.baseURL, // Ana adres neydi?
                status: err.response?.status, // 404 mü, 500 mü, 403 mü?
                backendCevabi: err.response?.data // Backend'in cevabı ne?
            };
            setError(JSON.stringify(debugError, null, 2));
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
        // Service Worker varsa dinle, yoksa (iPhone vb.) hata verme geç
        if ('serviceWorker' in navigator) {
            const handleMsg = (event) => {
                if (event.data && event.data.type === 'push-update') fetchOrders();
            };
            navigator.serviceWorker.addEventListener('message', handleMsg);
            return () => navigator.serviceWorker.removeEventListener('message', handleMsg);
        }
    }, [fetchOrders]);

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
        <div style={{padding:'10px'}}>
            <h2>Siparişlerim</h2>
            
            {/* 🔔 BİLDİRİM BUTONU (Sadece destekleniyorsa göster) */}
            {notificationStatus !== 'unsupported' && notificationStatus !== 'granted' && (
                <div style={{ padding: '10px', backgroundColor: '#e2e3e5', marginBottom: '15px', borderRadius:'5px' }}>
                    <p style={{fontSize:'12px', margin:'0 0 5px 0'}}>Sipariş durumunu anlık öğrenmek için:</p>
                    <button 
                        onClick={subscribeUserToPush} 
                        style={{ padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Bildirimleri Aç 🔔
                    </button>
                </div>
            )}

            {/* Desteklenmiyorsa uyarı (Opsiyonel) */}
            {notificationStatus === 'unsupported' && (
                <div style={{fontSize:'12px', color:'#888', marginBottom:'10px'}}>
                    * Cihazınız web bildirimlerini desteklemiyor olabilir.
                </div>
            )}

            <div className="order-list">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.orderId} style={{ border: '1px solid #ddd', margin: '10px 0', padding: '15px', borderRadius:'8px' }}>
                            <h4>{order.restaurantName}</h4>
                            <p>Durum: <b>{order.orderStatus}</b></p>
                            <Link to={`/orders/${order.orderId}`} style={{color:'blue', marginRight:'10px'}}>Detay</Link>
                            {order.orderStatus === 'PENDING' && (
                                <button onClick={() => handleCancelOrder(order.orderId)} style={{background:'red', color:'white', border:'none', borderRadius:'4px'}}>İptal</button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Siparişiniz yok.</p>
                )}
            </div>
        </div>
    );
}

export default MyOrdersPage;