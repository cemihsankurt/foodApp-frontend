import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function RestaurantOrdersPage() {
    
    // 1. HAFIZA: Sipariş listesi, yüklenme ve hata
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // 2. EFEKT: Sayfa ilk yüklendiğinde SADECE 1 KEZ çalış
    useEffect(() => {
        const fetchRestaurantOrders = async () => {
            try {
                // Backend'deki yeni korumalı endpoint'i çağır
                const response = await apiClient.get('/restaurant-panel/orders');
                setOrders(response.data); // Gelen listeyi hafızaya al
                
            } catch (err) {
                console.error("Restoran siparişleri çekilirken hata:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantOrders();
    }, []);
    
    // Boş dizi '[]' -> Sadece 1 kez çalışır

    useEffect(() => {
        
        // Eğer kullanıcı restoran değilse veya restaurantId'si yoksa bağlanma
        if (!user || !user.roles.includes('ROLE_RESTAURANT') || !user.restaurantId) {
            return;
        }

        // WebSocket bağlantısı için STOMP client'ı ayarla
        const socketFactory = () => {
            return new SockJS('http://localhost:8080/ws');
        };
        const stompClient = Stomp.over(socketFactory);


        // Bağlantı başarılı olduğunda...
        stompClient.onConnect = ({},frame) => {
            console.log('WebSocket\'e bağlanıldı: ' + frame);
            
            // 5. KENDİ ÖZEL KANALIMIZA ABONE OL
            // (Backend'de 'messagingTemplate.convertAndSend' ile yolladığımız yer)
            const topic = `/topic/orders/restaurant/${user.restaurantId}`;
            
            stompClient.subscribe(topic, (message) => {
                // KANALDAN YENİ MESAJ GELDİĞİNDE:
                const newOrder = JSON.parse(message.body); // Gelen sipariş (JSON)
                console.log('Yeni sipariş alındı!', newOrder);
                
                // Listeyi güncelle: Yeni siparişi listenin en başına ekle
                setOrders((currentOrders) => [newOrder, ...currentOrders]);
            });
        };

        // Bağlantı hatası olursa...
        stompClient.onStompError = (frame) => {
            console.error('STOMP hatası: ' + frame.headers['message']);
        };

        // Bağlantıyı aktifleştir
        stompClient.activate();

        // 6. TEMİZLİK FONKSİYONU
        // Bu sayfadan ayrıldığımızda (component unmount), bağlantıyı kapat
        return () => {
            if (stompClient.connected) {
                stompClient.deactivate();
                console.log('WebSocket bağlantısı kapatıldı.');
            }
        };

    }, [user]);

    // 3. GÖRÜNÜM (Render)
    if (loading) return <div>Gelen Siparişler Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

   return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Gelen Siparişler</h2>
            
            {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500 text-lg">Henüz hiç sipariş almamışsınız.</p>
                    <p className="text-sm text-gray-400">Dükkanınızın açık olduğundan emin olun!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.orderId} className="bg-white rounded-xl shadow-md p-6 border-l-8 border-blue-500 hover:shadow-lg transition duration-200">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                
                                {/* Sol: Sipariş Bilgisi */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-xl font-bold text-gray-900">#{order.orderId}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${order.orderStatus === 'PREPARING' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${order.orderStatus === 'DELIVERING' ? 'bg-purple-100 text-purple-800' : ''}
                                            ${order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
                                            ${order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                                        `}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        📅 {new Date(order.orderTime).toLocaleString('tr-TR')}
                                    </p>
                                </div>

                                {/* Orta: Tutar */}
                                <div className="my-4 md:my-0">
                                    <span className="text-2xl font-bold text-gray-800">{order.totalPrice} TL</span>
                                </div>

                                {/* Sağ: Buton */}
                                <div>
                                    <Link 
                                        to={`/restaurant-panel/orders/${order.orderId}`}
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                                    >
                                        Siparişi Yönet &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RestaurantOrdersPage;