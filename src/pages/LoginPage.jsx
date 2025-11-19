import React, { useState } from 'react'; // React'in "hafızasını" (useState) import et // 1. Adımda kurduğumuz "telefonu" import et
import apiClient from '../api.js';
import { useNavigate } from 'react-router-dom'; // Önceden ayarlanmış axios örneği
import { useAuth } from '../context/AuthContext.jsx';

// Bu bir React Bileşenidir (Component)
function LoginPage() {

    // --- 1. HAFIZA (State) ---
    // React'e, kullanıcının yazdığı e-posta ve şifreyi "hatırlamasını" söyler.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Hata mesajlarını tutmak için

    const navigate = useNavigate();
    const { login } = useAuth(); // Sayfa yönlendirme fonksiyonu

    // --- 2. EYLEM (Form Gönderme) ---
    // "Giriş Yap" butonuna basıldığında bu fonksiyon çalışır.
    const handleLogin = async (e) => {
        // e.preventDefault(), formun sayfayı yenilemesini engeller. Bu React için şarttır.
        e.preventDefault(); 
        setError(null); // Eski hataları temizle

        try {
            // --- 3. BACKEND BAĞLANTISI ---
            // 'axios' ile backend'imizin 'authenticate' endpoint'ine POST isteği at.
            const response = await apiClient.post( 
                '/auth/authenticate', 
                {
                    email: email,
                    password: password
                }
            );

            // 4. BAŞARI!
            // Tarayıcının Konsoluna (F12) gelen token'ı yazdır
            const token = response.data.token;

            login(token); // AuthContext içindeki login fonksiyonunu çağırarak token'ı kaydet
            

            navigate('/'); // Giriş başarılıysa ana sayfaya yönlendir
            
            

        } catch (err) {
            // 5. HATA!
            // Eğer 403 (Yanlış Şifre) veya 400 (Doğrulanmamış) hatası alırsak...
            console.error('GİRİŞ HATASI!', err.response.data);
            
            // GlobalExceptionHandler'dan gelen mesajı ekrana yazdır
            setError(err.response.data.message || 'Bir hata oluştu.');
        }
    };

    // --- 4. GÖRÜNÜM (HTML/JSX) ---
    // Ekranda ne görüneceği
    return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 fixed top-0 left-0">


        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-2xl">

            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Giriş Yap</h2>
                <p className="text-gray-500 mt-2">Hesabınıza erişmek için bilgilerinizi girin.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

                {/* E-POSTA */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white outline-none transition-all"
                    />
                </div>

                {/* ŞİFRE */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white outline-none transition-all"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 font-semibold">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Giriş Yap
                </button>
            </form>

        </div>

    </div>
);

}

export default LoginPage;