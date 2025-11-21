import React from 'react';
import { Outlet } from 'react-router-dom'; 
import Navbar from './context/Navbar'; // 👈 YENİ: Navbar bileşenini buradan çağırıyoruz
// import { useAuth } from './context/AuthContext.jsx'; 

function App() {
  // Navbar bileşeni kendi içinde Auth kontrolünü yaptığı için
  // burada user, logout vb. çekmene gerek kalmadı. Kod sadeleşti.

  return (
    <div className="min-h-screen w-full bg-gray-50">
        
        {/* --- ESKİ <nav> KODLARINI SİLDİK --- */}
        {/* --- YERİNE BUNU KOYDUK: --- */}
        <Navbar />

        {/* --- İÇERİK ALANI --- */}
        {/* Navbar fixed olduğu için içeriğin altında kalmaması adına padding-top (pt-16) veriyoruz */}
        <main className="pt-16"> 
            <Outlet /> 
        </main>
    </div>
  );
}

export default App;