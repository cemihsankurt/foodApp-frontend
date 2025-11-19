import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';
import { useAuth } from '../context/AuthContext.jsx'; // (Buna belki gerek kalmaz ama alalım)

function AddressPage() {
    
    // --- 1. HAFIZA (State) ---
    // Mevcut adresleri tutmak için
    const [addresses, setAddresses] = useState([]);
    // Formdaki alanları tutmak için
    const [title, setTitle] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 2. VERİ ÇEKME (useEffect) ---
    // Sayfa ilk yüklendiğinde mevcut adresleri çek
    useEffect(() => {
        fetchAddresses();
    }, []); // Boş dizi '[]' -> Sadece 1 kez çalışır

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/customer/addresses');
            setAddresses(response.data); // Gelen adres listesini hafızaya al
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 3. EYLEM (Form Gönderme - SENİN İSTEDİĞİN) ---
    const handleAddAddress = async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        setError(null);
        
        try {
            // Backend'e POST isteği at
            const response = await apiClient.post('/customer/addresses', {
                addressTitle: title,
                fullAddress: fullAddress,
            });

            // BAŞARILI! Yeni adresi mevcut listeye ekle
            setAddresses([...addresses, response.data]);
            
            // Formu temizle
            setTitle('');
            setFullAddress('');
            
        } catch (err) {
            console.error("Adres eklerken hata:", err);
            setError(err.response?.data?.message || 'Bir hata oluştu.');
        }
    };

    // --- 4. GÖRÜNÜM ---
    return (
        <div>
            <h2>Adres Defterim</h2>
            
            {/* --- Yeni Adres Ekleme Formu --- */}
            <form onSubmit={handleAddAddress} style={{ border: '1px solid #ccc', padding: '10px' }}>
                <h3>Yeni Adres Ekle</h3>
                <div>
                    <label>Adres Başlığı (örn: Evim):</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Açık Adres:</label>
                    <input type="text" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} required />
                </div>
                <button type="submit">Adresi Kaydet</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>

            <hr style={{ margin: '20px 0' }} />

            {/* --- Mevcut Adresler Listesi --- */}
            <h3>Kayıtlı Adreslerim</h3>
            {loading && <p>Adresler yükleniyor...</p>}
            {addresses.length === 0 && !loading && <p>Kayıtlı adresiniz bulunmamaktadır.</p>}
            
            <div className="address-list">
                {addresses.map(address => (
                    <div key={address.id} style={{ borderBottom: '1px solid gray', padding: '5px' }}>
                        <h4>{address.addressTitle}</h4>
                        <p>{address.fullAddress}</p>
                        {/* (Buraya yakında 'Sil' butonu gelecek) */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AddressPage;