import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';

function AdminDashboard() {
    
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingRestaurants();
    }, []);

    const fetchPendingRestaurants = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/restaurants/pending');
            setPendingRestaurants(response.data);
        } catch (err) {
            console.error("Hata:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (restaurantId) => {
        if(!window.confirm("Bu restoranı onaylamak istiyor musunuz?")) return;
        try {
            await apiClient.post(`/admin/restaurants/${restaurantId}/approve`);
            setPendingRestaurants(prev => prev.filter(r => r.id !== restaurantId)); // ID eşleşmesine dikkat (r.id veya r.restaurantId)
            alert("✅ Restoran onaylandı ve sisteme dahil edildi.");
        } catch (err) {
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };

    const handleReject = async (restaurantId) => {
        if(!window.confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
        try {
            await apiClient.put(`/admin/restaurants/${restaurantId}/reject`);
            setPendingRestaurants(prev => prev.filter(r => r.id !== restaurantId));
            alert("❌ Başvuru reddedildi.");
        } catch (err) {
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen text-gray-500">Yükleniyor...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">Hata: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER & STATS --- */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Onay Bekleyenler</h2>
                        <p className="text-gray-500 mt-1">Restoran başvurularını inceleyin ve yönetin.</p>
                    </div>
                    <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
                        Bekleyen Başvuru: <span className="text-red-600 font-bold ml-1">{pendingRestaurants.length}</span>
                    </div>
                </div>

                {/* --- LİSTE / KARTLAR --- */}
                {pendingRestaurants.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-200 flex flex-col items-center">
                        <div className="bg-green-50 p-4 rounded-full mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Her Şey Yolunda!</h3>
                        <p className="text-gray-500">Şu an onay bekleyen yeni bir restoran başvurusu yok.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pendingRestaurants.map(restaurant => (
                            <div key={restaurant.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                
                                {/* Kart Üstü (Renkli Şerit) */}
                                <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-orange-50 text-orange-600 p-3 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">ID: {restaurant.id}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{restaurant.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        {restaurant.email}
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleApprove(restaurant.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Onayla
                                        </button>
                                        <button 
                                            onClick={() => handleReject(restaurant.id)}
                                            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;