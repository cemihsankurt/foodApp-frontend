import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';

function AdminDashboard() {
    
    // 1. HAFIZA: Onay bekleyenleri ve hataları tut
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. EFEKT: Sayfa yüklendiğinde SADECE 1 KEZ çalış
    useEffect(() => {
        fetchPendingRestaurants();
    }, []);

    // Backend'den onay bekleyenleri çeken fonksiyon
    const fetchPendingRestaurants = async () => {
        try {
            setLoading(true);
            // Admin'e özel endpoint'i çağır
            const response = await apiClient.get('/admin/restaurants/pending');
            setPendingRestaurants(response.data);
        } catch (err) {
            console.error("Onay bekleyen restoranlar çekilirken hata:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 3. EYLEM: Restoranı Onayla ---
    const handleApprove = async (restaurantId) => {
        try {
            // Backend'e 'approve' isteği at
            await apiClient.post(`/admin/restaurants/${restaurantId}/approve`);
            
            // Başarılı! Listeyi güncelle (onaylananları listeden çıkar)
            setPendingRestaurants(prevList => 
                prevList.filter(restaurant => restaurant.restaurantId !== restaurantId)
            );
            alert("Restoran başarıyla onaylandı!");
            
        } catch (err) {
            console.error("Onaylama sırasında hata:", err);
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };

    // --- 4. EYLEM: Restoranı Reddet ---
    const handleReject = async (restaurantId) => {
        try {
            // Backend'e 'reject' isteği at
            await apiClient.put(`/admin/restaurants/${restaurantId}/reject`);
            
            // Başarılı! Listeyi güncelle (reddedilenleri listeden çıkar)
            setPendingRestaurants(prevList => 
                prevList.filter(restaurant => restaurant.restaurantId !== restaurantId)
            );
            alert("Restoran başarıyla reddedildi.");

        } catch (err) {
            console.error("Reddetme sırasında hata:", err);
            alert("Hata: " + (err.response?.data?.message || err.message));
        }
    };

    // --- 5. GÖRÜNÜM ---
    if (loading) return <div>Onay bekleyen restoranlar yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

    return (
        <div>
            <h2>Admin Paneli - Restoran Onayları</h2>
            
            {pendingRestaurants.length === 0 ? (
                <p>Onay bekleyen restoran bulunmamaktadır.</p>
            ) : (
                pendingRestaurants.map(restaurant => (
                    <div key={restaurant.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                        <h4>{restaurant.name}</h4>
                        <p>ID: {restaurant.id}</p>
                        <p>E-posta: {restaurant.email}</p>
                        
                        <button 
                            onClick={() => handleApprove(restaurant.id)}
                            style={{ background: 'green', color: 'white', marginRight: '10px' }}
                        >
                            Onayla
                        </button>
                        <button 
                            onClick={() => handleReject(restaurant.id)}
                            style={{ background: 'red', color: 'white' }}
                        >
                            Reddet
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default AdminDashboard;