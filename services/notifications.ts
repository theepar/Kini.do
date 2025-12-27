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

        const triggerDate = new Date(task.reminderTime);
        if (triggerDate <= new Date()) return null;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Kini.do Reminder',
                body: task.title,
                data: { taskId: task.id },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
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
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '☀️ Kini.do Morning',
                body: "Cek rencana harimu! Ada tugas yang harus diselesaikan.",
                data: { type: 'daily-digest' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
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

    async updateSmartDigest(tasks: any[], hour: number = 7, minute: number = 0): Promise<void> {
        // 1. Cancel previous smart digests
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.content.data?.type === 'smart-digest') {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }

        // 2. Determine Notify Time (Next occurrences)
        const now = new Date();
        const target = new Date();
        target.setHours(hour, minute, 0, 0);

        if (now > target) {
            // If passed today, schedule for tomorrow
            target.setDate(target.getDate() + 1);
        }

        // 3. Filter Tasks for that Target Date (Local Match)
        const year = target.getFullYear();
        const month = String(target.getMonth() + 1).padStart(2, '0');
        const day = String(target.getDate()).padStart(2, '0');
        const targetDateStr = `${year}-${month}-${day}`;

        const tasksForDate = tasks.filter(t => !t.isCompleted && t.date === targetDateStr);

        // 4. Compose Message
        let body = '';
        if (tasksForDate.length === 0) {
            const msgs = [
                "Selamat pagi! 🎉 Hari ini kosong melompong. Nikmati waktu bebasmu! ☕",
                "Wah, hari ini free! Rencanakan liburan mini atau tidur lagi? 😴",
                "Jadwal kosong! Saatnya me time sepenuhnya. 🧘‍♂️",
                "Tidak ada tugas hari ini. Great job clearing your tasks! 🌟"
            ];
            body = msgs[Math.floor(Math.random() * msgs.length)];
        } else {
            const taskTitles = tasksForDate.slice(0, 3).map(t => t.title).join(', ');
            const count = tasksForDate.length;
            const remaining = count > 3 ? `dan ${count - 3} lainnya` : '';

            if (count <= 3) {
                const msgs = [
                    `Selamat pagi! ☀️ Ada ${count} tugas: ${taskTitles}. Yuk selesaikan! 💪`,
                    `Siap produktif? ${count} tugas menunggu: ${taskTitles}. Let's go! 🚀`,
                    `Pagi! Fokus hari ini: ${taskTitles}. Semangat! 📝`
                ];
                body = msgs[Math.floor(Math.random() * msgs.length)];
            } else {
                const msgs = [
                    `Bangun warrior! ⚔️ Ada ${count} tugas menanti: ${taskTitles} ${remaining}. Fokus dan hajar! 🔥`,
                    `Wow, sibuk nih! ${count} tugas di depan mata. Prioritas: ${taskTitles}. Kamu pasti bisa! 💼`,
                    `Challenge hari ini: ${count} tugas. Mulai dari ${taskTitles}... Gaspol! 🏎️`
                ];
                body = msgs[Math.floor(Math.random() * msgs.length)];
            }
        }

        // 5. Schedule
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '☀️ Kini.do Morning',
                body: body,
                data: { type: 'smart-digest', date: targetDateStr },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: target,
            },
        });

        console.log(`Smart digest scheduled for ${targetDateStr} at ${hour}:${minute}`);
    },

    async cancelSmartDigest(): Promise<void> {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.content.data?.type === 'smart-digest') {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
    },
};
