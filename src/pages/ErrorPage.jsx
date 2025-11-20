import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError(); // Hatanın kendisi burada
  console.error(error);

  let title = "Bir Hata Oluştu!";
  let message = "Beklenmedik bir hata meydana geldi.";

  if (error.status === 404) {
    title = "404 - Sayfa Bulunamadı";
    message = "Aradığınız sayfa mevcut değil.";
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', wordBreak: 'break-word' }}>
      <h1>Oops!</h1>
      <h2>{title}</h2>
      <p>{message}</p>
      
      {/* 👇 İŞTE BU KISIM HATAYI EKRANA KUSACAK 👇 */}
      <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          marginTop: '20px',
          textAlign: 'left',
          fontSize: '14px',
          fontFamily: 'monospace'
      }}>
          <strong>Teknik Hata Detayı:</strong>
          <br />
          {/* Hata mesajını veya durumunu yazdırıyoruz */}
          {error.statusText || error.message || "Mesaj yok"}
          <br />
          <hr style={{borderColor: '#f5c6cb'}}/>
          {/* Hatanın tamamını JSON olarak döküyoruz */}
          <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>

      <Link to="/" style={{ display:'block', marginTop:'20px', color: 'blue', fontSize: '1.2em' }}>
        Ana Sayfaya Geri Dön
      </Link>
    </div>
  );
}

export default ErrorPage;