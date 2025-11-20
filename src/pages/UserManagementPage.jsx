import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';
import { useAuth } from '../context/AuthContext.jsx'; // Admin'in kendi ID'si için

function UserManagementPage() {
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Giriş yapmış olan Admin'in bilgileri

    // 1. Sayfa yüklenince tüm kullanıcıları çek
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users'); // Yeni endpoint
            setUsers(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Banlama / Banı Açma Fonksiyonu
    const handleToggleBan = async (userIdToBan) => {
        // Adminin kendini banlamasını engelle
        if (userIdToBan === user.id) {
            alert("Kendinizi banlayamazsınız.");
            return;
        }

        try {
            // Backend'e isteği at
            const response = await apiClient.post(`/admin/users/${userIdToBan}/ban-status`);
            alert(response.data); // "Kullanıcı banlandı" mesajını göster
            
            // Ekrandaki listeyi anında güncelle
            setUsers(currentUsers =>
                currentUsers.map(u => {
                    // Eğer ID'si, az önce banladığımız/banını açtığımız ID ile eşleşiyorsa...
                    if (u.id === userIdToBan) {
                        // ...o kullanıcının 'banned' durumunu tersine çevir ('true' ise 'false' yap)
                        return { ...u, banned: !u.banned };
                    }
                    // Eşleşmiyorsa, kullanıcıya dokunma, aynen geri döndür
                    return u;
                })
            );
        } catch (err) {
            alert("İşlem başarısız: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>Kullanıcılar yükleniyor...</div>;
    if (error) return <div style={{ color: 'red' }}>Hata: {error}</div>;

    // 3. Tabloyu Ekrana Çiz
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Kullanıcı Yönetimi</h2>
            
            {users.length === 0 ? (
                <p>Kayıtlı kullanıcı bulunmamaktadır.</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Eylem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{u.role}</td>
                                    
                                    {/* Durum: Banned mı, Verified mı? */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${u.banned ? 'bg-red-100 text-red-800' : (u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}`}>
                                            {u.banned ? "Banlı" : (u.verified ? "Aktif" : "Onaylı Hesap")}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Admin kendini banlayamaz, diğer Admin'leri banlayamaz */}
                                        {u.role !== 'ROLE_ADMIN' ? (
                                            <button 
                                                onClick={() => handleToggleBan(u.id, u.isBanned)}
                                                className={`py-1 px-3 rounded-lg text-white transition duration-150 
                                                    ${u.banned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                            >
                                                {u.banned ? "Banı Aç" : "Banla"}
                                            </button>
                                        ) : (
                                            <small className="text-gray-400">(Admin)</small>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default UserManagementPage;