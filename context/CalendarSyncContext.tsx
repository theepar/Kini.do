import AsyncStorage from '@react-native-async-storage/async-storage';
import { uuid } from 'expo-modules-core';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { CalendarEvent, googleCalendar } from '@/services/googleCalendar';
import { useAuth } from './AuthContext';
import { Task, useTasks } from './TaskContext';

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
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function CalendarSyncProvider({ children }: { children: React.ReactNode }) {
    const { session, googleAccessToken, refreshGoogleToken } = useAuth();
    const { tasks, addTask, updateTask } = useTasks();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);
    const [autoSyncEnabled, setAutoSyncEnabledState] = useState(true);
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isSyncingRef = useRef(false);
    const tasksRef = useRef(tasks);

    // Local mapping for shared tasks: { taskId: googleEventId }
    const [sharedEventMap, setSharedEventMap] = useState<Record<string, string>>({});

    // Update ref whenever tasks change to prevent stale closures in setInterval
    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Load shared event mapping
    useEffect(() => {
        const loadMap = async () => {
            if (session?.user?.id) {
                try {
                    const json = await AsyncStorage.getItem(`@kini_shared_map_${session.user.id}`);
                    if (json) setSharedEventMap(JSON.parse(json));
                } catch (e) {
                    console.error('Failed to load shared event map', e);
                }
            }
        };
        loadMap();
    }, [session?.user?.id]);

    const saveSharedMap = async (newMap: Record<string, string>) => {
        setSharedEventMap(newMap);
        if (session?.user?.id) {
            await AsyncStorage.setItem(`@kini_shared_map_${session.user.id}`, JSON.stringify(newMap));
        }
    };

    // Auto-sync on app foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [autoSyncEnabled, session]);

    // Interval-based sync every 1 minute
    useEffect(() => {
        if (autoSyncEnabled && session) {
            syncIntervalRef.current = setInterval(() => {
                if (!isSyncingRef.current) {
                    performSync();
                }
            }, SYNC_INTERVAL_MS);
            console.log('Auto-sync interval started');
        } else {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        }
        return () => {
            if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
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
            if (lastSync) setLastSyncTime(new Date(lastSync));
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

    const getAccessToken = (): string | null => googleAccessToken || null;

    const safeParseDate = (dateTimeStr: string | undefined): Date | null => {
        if (!dateTimeStr) return null;
        try {
            const date = new Date(dateTimeStr);
            if (isNaN(date.getTime()) || date.getFullYear() < 1970 || date.getFullYear() > 2100) return null;
            return date;
        } catch { return null; }
    };

    const mapEventToTask = (event: CalendarEvent): Partial<Task> | null => {
        const startDate = safeParseDate(event.start?.dateTime || event.start?.date);
        if (!startDate) return null;

        // Use local date string format for consistency
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const timeStr = startDate.getHours().toString().padStart(2, '0') + ':' +
            startDate.getMinutes().toString().padStart(2, '0');

        return {
            title: event.summary,
            description: event.description || '',
            date: dateStr,
            time: event.start?.dateTime ? timeStr : undefined,
            googleCalendarEventId: event.id,
            syncToGoogle: true,
            priority: 'medium',
            isCompleted: false,
        };
    };

    const performSync = async () => {
        if (isSyncingRef.current) return;
        const accessToken = getAccessToken();
        if (!accessToken) return;

        isSyncingRef.current = true;
        setIsSyncing(true);
        setSyncError(null);

        try {
            // 1. PULL: Get Upcoming Events
            const events = await googleCalendar.getUpcomingEvents(accessToken, 50);
            const currentTasks = tasksRef.current; // Use fresh ref

            for (const event of events) {
                const mappedTask = mapEventToTask(event);
                if (!mappedTask) continue;

                // Check Global DB ID first, then Local Map
                const existingTask = currentTasks.find(t =>
                    t.googleCalendarEventId === event.id ||
                    sharedEventMap[t.id] === event.id
                );

                if (existingTask) {
                    if (existingTask.title !== mappedTask.title || existingTask.date !== mappedTask.date || existingTask.time !== mappedTask.time) {
                        // Only update if we are owner (DB sync) or maybe implement local update for shared?
                        // For now, prioritize App Data over Google Calendar change to avoid conflict wars, or only update if we are owner.
                        if (existingTask.ownerId === session?.user?.id) {
                            updateTask(existingTask.id, mappedTask);
                        }
                    }
                } else {
                    // Import new event as my task
                    const newTask: Task = {
                        ...(mappedTask as Task),
                        id: uuid.v4(),
                        ownerId: session?.user?.id,
                    };
                    addTask(newTask);
                }
            }

            // 2. PUSH: Shared Tasks (Auto-Sync to Google)
            // Check tasks that are SHARED (not owned), have dates, but NO local mapping yet.
            for (const t of currentTasks) {
                if (t.ownerId && t.ownerId !== session?.user?.id && t.date) {
                    // It's a shared task. Check if we already synced it.
                    if (!sharedEventMap[t.id]) {
                        // Not synced yet. Push it!
                        console.log('Auto-syncing shared task to Google:', t.title);
                        const event = await googleCalendar.createEvent(accessToken, t as any);
                        if (event?.id) {
                            const newMap = { ...sharedEventMap, [t.id]: event.id };
                            await saveSharedMap(newMap);
                        }
                    }
                }
            }

            await updateLastSyncTime();
        } catch (error: any) {
            if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
                const refreshed = await refreshGoogleToken();
                if (!refreshed) {
                    AsyncStorage.removeItem('kini_google_token').catch(() => { });
                    setSyncError('Token Google expired.');
                }
            } else {
                setSyncError(error.message || 'Gagal sync');
            }
        } finally {
            setIsSyncing(false);
            isSyncingRef.current = false;
        }
    };

    const setAutoSyncEnabled = async (enabled: boolean) => {
        setAutoSyncEnabledState(enabled);
        await AsyncStorage.setItem(SYNC_SETTINGS_KEY, JSON.stringify({ autoSyncEnabled: enabled }));
        if (enabled && session) performSync();
    };

    const syncNow = useCallback(async () => {
        if (!autoSyncEnabled) return;
        await performSync();
    }, [autoSyncEnabled, session]); // tasks dependency removed, handled by ref

    const syncTask = useCallback(async (
        taskId: string,
        action: 'create' | 'update' | 'delete',
        taskData?: any
    ): Promise<string | null> => {
        if (!autoSyncEnabled) return null;
        const accessToken = getAccessToken();
        if (!accessToken) return null;

        const currentTask = tasksRef.current.find(t => t.id === taskId);
        const isShared = currentTask && currentTask.ownerId !== session?.user?.id;

        // For shared tasks, use local mapping ID
        const localEventId = isShared ? sharedEventMap[taskId] : null;
        const effectiveEventId = isShared ? localEventId : taskData?.googleCalendarEventId;

        try {
            let eventId: string | null = null;

            switch (action) {
                case 'create':
                    if (taskData) {
                        const event = await googleCalendar.createEvent(accessToken, taskData);
                        eventId = event?.id || null;
                        if (eventId) {
                            if (isShared) {
                                // Save to local map
                                const newMap = { ...sharedEventMap, [taskId]: eventId };
                                await saveSharedMap(newMap);
                            } else {
                                // Update DB
                                updateTask(taskId, { googleCalendarEventId: eventId });
                            }
                        }
                    }
                    break;

                case 'update':
                    if (effectiveEventId) {
                        await googleCalendar.updateEvent(accessToken, effectiveEventId, taskData);
                        eventId = effectiveEventId;
                    } else if (taskData) {
                        // Fallback create
                        const event = await googleCalendar.createEvent(accessToken, taskData);
                        eventId = event?.id || null;
                        if (eventId) {
                            if (isShared) {
                                const newMap = { ...sharedEventMap, [taskId]: eventId };
                                await saveSharedMap(newMap);
                            } else {
                                updateTask(taskId, { googleCalendarEventId: eventId });
                            }
                        }
                    }
                    break;

                case 'delete':
                    if (effectiveEventId) {
                        await googleCalendar.deleteEvent(accessToken, effectiveEventId);
                        if (isShared) {
                            const newMap = { ...sharedEventMap };
                            delete newMap[taskId];
                            await saveSharedMap(newMap);
                        }
                    }
                    break;
            }

            await updateLastSyncTime();
            return eventId;
        } catch (error: any) {
            console.error(`Error syncing task ${action}:`, error);
            return null;
        }
    }, [autoSyncEnabled, session, sharedEventMap]); // tasks handled by ref

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
