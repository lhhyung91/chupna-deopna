// 저녁 알림과, 다시 열 때 저장된 화면부터 보여주기를 맡는 서비스 워커.
const CACHE = 'chupna-deopna-v1';
// 로딩 화면 정책(SplashGate)과 같은 3시간. 그 안에 다시 열면 서버를 기다리지 않는다
const FRESH_MS = 3 * 60 * 60 * 1000;
const CACHED_AT = 'x-cached-at';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 받은 첫 화면에 저장 시각을 붙여 둔다. 본문은 이미 풀린 채 읽히므로 압축·길이 헤더는 뺀다
async function saveHome(copy) {
  if (!copy.ok) return;
  const headers = new Headers(copy.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.set(CACHED_AT, String(Date.now()));
  const body = await copy.blob();
  const cache = await caches.open(CACHE);
  await cache.put('/', new Response(body, { status: copy.status, headers }));
}

async function openHome(event) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match('/');
  const savedAt = Number(saved?.headers.get(CACHED_AT)) || 0;
  // 화면은 받는 대로 흘려보내 바로 그리고, 저장은 뒤에서 한다
  const fromServer = fetch(event.request).then((response) => {
    event.waitUntil(saveHome(response.clone()).catch(() => {}));
    return response;
  });

  if (saved && Date.now() - savedAt < FRESH_MS) {
    // 저장본을 바로 보여주고, 뒤에서 받은 새 화면은 다음에 열 때 쓴다
    event.waitUntil(fromServer.catch(() => {}));
    return saved;
  }
  // 오래됐거나 처음이면 서버를 기다린다(로딩 화면이 덮는다). 서버가 안 되면 저장본이라도 보여준다
  return fromServer.catch(() => saved ?? Response.error());
}

// 해시가 붙은 파일은 바뀌지 않아서, 저장해 두면 배포 뒤에도 저장된 옛 화면이 쓰던 파일을 불러올 수 있다
async function openStatic(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 알림으로 여는 내일 탭(?day=tomorrow)은 늘 서버에서 새로 받는다
  if (request.mode === 'navigate' && url.pathname === '/' && !url.search) {
    event.respondWith(openHome(event));
    return;
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(openStatic(request));
  }
});

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
