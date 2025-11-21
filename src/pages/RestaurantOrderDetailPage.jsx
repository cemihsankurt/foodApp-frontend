import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api.js';

function RestaurantOrderDetailPage() {
    
    const { orderId } = useParams(); // URL'den (örn: /orders/3) '3'ü al
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. VERİ ÇEKME (useEffect) ---
    // Sayfa ilk yüklendiğinde SADECE 1 KEZ çalışır
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Backend'deki *ortak* (müşteri/restoran) sipariş detay endpoint'ini çağır
                const response = await apiClient.get(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (err) {
                console.error("Sipariş detayı çekilirken hata:", err);
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

    // --- 2. EYLEM (Durumu Güncelle) ---
    const handleUpdateStatus = async (newStatus) => {
        try {
            // Backend'deki 'restaurant-panel' endpoint'ini (PUT) çağır
            const response = await apiClient.post(
                `/restaurant-panel/orders/${orderId}/status`,
                { newStatus: newStatus } // Örn: { "newStatus": "PREPARING" }
            );

            // Başarılı! Dönen güncel 'OrderDetailsResponseDto' ile
            // ekrandaki veriyi (frontend hafızasını) anında güncelle
            setOrder(response.data);
            alert(`Sipariş durumu "${newStatus}" olarak güncellendi!`);

        } catch (err) {
            console.error("Sipariş durumu güncellenirken hata:", err);
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };

    const getStatusBadge = (status) => {
    switch (status) {
        case 'PENDING': return { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'PREPARING': return { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-800 border-orange-200' };
        case 'DELIVERING': return { label: 'Yolda', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'COMPLETED': return { label: 'Tamamlandı', color: 'bg-green-100 text-green-800 border-green-200' };
        case 'CANCELLED': return { label: 'İptal Edildi', color: 'bg-red-100 text-red-800 border-red-200' };
        default: return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
};

    // --- 3. GÖRÜNÜM (Render) ---
    if (loading) return <div>Sipariş Detayları Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;
    if (!order) return <div>Sipariş bulunamadı.</div>;

    const statusBadge = getStatusBadge(order.orderStatus);

    // Her şey yolundaysa, detayı göster:
    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                
                {/* --- ÜST BAŞLIK (HEADER) --- */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Sipariş Yönetimi</h2>
                        <p className="text-gray-400 text-sm mt-1">#{order.orderId}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold border ${statusBadge.color} bg-opacity-90`}>
                        {statusBadge.label}
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    
                    {/* --- 1. MÜŞTERİ & TESLİMAT BİLGİLERİ --- */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b pb-2">Müşteri Bilgileri</h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-full"><span className="text-xl">👤</span></div>
                                <div>
                                    <p className="font-bold text-gray-800">{order.customerName}</p>
                                    <p className="text-sm text-gray-500">{order.phoneNumber}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b pb-2">Teslimat Adresi</h3>
                            <div className="flex items-start gap-3">
                                <div className="bg-gray-100 p-2 rounded-full"><span className="text-xl">📍</span></div>
                                <p className="text-gray-800 text-sm leading-relaxed">{order.deliveryAddress}</p>
                            </div>
                        </div>
                    </div>

                    {/* --- 2. MÜŞTERİ NOTU (Varsa Göster) --- */}
                    {order.note && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm">
                            <div className="flex items-center gap-2 text-yellow-800 font-bold mb-1">
                                <span>📝 Müşteri Notu</span>
                            </div>
                            <p className="text-gray-700 italic">"{order.note}"</p>
                        </div>
                    )}

                    {/* --- 3. SİPARİŞ İÇERİĞİ (ÜRÜNLER) --- */}
                    <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b pb-2 mb-4">Sipariş İçeriği</h3>
                        <div className="space-y-2">
                            {order.orderItems && order.orderItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white text-red-600 font-bold border border-red-100 w-8 h-8 flex items-center justify-center rounded-md shadow-sm">
                                            {item.quantity}x
                                        </div>
                                        <span className="font-medium text-gray-800">{item.productName}</span>
                                    </div>
                                    {/* Fiyat bilgisi varsa buraya eklenebilir */}
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex justify-end mt-4 items-center gap-2">
                            <span className="text-gray-500 font-medium">Toplam Tutar:</span>
                            <span className="text-2xl font-bold text-green-600">{order.totalPrice} TL</span>
                        </div>
                    </div>

                    {/* --- 4. AKSİYON BUTONLARI (Duruma Göre Değişen) --- */}
                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">İşlemler</h3>
                        
                        <div className="flex flex-wrap gap-3">
                            
                            {/* Durum: ONAY BEKLİYOR -> Hazırlamaya Başla */}
                            {order.orderStatus === 'PENDING' && (
                                <button 
                                    onClick={() => handleUpdateStatus('PREPARING')} 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>✅</span> Siparişi Onayla
                                </button>
                            )}

                            {/* Durum: HAZIRLANIYOR -> Yola Çıkar */}
                            {order.orderStatus === 'PREPARING' && (
                                <button 
                                    onClick={() => handleUpdateStatus('DELIVERING')} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>🛵</span> Yola Çıkar
                                </button>
                            )}

                            {/* Durum: YOLDA -> Teslim Et */}
                            {order.orderStatus === 'DELIVERING' && (
                                <button 
                                    onClick={() => handleUpdateStatus('COMPLETED')} 
                                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>🏁</span> Teslim Edildi
                                </button>
                            )}

                            {/* İPTAL BUTONU (Sadece başlarda aktif) */}
                            {(order.orderStatus === 'PENDING' || order.orderStatus === 'PREPARING') && (
                                <button 
                                    onClick={() => handleUpdateStatus('CANCELLED')} 
                                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Siparişi İptal Et ❌
                                </button>
                            )}

                            {/* Bilgilendirme Mesajı */}
                            {(order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') && (
                                <div className="w-full text-center text-gray-400 italic bg-gray-50 py-3 rounded-lg">
                                    Bu sipariş tamamlanmış veya iptal edilmiştir. İşlem yapılamaz.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RestaurantOrderDetailPage;