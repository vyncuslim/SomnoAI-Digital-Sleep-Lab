
/**
 * SomnoAI Browser Notification Service
 * Native browser notifications for immediate feedback.
 */

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  sendNotification: (title: string, body: string, icon: string = 'https://img.icons8.com/fluency/96/moon.png') => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      console.warn("Notifications are not enabled or supported.");
      return;
    }

    try {
      new Notification(title, {
        body,
        icon,
      });
    } catch (e) {
      console.error("Error sending notification:", e);
    }
  }
};
