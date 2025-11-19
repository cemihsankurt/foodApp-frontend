import React, { useState } from 'react';
import apiClient from '../api.js'; // Backend ile konuşan 'telefonumuz'
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

function RegisterRestaurantPage() {
    
    // --- 1. HAFIZA (State) ---
    // Backend'deki 'RegisterRestaurantRequestDto'nun beklediği alanlar
    // (Restorana özel alanları da ekliyoruz)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    // (Backend DTO'nda 'taxNumber' gibi başka zorunlu alanlar varsa
    //  onları da buraya 'useState' olarak eklemen gerekir)
    
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const navigate = useNavigate(); // Yönlendirici

    // --- 2. EYLEM (Form Gönderme) ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        setError(null); 
        setSuccessMessage(null);

        try {
            // Backend'in 'register-restaurant' endpoint'ine POST isteği at
            const response = await apiClient.post('/auth/register-restaurant', {
                email: email,
                password: password,
                restaurantName: restaurantName,
                phoneNumber: phoneNumber
                // (diğer DTO alanları)
            });

            // --- BAŞARILI! ---
            setSuccessMessage(response.data.message); // "Kayıt başarılı! Lütfen e-postanızı kontrol edin."
            
            // Kullanıcıyı 3 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            // --- HATA! ---
            // (Örn: "Bu e-posta zaten kullanılıyor")
            console.error("Restoran kaydı olurken hata:", err);
            setError(err.response?.data?.message || 'Bir hata oluştu.');
        }
    };

    // --- 3. GÖRÜNÜM (Render) ---
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Restoran Kaydı</h2>
                
                {!successMessage ? (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                        <p className="text-sm text-gray-500 pb-2 border-b border-gray-100">Kayıt sonrası admin onayı beklenir.</p>

                        {/* RESTORAN ADI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Restoran Adı</label>
                            <input 
                                type="text"  
                                value={restaurantName} 
                                onChange={(e) => setRestaurantName(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>

                        {/* E-POSTA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                            <input 
                                type="email"  
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>
                        
                        {/* ŞİFRE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>

                        {/* TELEFON */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                            <input 
                                type="tel" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                        
                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-200 mt-6">
                            Restoran Kaydını Tamamla
                        </button>

                    </form>
                ) : (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md" role="alert">
                        <p className="font-bold">Kayıt Başarılı!</p>
                        <p>{successMessage}</p>
                        <p className="text-sm mt-2">5 saniye içinde giriş sayfasına yönlendiriliyorsunuz. Lütfen admin onayını bekleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegisterRestaurantPage;