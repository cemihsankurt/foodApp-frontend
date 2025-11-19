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

    console.log(addresses);

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
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div>
                <h2>Sepetiniz</h2>
                <p>Sepetiniz şu anda boş.</p>
                <Link to="/">Restoranlara Göz At</Link>
            </div>
        );
    }

    // Sepet DOLUYSA:
    return (
        // Ana Konteyner: Ortalanmış, padding'li
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-2">Sepetim</h2>

            {/* Grid Layout: Sol (2/3) - Sağ (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* -------------------- SOL SÜTUN: ÜRÜNLER LİSTESİ -------------------- */}
                <div className="lg:col-span-2 space-y-4">
                    
                    {/* Her zaman Restoran adı görünmeli (varsayımsal) */}
                    <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-gray-400">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Restoran: {cart.restaurantName || 'Sepetinizdeki Tek Restoran'}
                        </h3>
                    </div>

                    {/* Sepet Ürünleri Listesi */}
                    <div className="space-y-3">
                        {cart.items.map(item => (
                            <div key={item.productId} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border">
                                
                                {/* Ürün Adı ve Fiyat */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-800">{item.productName}</h4>
                                    <p className="text-sm text-gray-500">
                                        {item.unitPrice} TL x {item.quantity} Adet 
                                        = <strong className="text-red-600">{item.lineTotalPrice} TL</strong>
                                    </p>
                                </div>
                                
                                {/* Miktar ve Silme Butonları */}
                                <div className="flex items-center space-x-3">
                                    {/* (Buraya Adet Artırma/Azaltma butonu gelecek) */}
                                    <button 
                                        onClick={() => handleRemoveItem(item.productId)}
                                        className="text-gray-400 hover:text-red-600 transition"
                                        title="Sepetten Sil"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* -------------------- SAĞ SÜTUN: ÖZET VE ADRES -------------------- */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* ADRES SEÇİMİ */}
                    <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-500">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Teslimat Adresi Seçin</h3>
                        
                        {/* ... (loadingAddresses ve error logic) ... */}
                        
                        {!loadingAddresses && addresses.length === 0 && (
                            <Link to="/my-addresses" className="block mt-3 text-sm text-red-600 hover:underline">
                                Lütfen teslimat adresi ekleyin.
                            </Link>
                        )}

                        {addresses.length > 0 && (
                            <>
                                <select 
                                    value={selectedAddressId} 
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                >
                                    <option value="">-- Lütfen bir adres seçin --</option>
                                    {addresses.map(address => (
                                        <option key={address.id} value={address.id}> 
                                            {address.addressTitle} ({address.district})
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                        
                    </div>

                    <div className="mt-4">
                             <label className="block text-sm font-medium text-gray-700 mb-1">Sipariş Notu (İsteğe Bağlı)</label>
                             <textarea
                                 className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                 rows="3"
                                 placeholder="Örn: Soğan olmasın, zili çalmayın..."
                                 value={orderNote}
                                 onChange={(e) => setOrderNote(e.target.value)}
                             />
                    </div>

                    
                    
                    {/* SİPARİŞ ÖZETİ */}
                    <div className="bg-gray-50 p-5 rounded-xl shadow-lg border-t-4 border-red-500">
                        <div className="space-y-3 text-gray-700">
                            <h3 className="text-xl font-bold mb-4">Sepet Özeti</h3>
                            <div className="flex justify-between border-b pb-3">
                                <span>Toplam Ürün Adedi:</span>
                                <span>{cart.totalItemCount}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold pt-2 text-green-700">
                                <span>Genel Toplam:</span>
                                <span>{cart.cartTotal} TL</span> {/* User's DTO field is 'cartTotal' */}
                            </div>
                        </div>

                        {/* SİPARİŞİ TAMAMLA BUTONU */}
                        <button 
                            onClick={handleCreateOrder} 
                            disabled={!selectedAddressId || cart.totalItemCount === 0}
                            className={`w-full mt-6 py-3 rounded-lg font-bold text-lg transition duration-200 
                                ${selectedAddressId 
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl' 
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                }`}
                        >
                            Siparişi Tamamla
                        </button>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default CartPage;