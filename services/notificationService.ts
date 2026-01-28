
/**
 * SomnoAI Browser Notification Service
 * Native browser notifications for immediate feedback.
 */

export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      return false;
    }
  },

  sendNotification: (title: string, body: string, icon: string = 'https://img.icons8.com/fluency/96/moon.png') => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      // Quietly exit instead of warning to keep console clean
      return;
    }

    try {
      // Use a brief timeout to avoid potential race conditions with other UI updates
      setTimeout(() => {
        new Notification(title, {
          body,
          icon,
          silent: false,
          tag: 'somno-alert'
        });
      }, 100);
    } catch (e) {
      // Fail silently for notification errors
    }
  }
};
