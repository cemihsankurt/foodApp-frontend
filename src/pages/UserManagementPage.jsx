import React, { useState, useEffect } from 'react';
import apiClient from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function UserManagementPage() {
    
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Filtrelenmiş liste
    const [searchTerm, setSearchTerm] = useState(''); // Arama kelimesi
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); 

    useEffect(() => {
        fetchUsers();
    }, []);

    // Arama kutusu değiştikçe listeyi filtrele
    useEffect(() => {
        const results = users.filter(u => 
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.id && u.id.toString().includes(searchTerm))
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users');
            setUsers(response.data);
            setFilteredUsers(response.data); // Başlangıçta hepsi görünür
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (userIdToBan) => {
        if (userIdToBan === user.id) {
            alert("Kendinizi banlayamazsınız.");
            return;
        }
        if(!window.confirm("Kullanıcının durumunu değiştirmek istediğinize emin misiniz?")) return;

        try {
            const response = await apiClient.post(`/admin/users/${userIdToBan}/ban-status`);
            alert("İşlem Başarılı: " + response.data);
            
            // Listeyi güncelle
            setUsers(currentUsers => currentUsers.map(u => 
                u.id === userIdToBan ? { ...u, banned: !u.banned } : u
            ));
        } catch (err) {
            alert("İşlem başarısız: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Kullanıcılar yükleniyor...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Hata: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                {/* --- BAŞLIK VE ARAMA --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h2>
                        <p className="text-gray-500 mt-1">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin.</p>
                    </div>
                    
                    {/* Arama Kutusu */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input 
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm shadow-sm"
                            placeholder="E-posta veya ID ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* --- TABLO --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">Kayıt bulunamadı.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">E-posta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Eylem</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{u.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                                      u.role === 'ROLE_RESTAURANT' ? 'bg-orange-100 text-orange-800' : 
                                                      'bg-blue-100 text-blue-800'}`}>
                                                    {u.role.replace('ROLE_', '')}
                                                </span>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {u.banned ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        🚫 Banlı
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✅ Aktif
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {u.role !== 'ROLE_ADMIN' ? (
                                                    <button 
                                                        onClick={() => handleToggleBan(u.id)}
                                                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                                                            ${u.banned 
                                                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                                                                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
                                                    >
                                                        {u.banned ? "Banı Kaldır" : "Banla"}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">Dokunulmaz</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagementPage;