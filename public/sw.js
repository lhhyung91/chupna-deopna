// 저녁 알림 전용 서비스 워커. 오프라인 캐시는 하지 않는다.
self.addEventListener('push', (event) => {
  const { title, body } = event.data ? event.data.json() : {};
  if (!title) return;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/logo_app_192.png',
      data: { url: '/?day=tomorrow' },
    })
  );
});

// 알림은 내일 날씨 이야기라, 눌렀을 때 내일 탭으로 연다.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data.url, self.location.origin).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((client) => 'navigate' in client);
        return open
          ? open.navigate(url).then((client) => client?.focus())
          : self.clients.openWindow(url);
      })
  );
});
