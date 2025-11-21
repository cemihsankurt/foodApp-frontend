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

    // Sipariş durumuna göre renk ve metin döndüren yardımcı fonksiyon
    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
            case 'PREPARING':
                return { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-700 border-orange-200' };
            case 'DELIVERING':
                return { label: 'Yolda', color: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'COMPLETED':
                return { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700 border-green-200' };
            case 'CANCELLED':
                return { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200' };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
        }
    };
    
    // --- 4. GÖRÜNÜM (RENDER) ---
    if (loading) return <div>Siparişleriniz Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

   return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="max-w-3xl mx-auto pt-8 px-4">
                
                {/* --- BAŞLIK --- */}
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-4 flex items-center justify-between">
                    Siparişlerim
                    <span className="text-sm font-normal text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                        Toplam: {orders.length}
                    </span>
                </h2>

                {/* --- BİLDİRİM ALANI (Modernleştirildi) --- */}
                {notificationStatus !== 'unsupported' && notificationStatus !== 'granted' && (
                    <div className="mb-8 bg-white border-l-4 border-blue-500 rounded-r-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Siparişlerini anlık takip et!</p>
                                <p className="text-sm text-gray-500">Yemeğin yola çıktığında haberin olsun ister misin?</p>
                            </div>
                        </div>
                        <button 
                            onClick={subscribeUserToPush} 
                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all active:scale-95 whitespace-nowrap"
                        >
                            Bildirimleri Aç 🔔
                        </button>
                    </div>
                )}

                {/* --- DESTEKLENMİYOR UYARISI --- */}
                {notificationStatus === 'unsupported' && (
                    <div className="mb-6 text-center text-xs text-gray-400 bg-gray-100 py-2 rounded-lg border border-gray-200">
                        * Cihazınız web bildirimlerini desteklemiyor.
                    </div>
                )}

                {/* --- SİPARİŞ LİSTESİ --- */}
                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map(order => {
                            const statusBadge = getStatusBadge(order.orderStatus);
                            
                            return (
                                <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                    
                                    {/* Kart Üstü: Restoran ve Durum */}
                                    <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            {/* Restoran İkonu Placeholder */}
                                            <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800">{order.restaurantName}</h4>
                                                <p className="text-xs text-gray-400">Sipariş No: #{String(order.orderId).substring(0, 8)}...</p>
                                            </div>
                                        </div>

                                        {/* Durum Rozeti */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color} flex items-center justify-center sm:justify-end w-fit`}>
                                            {statusBadge.label}
                                        </div>
                                    </div>

                                    {/* Kart Altı: Aksiyonlar */}
                                    <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                                        
                                        {/* Detay Linki */}
                                        <Link 
                                            to={`/orders/${order.orderId}`} 
                                            className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                                        >
                                            Sipariş Detayı
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>

                                        {/* İptal Butonu (Sadece PENDING ise) */}
                                        {order.orderStatus === 'PENDING' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order.orderId)} 
                                                className="text-sm text-red-600 hover:text-red-800 font-medium border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Siparişi İptal Et
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        /* --- BOŞ DURUM (EMPTY STATE) --- */
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Henüz Siparişin Yok</h3>
                            <p className="text-gray-500 mt-1 mb-6 max-w-xs">Canın lezzetli bir şeyler mi çekiyor? Hemen restoranlara göz at!</p>
                            <Link to="/" className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 shadow-lg transition-all">
                                Restoranları Keşfet
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyOrdersPage;