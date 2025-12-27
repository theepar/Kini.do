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
            trigger: trigger as any,
        });

        return id;
    },

    async cancelReminder(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    },

    async cancelAllReminders(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async scheduleDailyDigest(hour: number, minute: number): Promise<string> {
        // Cancel first to avoid duplicates (though identifier should handle it if supported)
        // Since we don't know the previous ID easily here, we rely on identifier if possible 
        // OR we just return new ID.
        // Actually, on Android 'identifier' in scheduleNotificationAsync prevents duplicates?
        // Documentation says "If you provide an identifier... it will replace the existing notification".
        // But Android might restart.

        // We'll trust the caller to manage IDs or use a fixed identifier if Expo supports it nicely.
        // Expo supports `identifier` in the request content or schedule options? 
        // `scheduleNotificationAsync` returns Promise<string> (id).

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '☀️ Kini.do Morning',
                body: "Cek rencana harimu! Ada tugas yang harus diselesaikan.",
                data: { type: 'daily-digest' },
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            } as any,
        });
        return id;
    },

    async cancelDailyDigest(id: string): Promise<void> {
        if (id) {
            await Notifications.cancelScheduledNotificationAsync(id);
        }
    },

    async sendImmediateNotification(title: string, body: string): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: null,
        });
    },
};
