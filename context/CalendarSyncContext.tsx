import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { googleCalendar } from '@/services/googleCalendar';
import { useAuth } from './AuthContext';

interface CalendarSyncContextType {
    isSyncing: boolean;
    lastSyncTime: Date | null;
    syncError: string | null;
    autoSyncEnabled: boolean;
    setAutoSyncEnabled: (enabled: boolean) => Promise<void>;
    syncNow: () => Promise<void>;
    syncTask: (taskId: string, action: 'create' | 'update' | 'delete', taskData?: any) => Promise<string | null>;
}

const CalendarSyncContext = createContext<CalendarSyncContextType | undefined>(undefined);

const SYNC_SETTINGS_KEY = '@calendar_sync_settings';
const LAST_SYNC_KEY = '@calendar_last_sync';
const SYNC_INTERVAL_MS = 60 * 1000; // 1 minute

export function CalendarSyncProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [autoSyncEnabled, setAutoSyncEnabledState] = useState(true);
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isSyncingRef = useRef(false);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Auto-sync on app foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [autoSyncEnabled, session]);

    // Interval-based sync every 1 minute
    useEffect(() => {
        if (autoSyncEnabled && session) {
            // Start interval
            syncIntervalRef.current = setInterval(() => {
                if (!isSyncingRef.current) {
                    performSync();
                }
            }, SYNC_INTERVAL_MS);

            console.log('Auto-sync interval started (every 1 minute)');
        } else {
            // Stop interval
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
                console.log('Auto-sync interval stopped');
            }
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [autoSyncEnabled, session]);

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem(SYNC_SETTINGS_KEY);
            if (settings) {
                const parsed = JSON.parse(settings);
                setAutoSyncEnabledState(parsed.autoSyncEnabled ?? true);
            }

            const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
            if (lastSync) {
                setLastSyncTime(new Date(lastSync));
            }
        } catch (error) {
            console.error('Error loading sync settings:', error);
        }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && autoSyncEnabled && session) {
            await performSync();
        }
    };

    const updateLastSyncTime = async () => {
        const now = new Date();
        setLastSyncTime(now);
        try {
            await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        } catch (error) {
            console.error('Error saving last sync time:', error);
        }
    };

    const getAccessToken = (): string | null => {
        return session?.access_token || null;
    };

    // Internal sync function
    const performSync = async () => {
        if (isSyncingRef.current) return;

        const accessToken = getAccessToken();
        if (!accessToken) {
            console.log('Sync skipped: no access token');
            return;
        }

        isSyncingRef.current = true;
        setIsSyncing(true);
        setSyncError(null);

        try {
            const events = await googleCalendar.getUpcomingEvents(accessToken, 50);
            console.log(`Fetched ${events.length} events from Google Calendar`);
            await updateLastSyncTime();
        } catch (error: any) {
            // Silently handle auth errors - happens when Google OAuth isn't fully configured
            if (error.message?.includes('401') || error.message?.includes('Invalid Credentials')) {
                console.warn('Calendar sync skipped: Google auth not configured');
            } else {
                console.warn('Sync warning:', error.message);
                setSyncError(error.message || 'Gagal sync dengan Google Calendar');
            }
        } finally {
            setIsSyncing(false);
            isSyncingRef.current = false;
        }
    };

    const setAutoSyncEnabled = async (enabled: boolean) => {
        setAutoSyncEnabledState(enabled);
        try {
            await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify({ autoSyncEnabled: enabled }));

            // If enabling, sync immediately
            if (enabled && session) {
                console.log('Auto-sync enabled, syncing now...');
                await performSync();
            }
        } catch (error) {
            console.error('Error saving sync settings:', error);
        }
    };

    // Public sync function (can be called manually)
    const syncNow = useCallback(async () => {
        if (!autoSyncEnabled) {
            console.log('Sync skipped: autoSync disabled');
            return;
        }
        await performSync();
    }, [autoSyncEnabled, session]);

    const syncTask = useCallback(async (
        taskId: string,
        action: 'create' | 'update' | 'delete',
        taskData?: any
    ): Promise<string | null> => {
        if (!autoSyncEnabled) {
            console.log('Task sync skipped: autoSync disabled');
            return null;
        }

        const accessToken = getAccessToken();
        if (!accessToken) {
            console.log('Task sync skipped: no access token');
            return null;
        }

        try {
            let eventId: string | null = null;

            switch (action) {
                case 'create':
                    if (taskData) {
                        const event = await googleCalendar.createEvent(accessToken, taskData);
                        eventId = event?.id || null;
                        if (eventId) {
                            console.log(`Created calendar event: ${eventId}`);
                        }
                    }
                    break;

                case 'update':
                    if (taskData?.googleCalendarEventId) {
                        await googleCalendar.updateEvent(accessToken, taskData.googleCalendarEventId, taskData);
                        eventId = taskData.googleCalendarEventId;
                        console.log(`Updated calendar event: ${eventId}`);
                    } else if (taskData) {
                        const event = await googleCalendar.createEvent(accessToken, taskData);
                        eventId = event?.id || null;
                    }
                    break;

                case 'delete':
                    if (taskData?.googleCalendarEventId) {
                        await googleCalendar.deleteEvent(accessToken, taskData.googleCalendarEventId);
                        console.log(`Deleted calendar event: ${taskData.googleCalendarEventId}`);
                    }
                    break;
            }

            await updateLastSyncTime();
            return eventId;
        } catch (error: any) {
            console.error(`Error syncing task ${action}:`, error);
            setSyncError(error.message || 'Gagal sync task');
            return null;
        }
    }, [autoSyncEnabled, session]);

    return (
        <CalendarSyncContext.Provider
            value={{
                isSyncing,
                lastSyncTime,
                syncError,
                autoSyncEnabled,
                setAutoSyncEnabled,
                syncNow,
                syncTask,
            }}
        >
            {children}
        </CalendarSyncContext.Provider>
    );
}

export function useCalendarSync() {
    const context = useContext(CalendarSyncContext);
    if (context === undefined) {
        throw new Error('useCalendarSync must be used within a CalendarSyncProvider');
    }
    return context;
}
