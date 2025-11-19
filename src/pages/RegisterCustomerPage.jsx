import React, { useState } from 'react';
import apiClient from '../api.js'; // Backend ile konuşan 'telefonumuz'
import { useNavigate } from 'react-router-dom'; // Yönlendirme için

function RegisterCustomerPage() {
    
    // --- 1. HAFIZA (State) ---
    // Backend'deki 'RegisterCustomerRequestDto'nun beklediği tüm alanlar için
    // hafıza kutuları oluşturalım.
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Hata ve başarı mesajlarını göstermek için
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const navigate = useNavigate(); // Yönlendirici

    // --- 2. EYLEM (Form Gönderme) ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle
        setError(null); // Eski hataları temizle
        setSuccessMessage(null);

        try {
            // Backend'in 'register-customer' endpoint'ine POST isteği at
            const response = await apiClient.post('/auth/register-customer', {
                // DTO'yu hafızadaki verilerle doldur
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phoneNumber: phoneNumber
            });

            // --- BAŞARILI! ---
            // Backend'den 200 OK ve mesaj geldi
            setSuccessMessage(response.data.message); // "Kayıt başarılı! Lütfen e-postanızı kontrol edin."
            
            // Kullanıcıyı 3 saniye sonra login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // --- HATA! ---
            // (Örn: "Bu e-posta zaten kullanılıyor" - 400 Bad Request)
            console.error("Kayıt olurken hata:", err);
            setError(err.response?.data?.message || 'Bir hata oluştu.');
        }
    };

    // --- 3. GÖRÜNÜM (Render) ---
    return (
        // Sayfa Arkaplanı: Açık Gri (Kontaşt sağlamak için)
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 fixed top-0 left-0">

            <div className="w-full max-w-md">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Müşteri Kaydı</h2>
                
                {!successMessage ? (
                    // Form Konteyneri: Beyaz Arkaplan, Gölge
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                        
                        {/* 1. AD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                            <input 
                                type="text"  
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>

                        {/* 2. SOYAD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                            <input 
                                type="text" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)} 
                                required 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900"
                            />
                        </div>

                        {/* 3. E-POSTA */}
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
                        
                        {/* 4. ŞİFRE */}
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

                        {/* 5. TELEFON */}
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
                        
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 mt-6">
                            Müşteri Olarak Kayıt Ol
                        </button>

                    </form>
                ) : (
                    // ... (Başarı mesajı) ...
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md" role="alert">
                        <p className="font-bold">Başarılı!</p>
                        <p>{successMessage}</p>
                        <p className="text-sm mt-2">3 saniye içinde giriş sayfasına yönlendiriliyorsunuz.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegisterCustomerPage;