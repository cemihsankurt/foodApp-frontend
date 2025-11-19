import React, { useState, useEffect } from 'react'; // React'in "Hafıza" (useState) ve "Efekt" (useEffect) kancalarını import et
import apiClient from '../api.js'; // Backend ile konuşan "telefonumuzu" (axios) import et
import { Link } from 'react-router-dom'; // Sayfalar arası geçiş için Link bileşenini import et
import RestaurantCard from '../context/RestaurantCard.jsx';

function HomePage() {

    // --- 1. HAFIZA (State) ---
    // Backend'den gelen restoran listesini saklamak için bir "kutu" oluştur.
    // Başlangıçta bu liste boştur: []
    const [restaurants, setRestaurants] = useState([]);
    
    // Yükleme durumunu saklamak için (Kullanıcıya "Yükleniyor..." göstermek için)
    const [loading, setLoading] = useState(true);
    
    // Hata durumunu saklamak için
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    // --- 2. EYLEM (useEffect) ---
    // Bu 'useEffect' bloğu, sayfa İLK AÇILDIĞINDA SADECE BİR KEZ çalışır.
    useEffect(() => {
        
        // Asenkron (async) bir fonksiyon tanımlayıp,
        // bu fonksiyonun içinde backend'den veriyi çekiyoruz.
        const fetchRestaurants = async () => {
            try {
                // Backend'imizin public (herkese açık) endpoint'ine GET isteği at
                const response = await apiClient.get('/restaurants');
                
                // Gelen veriyi (response.data) hafızaya (state) kaydet
                setRestaurants(response.data);
                
            } catch (err) {
                // Bir hata olursa (backend çalışmıyorsa vb.)
                setError(err.message);
                console.error("Restoranlar çekilirken hata oluştu:", err);
            } finally {
                // Her durumda (başarılı veya hatalı) yüklemeyi bitir
                setLoading(false);
            }
        };

        fetchRestaurants(); // Fonksiyonu çağır

    }, []);// Sonundaki '[]' -> "Bu efekti sadece 1 kez çalıştır" demektir.
    
    const filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.cuisineType && restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    

    // --- 3. GÖRÜNÜM (Render) ---
    
    // Eğer hâlâ yükleniyorsa...
    if (loading) {
        return <div>Restoranlar Yükleniyor...</div>;
    }

    // Eğer bir hata oluştuysa...
    if (error) {
        return <div style={{ color: 'red' }}>Hata: {error}</div>;
    }

    // Yükleme bittiyse ve hata yoksa, listeyi göster:
    return (
    <div className="min-h-screen w-full bg-gray-50">

        {/* HERO BÖLÜMÜ — tam genişlik */}
        <div className="w-full relative bg-red-600 text-white py-20 px-4 text-center shadow-xl overflow-hidden">
            
            <div className="relative z-10">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
                    İYTE YEMEK
                </h1>

                {/* Arama Input */}
                <div className="max-w-2xl mx-auto relative">
                    <input 
                        type="text" 
                        placeholder="Hangi yemeği veya restoranı arıyorsun?" 
                        className="w-full py-4 px-6 rounded-full text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute right-2 top-2 bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-full font-semibold transition duration-200">
                        Ara
                    </button>
                </div>
            </div>
        </div>

        {/* RESTORAN LİSTESİ — container kaldırıldı → full width */}
        <div className="w-full px-4 md:px-10 -mt-10 relative z-20">

            <div className="w-full bg-white rounded-t-xl p-6 border-b border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    🍽️ Siparişe Açık Restoranlar
                    {searchTerm && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            ({filteredRestaurants.length} sonuç)
                        </span>
                    )}
                </h2>
            </div>

            <div className="w-full bg-white rounded-b-xl p-6 shadow-sm min-h-[300px]">

                {/* Boş Liste */}
                {filteredRestaurants.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-xl">
                            {searchTerm 
                                ? `"${searchTerm}" ile eşleşen restoran bulunamadı.` 
                                : "Şu anda açık restoran bulunmamaktadır."}
                        </p>
                    </div>
                )}

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRestaurants.map(r => (
                        <RestaurantCard key={r.id} restaurant={r} />
                    ))}
                </div>
            </div>
        </div>
    </div>
);

}

export default HomePage;