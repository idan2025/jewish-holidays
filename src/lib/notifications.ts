export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function scheduleNotification(
  title: string,
  body: string,
  scheduledTime: Date
) {
  const now = new Date().getTime();
  const timeUntil = scheduledTime.getTime() - now;

  if (timeUntil > 0 && Notification.permission === "granted") {
    setTimeout(() => {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "holiday-notification",
      });
    }, timeUntil);
  }
}

export function notifyUpcoming(title: string, minutes: number) {
  if (Notification.permission === "granted") {
    new Notification("Upcoming Event", {
      body: `${title} in ${minutes} minutes`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "upcoming-event",
    });
  }
}
