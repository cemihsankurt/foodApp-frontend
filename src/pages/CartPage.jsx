import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Global hafızamızı import et
import { Link, useNavigate } from 'react-router-dom'; // Yönlendirme için
import apiClient from '../api.js'; // "Siparişi Tamamla" için

function CartPage() {
    
    // 1. Global hafızadan 'cart' (sepet) bilgisini çek
    const { cart, setCart } = useAuth(); // (setCart'ı da al, silme işlemi için lazım)
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]); // Adres listesini tut
    const [selectedAddressId, setSelectedAddressId] = useState(''); // Seçilen adresi tut
    const [error, setError] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [orderNote,setOrderNote] = useState('');
    const [itemLoading, setItemLoading] = useState(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await apiClient.get('/customer/addresses');
                setAddresses(response.data);
            } catch (err) {
                console.error("Adresler çekilirken hata:", err);
                setError("Adresleriniz yüklenirken bir hata oluştu.");
            } finally {
                setLoadingAddresses(false);
            }
        };
        
        fetchAddresses();
    }, []);

    const handleIncrease = async (productId) => {
        setItemLoading(productId); 
        try {
            const response = await apiClient.post('/cart/add', {
                productId: productId,
                quantity: 1
            });
            setCart(response.data); 
        } catch (err) {
            console.error("Artırma hatası:", err);
        } finally {
            setItemLoading(null);
        }
    };

    const handleDecrease = async (productId, currentQty) => {
        // Eğer miktar 1 ise ve azaltmaya basıldıysa, komple sil
        if (currentQty === 1) {
            handleRemoveItem(productId);
            return;
        }

        setItemLoading(productId);
        try {
            // Miktarı -1 olarak gönderiyoruz ki azalsın
            const response = await apiClient.post('/cart/decrease', { 
                productId: productId,
                quantity: -1 
            });
            setCart(response.data);
        } catch (err) {
            console.error("Azaltma hatası:", err);
        } finally {
            setItemLoading(null);
        }
    };

    const handleCreateOrder = async () => {
        
        // Güvenlik kontrolü: Adres seçilmiş mi?
        if (!selectedAddressId) {
            alert("Lütfen bir teslimat adresi seçin.");
            return;
        }
        
        try {
            // Backend'in 'createOrderFromCart' endpoint'ini çağır
            // Body olarak seçilen 'addressId'yi yolla
            console.log("Gönderilen body:", { addressId: selectedAddressId });
            const response = await apiClient.post('/orders/create-from-cart', {
                addressId: selectedAddressId,
                note: orderNote
            });

            

            // BAŞARILI!
            console.log("Sipariş oluşturuldu:", response.data);
            alert("Siparişiniz başarıyla alındı!");

            // Sepeti temizle (global hafızada)
            setCart(null); 
            
            // Kullanıcıyı "Siparişlerim" sayfasına yönlendir (yakında yapacağız)
            // navigate('/my-orders');
            navigate('/'); // Şimdilik ana sayfaya atalım

        } catch (err) {
            console.error("Sipariş oluşturulurken hata:", err);
            // (Belki token süresi dolmuştur?)
            if (err.response && err.response.status === 401) {
                logout(); // Otomatik çıkış yaptır
                navigate('/login');
            } else {
                alert("Sipariş oluşturulurken bir hata oluştu: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleRemoveItem = async (productId) => {
        
        
        console.log("Siliniyor:", productId);

        try {
            // Backend'deki 'removeFromCart' endpoint'ini çağır
            const response = await apiClient.delete(`/cart/remove/${productId}`);
            
            // Backend, sepetin son halini (güncel CartDto) döndürecek.
            // Bu yeni DTO'yu alıp global hafızayı güncelle.
            setCart(response.data); 
            console.log("Ürün silindi, sepet güncellendi:", response.data);

        } catch (err) {
            console.error("Sepetten silerken hata:", err);
            alert("Ürün sepetten silinirken bir hata oluştu: " + (err.response?.data?.message || err.message));
        }
    };

    // (Buraya 'handleCreateOrder' (Siparişi Tamamla) fonksiyonu gelecek)

    // 2. GÖRÜNÜM (Render)

    // Sepet yüklenmemişse veya boşsa
    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* BAŞLIK */}
                <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Sepetim</h2>
                </div>

                {/* BOŞ SEPET KONTROLÜ */}
                {!cart || !cart.items || cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 text-center animate-fade-in">
                        <div className="bg-gray-50 p-6 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Sepetin şu an boş 😔</h3>
                        <p className="text-gray-500 mb-8 max-w-md">Lezzetli yemekler seni bekliyor! Hemen restoranlara göz at.</p>
                        <Link to="/" className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all transform hover:-translate-y-1">
                            Restoranları Keşfet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* --- SOL: ÜRÜNLER --- */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Restoran Kartı */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center gap-3">
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Restoran</p>
                                    <h3 className="text-xl font-bold text-gray-800">{cart.restaurantName}</h3>
                                </div>
                            </div>

                            {/* Ürün Listesi */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                {cart.items.map(item => (
                                    <div key={item.productId} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        
                                        {/* Ürün Adı ve Fiyatı */}
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-800">{item.productName}</h4>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{item.unitPrice} TL</span> 
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Miktar ve Butonlar */}
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                            <div className="text-lg font-bold text-red-600 w-24 text-right">
                                                {item.lineTotalPrice} TL
                                            </div>

                                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                                                {/* AZALT (-) */}
                                                <button 
                                                    onClick={() => handleDecrease(item.productId, item.quantity)}
                                                    disabled={itemLoading === item.productId}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                
                                                {/* MİKTAR VEYA LOADİNG */}
                                                {itemLoading === item.productId ? (
                                                    <span className="w-8 flex justify-center"><div className="animate-spin h-4 w-4 border-2 border-red-500 rounded-full border-t-transparent"></div></span>
                                                ) : (
                                                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                                                )}
                                                
                                                {/* ARTIR (+) */}
                                                <button 
                                                    onClick={() => handleIncrease(item.productId)}
                                                    disabled={itemLoading === item.productId}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* SİL (Çöp Kutusu) */}
                                            <button 
                                                onClick={() => handleRemoveItem(item.productId)}
                                                disabled={itemLoading === item.productId}
                                                className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- SAĞ: ÖZET VE ADRES --- */}
                        <div className="lg:col-span-1 space-y-6 sticky top-6">
                            
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Teslimat
                                </h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Adres Seçiniz</label>
                                    {!loadingAddresses && addresses.length === 0 ? (
                                        <Link to="/my-addresses" className="flex items-center justify-center w-full p-3 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium">
                                            + Yeni Adres Ekle
                                        </Link>
                                    ) : (
                                        <div className="relative">
                                            <select 
                                                value={selectedAddressId} 
                                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                                className="w-full appearance-none p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="">-- Adres Seçiniz --</option>
                                                {addresses.map(addr => (
                                                    <option key={addr.id} value={addr.id}>{addr.addressTitle} ({addr.district})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Sipariş Notu</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 resize-none"
                                        rows="2"
                                        placeholder="Örn: Zili çalmayın"
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                                <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2">Özet</h3>
                                <div className="flex justify-between items-center text-2xl font-bold mb-6">
                                    <span>Toplam</span>
                                    <span className="text-red-400">{cart.cartTotal} TL</span>
                                </div>
                                <button 
                                    onClick={handleCreateOrder} 
                                    disabled={!selectedAddressId || cart.totalItemCount === 0}
                                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${selectedAddressId ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                >
                                    Siparişi Onayla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CartPage;