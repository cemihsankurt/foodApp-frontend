import axios from 'axios';

// 1. Backend'imizin ana adresini bir değişkene atayalım
const API_URL = 'http://localhost:8080/api'; // (v1 kullanmıyorduk sanırım)

// 2. 'axios' için yeni bir "instance" (örnek) oluşturalım
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json" 
    }
});

// 3. İŞTE SİHİRLİ INTERCEPTOR (Kesici)
// Bu, 'apiClient' üzerinden atılan HER İSTEĞİ göndermeden önce yakalar
apiClient.interceptors.request.use(
    (config) => {
        // 4. Hafızadan ('localStorage') token'ı oku
        const token = localStorage.getItem('authToken');
        
        // 5. Eğer token varsa, isteğin 'Authorization' başlığına ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config; // İsteğin gitmesine izin ver
    },
    (error) => {
        // Hata olursa
        return Promise.reject(error);
    }
);

// 6. Bu ayarlanmış 'apiClient'ı projenin kullanması için 'export' et
export default apiClient;