// 사장단 웹 푸시 서비스 워커: 서버가 보낸 알림을 띄우고, 누르면 해당 글로 이동
self.addEventListener("push", (event) => {
  let data = { title: "사장단", body: "새 알림이 있어요", url: "/notifications" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // 형식이 다른 메시지는 기본 문구로 표시
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
