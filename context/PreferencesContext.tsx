import { notifications } from '@/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type StartWeekDay = 'sunday' | 'monday' | 'saturday';
export type ThemeMode = 'system' | 'light' | 'dark';

interface PreferencesContextType {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    startWeekOn: StartWeekDay;
    setStartWeekOn: (day: StartWeekDay) => Promise<void>;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    deadlineReminders: boolean;
    setDeadlineReminders: (enabled: boolean) => Promise<void>;
    dailyDigest: boolean;
    setDailyDigest: (enabled: boolean) => Promise<void>;
    dailyDigestTime: string;
    setDailyDigestTime: (time: string) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_KEY = '@app_preferences';

interface Preferences {
    themeMode: ThemeMode;
    startWeekOn: StartWeekDay;
    notificationsEnabled: boolean;
    deadlineReminders: boolean;
    dailyDigest: boolean;
    dailyDigestTime: string;
    dailyDigestNotificationId?: string;
}

const defaultPreferences: Preferences = {
    themeMode: 'system',
    startWeekOn: 'monday',
    notificationsEnabled: true,
    deadlineReminders: true,
    dailyDigest: false,
    dailyDigestTime: '07:00',
};

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setPreferences({ ...defaultPreferences, ...parsed });
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const savePreferences = async (newPreferences: Preferences) => {
        try {
            await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
            setPreferences(newPreferences);
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        await savePreferences({ ...preferences, themeMode: mode });
    };

    const setStartWeekOn = async (day: StartWeekDay) => {
        await savePreferences({ ...preferences, startWeekOn: day });
    };

    const setNotificationsEnabled = async (enabled: boolean) => {
        await savePreferences({ ...preferences, notificationsEnabled: enabled });
    };

    const setDeadlineReminders = async (enabled: boolean) => {
        await savePreferences({ ...preferences, deadlineReminders: enabled });
    };

    const setDailyDigest = async (enabled: boolean) => {
        let notifId = preferences.dailyDigestNotificationId;

        if (enabled) {
            const [h, m] = preferences.dailyDigestTime.split(':').map(Number);
            notifId = await notifications.scheduleDailyDigest(h, m);
        } else {
            if (notifId) {
                await notifications.cancelDailyDigest(notifId);
                notifId = undefined;
            }
        }
        await savePreferences({ ...preferences, dailyDigest: enabled, dailyDigestNotificationId: notifId });
    };

    const setDailyDigestTime = async (time: string) => {
        let notifId = preferences.dailyDigestNotificationId;
        if (preferences.dailyDigest) {
            if (notifId) await notifications.cancelDailyDigest(notifId);
            const [h, m] = time.split(':').map(Number);
            notifId = await notifications.scheduleDailyDigest(h, m);
        }
        await savePreferences({ ...preferences, dailyDigestTime: time, dailyDigestNotificationId: notifId });
    };

    return (
        <PreferencesContext.Provider
            value={{
                themeMode: preferences.themeMode,
                setThemeMode,
                startWeekOn: preferences.startWeekOn,
                setStartWeekOn,
                notificationsEnabled: preferences.notificationsEnabled,
                setNotificationsEnabled,
                deadlineReminders: preferences.deadlineReminders,
                setDeadlineReminders,
                dailyDigest: preferences.dailyDigest,
                setDailyDigest,
                dailyDigestTime: preferences.dailyDigestTime,
                setDailyDigestTime,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}

// Helper function to get the day index for week start
export function getWeekStartIndex(startWeekOn: StartWeekDay): number {
    switch (startWeekOn) {
        case 'sunday': return 0;
        case 'monday': return 1;
        case 'saturday': return 6;
        default: return 1;
    }
}

// Helper to get day name
export function getStartWeekDayName(startWeekOn: StartWeekDay, t: (key: any) => string): string {
    switch (startWeekOn) {
        case 'sunday': return t('sunday');
        case 'monday': return t('monday');
        case 'saturday': return t('saturday');
        default: return t('monday');
    }
}
