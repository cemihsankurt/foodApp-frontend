// Service Worker'ın push etkinliğini dinle
self.addEventListener('push', function(event) {
    // Backend'den gelen payload'u (JSON olarak göndermiştik) al
    const payload = event.data ? event.data.json() : { title: 'Hata', body: 'Payload alınamadı' };

    const title = payload.title;
    const options = {
        body: payload.body,
        icon: '/logo192.png', // public klasöründeki bir ikon
        badge: '/logo192.png',
        // 'data' alanı, bildirime tıklayınca sayfaya veri taşımak için kullanılabilir
        data: {
            url: '/' // Tıklayınca açılacak sayfa (örn: sipariş detayı)
        }
    };

    // Bildirimi göster
    event.waitUntil(self.registration.showNotification(title, options));

    // --- ÖNEMLİ: Açık olan React sayfasına haber ver ---
    // Bu kod, sayfan açıksa ve bildirim gelirse,
    // MyOrdersPage'in "Siparişlerimi yenile" komutunu almasını sağlar.
    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                // 'push-update' mesajı gönder, React component bunu dinleyecek
                client.postMessage({ type: 'push-update' });
            }
        })
    );
});

// Kullanıcı bildirime tıkladığında ne olacağını belirle
self.addEventListener('notificationclick', function(event) {
    // Bildirimi kapat
    event.notification.close();

    // Tıklayınca ana sekmeye odaklan veya yeni sekme aç
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});