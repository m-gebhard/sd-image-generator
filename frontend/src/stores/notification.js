import { defineStore } from 'pinia';

export const useNotificationsStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        lastNotificationId: 0,
    }),
    actions: {
        addNotification(text, type = 'info', duration = 15000) {
            const id = this.lastNotificationId++;
            const notification = {
                id,
                text,
                type,
                duration,
                time: Date.now(),
            };

            notification.timeout = setTimeout(() => {
                const index = this.notifications.findIndex((entry) => entry.id === notification.id);
                this.notifications.splice(index, 1);
            }, notification.duration);

            this.notifications.push(notification);
        },

        removeNotification(id) {
            const index = this.notifications.findIndex((entry) => entry.id === id);
            const notification = this.notifications[index];

            if (notification.timeout) clearTimeout(notification.timeout);

            this.notifications.splice(index, 1);
        },

        clearNotifications() {
            this.notifications.forEach((notification) => {
                if (notification.timeout) clearTimeout(notification.timeout);
            });
            this.notifications = [];
            this.lastNotificationId = 0;
        },
    },
});
