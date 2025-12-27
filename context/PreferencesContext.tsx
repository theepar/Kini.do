import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type StartWeekDay = 'sunday' | 'monday' | 'saturday';

interface PreferencesContextType {
    startWeekOn: StartWeekDay;
    setStartWeekOn: (day: StartWeekDay) => Promise<void>;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    deadlineReminders: boolean;
    setDeadlineReminders: (enabled: boolean) => Promise<void>;
    dailyDigest: boolean;
    setDailyDigest: (enabled: boolean) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_KEY = '@app_preferences';

interface Preferences {
    startWeekOn: StartWeekDay;
    notificationsEnabled: boolean;
    deadlineReminders: boolean;
    dailyDigest: boolean;
}

const defaultPreferences: Preferences = {
    startWeekOn: 'monday',
    notificationsEnabled: true,
    deadlineReminders: true,
    dailyDigest: false,
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
        await savePreferences({ ...preferences, dailyDigest: enabled });
    };

    return (
        <PreferencesContext.Provider
            value={{
                startWeekOn: preferences.startWeekOn,
                setStartWeekOn,
                notificationsEnabled: preferences.notificationsEnabled,
                setNotificationsEnabled,
                deadlineReminders: preferences.deadlineReminders,
                setDeadlineReminders,
                dailyDigest: preferences.dailyDigest,
                setDailyDigest,
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
