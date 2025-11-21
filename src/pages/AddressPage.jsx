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
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Üst Başlık Alanı - Ana Tasarımla Uyumlu */}
            <div className="max-w-4xl mx-auto pt-8 px-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-red-600 pl-4">
                    Adreslerim
                </h2>
                
                <div className="grid gap-8 md:grid-cols-3">
                    
                    {/* --- SOL TARAF: YENİ ADRES EKLEME FORMU --- */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-red-100 p-2 rounded-full text-red-600">
                                    {/* Basit bir ikon (Location Plus) */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">Yeni Ekle</h3>
                            </div>

                            <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres Başlığı</label>
                                    <input 
                                        type="text" 
                                        placeholder="Örn: Evim, Ofis" 
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Açık Adres</label>
                                    <textarea 
                                        placeholder="Mahalle, sokak, kapı no..." 
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                                        value={fullAddress} 
                                        onChange={(e) => setFullAddress(e.target.value)} 
                                        required 
                                    />
                                </div>
                                
                                {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                                <button 
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95"
                                >
                                    Kaydet
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- SAĞ TARAF: ADRES LİSTESİ --- */}
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Kayıtlı Adreslerim
                        </h3>

                        {loading && (
                            <div className="flex justify-center items-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        )}

                        {!loading && addresses.length === 0 && (
                            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300 text-gray-500">
                                <p>Henüz kayıtlı bir adresiniz yok.</p>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                            {addresses.map(address => (
                                <div key={address.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-red-200 transition-all group relative">
                                    {/* Kart Üst Kısmı */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-100 p-2 rounded-lg text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                                {/* Ev İkonu */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-lg">{address.addressTitle}</h4>
                                        </div>
                                        
                                        {/* Silme Butonu (İleride fonksiyon eklenecek) */}
                                        <button className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Sil">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Adres Metni */}
                                    <p className="text-gray-600 text-sm leading-relaxed ml-1">
                                        {address.fullAddress}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AddressPage;