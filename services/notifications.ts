import { Task } from '@/types';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notifications = {
    async requestPermissions(): Promise<boolean> {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    },

    async scheduleReminder(task: Task): Promise<string | null> {
        if (!task.reminderTime) return null;

        const trigger = new Date(task.reminderTime);
        if (trigger <= new Date()) return null;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Kini.do Reminder',
                body: task.title,
                data: { taskId: task.id },
            },
            trigger,
        });

        return id;
    },

    async cancelReminder(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    },

    async cancelAllReminders(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },
};
