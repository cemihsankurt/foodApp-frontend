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


    // 4. GÖRÜNÜM (Render)
    if (loading) return <div>Sipariş Detayları Yükleniyor...</div>;
    // (403 veya 404 hatası varsa 'error' nesnesi onu gösterecek)
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;
    if (!order) return <div>Sipariş bulunamadı.</div>; // Ekstra kontrol

    const statusBadge = getStatusBadge(order.orderStatus);

    // Her şey yolundaysa, detayı göster:
    return (
        <div className="min-h-screen bg-gray-50 pb-12 pt-6">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* --- GERİ DÖN BUTONU --- */}
                <Link to="/my-orders" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors mb-6 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Tüm Siparişlerime Dön
                </Link>

                <div className="grid md:grid-cols-3 gap-6">
                    
                    {/* --- SOL KOLON: ÜRÜN LİSTESİ (FİŞ) --- */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 text-lg">Sipariş Özeti</h3>
                                <span className="text-sm text-gray-500">
                                    {new Date(order.orderTime).toLocaleString('tr-TR', { 
                                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                                    })}
                                </span>
                            </div>

                            <div className="p-6">
                                {/* Ürünler Başlıkları */}
                                <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    <span>Ürün</span>
                                    <span>Tutar</span>
                                </div>

                                {/* Ürün Listesi */}
                                <div className="space-y-1">
                                    {order.orderItems && order.orderItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                {/* Adet Rozeti */}
                                                <div className="bg-red-50 text-red-600 font-bold text-sm w-8 h-8 flex items-center justify-center rounded-md border border-red-100">
                                                    {item.quantity}x
                                                </div>
                                                <div className="font-medium text-gray-800">
                                                    {item.productName}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-gray-700">
                                                {item.price} TL
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Toplam Tutar Alanı */}
                                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Toplam Tutar</span>
                                        <span className="text-2xl font-bold text-red-600">{order.totalPrice} TL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SAĞ KOLON: BİLGİ KARTLARI --- */}
                    <div className="space-y-6">
                        
                        {/* 1. Durum Kartı */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Sipariş Durumu</h4>
                            <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusBadge.color}`}>
                                {/* Basit bir durum ikonu */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-bold">{statusBadge.label}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Sipariş No: #{String(order.orderId || "").substring(0, 8)}
                            </p>
                        </div>

                        {/* 2. Restoran Kartı */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Restoran</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span className="font-bold text-gray-800 text-lg">{order.restaurantName}</span>
                            </div>
                        </div>

                        {/* 3. Adres Kartı */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Teslimat Adresi</h4>
                            <div className="flex gap-3">
                                <div className="mt-1 text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {order.deliveryAddress}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;