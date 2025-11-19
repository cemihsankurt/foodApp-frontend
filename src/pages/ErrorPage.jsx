import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

// Bu, React Router'ın 'errorElement' olarak kullanacağı bileşendir
function ErrorPage() {
  const error = useRouteError(); // Hatanın detaylarını alır
  console.error(error); // Geliştirici için hatayı konsola bas

  let title = "Bir Hata Oluştu!";
  let message = "Beklenmedik bir hata meydana geldi.";

  // Eğer 404 (Not Found) hatasıysa...
  if (error.status === 404) {
    title = "404 - Sayfa Bulunamadı";
    message = "Aradığınız sayfa mevcut değil veya taşınmış olabilir.";
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Oops!</h1>
      <h2>{title}</h2>
      <p>{message}</p>
      <Link to="/" style={{ color: 'blue', fontSize: '1.2em' }}>
        Ana Sayfaya Geri Dön
      </Link>
    </div>
  );
}

export default ErrorPage;