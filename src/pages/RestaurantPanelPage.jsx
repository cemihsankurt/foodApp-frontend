import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';

function RestaurantPanelPage() {
    
    // --- 1. HAFIZA (State) ---
    // Panel verisini (restoran adı, menü, durum) tutmak için
    const [panelData, setPanelData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Yeni ürün ekleme formu için ayrı hafıza
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [formError, setFormError] = useState(null);

    const[editingProduct, setEditingProduct] = useState(null);


    // --- 2. VERİ ÇEKME (useEffect) ---
    // Bu, sayfa ilk yüklendiğinde çalışır ve mevcut durumu (menü, dükkan durumu) çeker
    useEffect(() => {
        fetchPanelData();
    }, []);

    const fetchPanelData = async () => {
    try {
        setLoading(true);
        const response = await apiClient.get('/restaurant-panel/my-details');

        // Backend field ile frontend field eşleştirme
        setPanelData(response.data);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
    };


    // --- 3. EYLEM: DÜKKANI AÇ/KAPAT (SENİN İSTEDİĞİN) ---
    const handleToggleAvailability = async () => {
    const newStatus = !panelData.available;

    try {
        await apiClient.post('/restaurant-panel/status', {
            available: newStatus
        });

        setPanelData(prevData => ({
            ...prevData,
            available: newStatus
        }));

    } catch (err) {
        console.error("Dükkan durumu güncellenirken hata:", err);
    }
};

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Bu ürünü menüden silmek istediğinize emin misiniz?")) return;

        try {
            await apiClient.delete(`/restaurant-panel/menu/products/${productId}`);
            
            // Listeden çıkar
            setPanelData(prev => ({
                ...prev,
                menu: prev.menu.filter(p => p.id !== productId)
            }));
            alert("Ürün silindi.");
            
            // Eğer silinen ürün o sırada düzenleniyorsa, formu temizle
            if (editingProduct && editingProduct.id === productId) {
                resetForm();
            }

        } catch (err) {
            console.error("Silme hatası:", err);
            alert("Silinemedi: " + err.message);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product); // Hangi ürünü düzenlediğimizi hatırla
        // Formu o ürünün bilgileriyle doldur
        setProductName(product.name);
        setProductPrice(product.price);
        setProductDescription(product.description || '');
        setFormError(null);
    };

    const resetForm = () => {
        setEditingProduct(null); // Düzenleme modundan çık
        setProductName('');
        setProductPrice('');
        setProductDescription('');
        setFormError(null);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setFormError(null);

        const payload = {
            name: productName,
            price: productPrice,
            description: productDescription
        };

        try {
            if (editingProduct) {
                // --- GÜNCELLEME (PUT) ---
                const response = await apiClient.post(`/restaurant-panel/menu/products/${editingProduct.id}`, payload);
                
                // Listeyi güncelle (Eski ürünü bul, yenisiyle değiştir)
                setPanelData(prev => ({
                    ...prev,
                    menu: prev.menu.map(p => p.id === editingProduct.id ? response.data : p)
                }));
                alert("Ürün güncellendi!");

            } else {
                // --- YENİ EKLEME (POST) ---
                const response = await apiClient.post('/restaurant-panel/menu/products', payload);
                
                // Listeye ekle
                setPanelData(prev => ({
                    ...prev,
                    menu: [...prev.menu, response.data]
                }));
                alert("Ürün eklendi!");
            }
            
            resetForm(); // İşlem bitince formu temizle

        } catch (err) {
            console.error("Kaydetme hatası:", err);
            setFormError(err.response?.data?.message || "Bir hata oluştu.");
        }
    };



    // --- 5. GÖRÜNÜM (Render) ---
    if (loading) return <div>Restoran Paneliniz Yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;
    if (!panelData) return <div>Restoran bilgisi bulunamadı.</div>;

    // Veri geldiyse:
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Başlık ve Durum (Aynı) */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">{panelData.restaurantName} <span className="text-sm font-normal text-gray-500">| Yönetim Paneli</span></h2>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${panelData.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {panelData.isAvailable ? "● AÇIK" : "○ KAPALI"}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- SOL SÜTUN --- */}
                    <div className="space-y-6">
                        {/* Dükkan Kontrolü */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dükkan Kontrolü</h3>
                            {panelData.approvalStatus === 'APPROVED' ? (
                                <button 
                                    onClick={handleToggleAvailability}
                                    className={`w-full py-3 rounded-lg font-bold text-white transition ${panelData.available ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                                >
                                    {panelData.available ? "Dükkanı KAPAT" : "Dükkanı AÇ"}
                                </button>
                            ) : (
                                <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm">Onay Bekleniyor</div>
                            )}
                        </div>

                        {/* Ürün Ekleme/Güncelleme Formu */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                                {editingProduct ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                            </h3>
                            
                            <form onSubmit={handleSaveProduct} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün Adı</label>
                                    <input type="text" className="w-full p-2 border rounded text-gray-900" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fiyat (TL)</label>
                                    <input type="number" step="0.01" className="w-full p-2 border rounded text-gray-900" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                                    <textarea rows="2" className="w-full p-2 border rounded text-gray-900" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                                </div>
                                
                                <button type="submit" className={`w-full font-semibold py-2 rounded text-white transition ${editingProduct ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {editingProduct ? "Güncelle" : "+ Ekle"}
                                </button>
                                
                                {editingProduct && (
                                    <button type="button" onClick={resetForm} className="w-full text-gray-500 text-sm hover:underline mt-2">
                                        İptal Et (Yeni Ekle)
                                    </button>
                                )}

                                {formError && <p className="text-red-500 text-xs text-center">{formError}</p>}
                            </form>
                        </div>
                    </div>

                    {/* --- SAĞ SÜTUN (LİSTE) --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 font-semibold text-gray-800">
                                Menü Listesi ({panelData.menu.length})
                            </div>
                            <div className="divide-y divide-gray-100">
                                {panelData.menu.map(product => (
                                    <div key={product.id} className={`p-6 flex justify-between items-center hover:bg-gray-50 transition ${editingProduct?.id === product.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{product.name}</h4>
                                            <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <span className="text-green-600 font-bold text-xl">{product.price} TL</span>
                                            
                                            <div className="flex gap-2">
                                                {/* Düzenle Butonu */}
                                                <button 
                                                    onClick={() => handleEditClick(product)}
                                                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                                                >
                                                    Düzenle
                                                </button>
                                                
                                                {/* Sil Butonu */}
                                                <button 
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                                                >
                                                    Sil
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {panelData.menu.length === 0 && <div className="p-8 text-center text-gray-400">Menü boş.</div>}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default RestaurantPanelPage;