import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { notifications } from '@/services/notifications';
import { taskService } from '@/services/taskService';

export interface Category {
    id: string;
    name: string; // Translation key or custom name
    color: string;
    icon?: string;
    isDefault?: boolean; // Default categories cannot be deleted
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    tag?: string; // Keep for backward compatibility
    tagColor?: string;
    category?: string; // Category ID
    time?: string; // Display time string e.g., "10:00"
    date?: string; // ISO Date string for filtering
    priority?: 'high' | 'medium' | 'low';
    isCompleted?: boolean;
    flagged?: boolean;
    avatars?: string[];
    notificationId?: string;
    googleCalendarEventId?: string;
    syncToGoogle?: boolean; // Whether to sync this task to Google Calendar
    reminderOffset?: number | null; // Minutes before due time
    updatedAt?: string;
    updatedBy?: string;
    updatedByAvatar?: string;
    sharedWith?: string[]; // Array of emails/IDs
    sharedWithViewers?: string[]; // Array of emails with View Only access
    ownerId?: string; // ID of the task creator
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    initials?: string;
    color?: string;
    img?: string;
    lastShared?: string; // ISO date
}

// Default categories
export const defaultCategories: Category[] = [
    { id: 'personal', name: 'categoryPersonal', color: '#3B82F6', icon: 'person', isDefault: true },
    { id: 'work', name: 'categoryWork', color: '#8B5CF6', icon: 'work', isDefault: true },
    { id: 'home', name: 'categoryHome', color: '#F59E0B', icon: 'home', isDefault: true },
    { id: 'health', name: 'categoryHealth', color: '#10B981', icon: 'favorite', isDefault: true },
    { id: 'shopping', name: 'categoryShopping', color: '#EC4899', icon: 'shopping-cart', isDefault: true },
    { id: 'finance', name: 'categoryFinance', color: '#14B8A6', icon: 'account-balance', isDefault: true },
    { id: 'study', name: 'categoryStudy', color: '#6366F1', icon: 'school', isDefault: true },
    { id: 'other', name: 'categoryOther', color: '#6B7280', icon: 'more-horiz', isDefault: true },
];

interface TaskContextType {
    tasks: Task[];
    categories: Category[];
    contacts: Contact[];
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;
    resetTasks: () => void;
    addCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
    getCategoryById: (id: string) => Category | undefined;
    getCategoryDisplay: (id?: string) => { name: string; color: string; isDefault?: boolean } | null;
    addContact: (contact: Contact) => void;
    deleteContact: (id: string) => void;
}

const TaskContext = createContext<TaskContextType>({
    tasks: [],
    categories: defaultCategories,
    contacts: [],
    addTask: () => { },
    updateTask: () => { },
    deleteTask: () => { },
    toggleTask: () => { },
    resetTasks: () => { },
    addCategory: () => { },
    deleteCategory: () => { },
    getCategoryById: () => undefined,
    getCategoryDisplay: () => null,
    addContact: () => { },
    deleteContact: () => { },
});

const CATEGORIES_KEY = 'kini_categories';
const CONTACTS_KEY = 'kini_contacts';

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTasks();
        loadCategories();
        loadContacts();
    }, [user]);

    // Realtime Subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel('public:tasks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    handleRealtimeUpdate(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const loadCategories = async () => {
        try {
            const storedCategories = await AsyncStorage.getItem(CATEGORIES_KEY);
            if (storedCategories) {
                const customCategories: Category[] = JSON.parse(storedCategories);
                // Filter out any invalid categories (empty name, duplicate IDs, etc.)
                const validCustom = customCategories.filter(
                    custom =>
                        custom.id &&
                        custom.name &&
                        custom.name.trim() !== '' &&
                        custom.color &&
                        !defaultCategories.some(def => def.id === custom.id)
                );
                // Merge default and valid custom categories
                setCategories([...defaultCategories, ...validCustom]);
                // Clean up storage if we filtered out invalid entries
                if (validCustom.length !== customCategories.length) {
                    saveCategories(validCustom);
                }
            } else {
                setCategories(defaultCategories);
            }
        } catch (e) {
            console.error('Failed to load categories', e);
            // Clear corrupted data
            await AsyncStorage.removeItem(CATEGORIES_KEY);
            setCategories(defaultCategories);
        }
    };

    const saveCategories = async (customCategories: Category[]) => {
        try {
            // Only save non-default categories
            await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
        } catch (e) {
            console.error('Failed to save categories', e);
        }
    };

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            let localTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

            if (user) {
                try {
                    const cloudTasks = await taskService.fetchTasks();
                    const tasksMap = new Map();
                    localTasks.forEach(t => tasksMap.set(t.id, t));
                    cloudTasks.forEach(t => tasksMap.set(t.id, t));
                    localTasks = Array.from(tasksMap.values());
                    saveTasks(localTasks);
                } catch (e) {
                    console.log('Cloud sync failed', e);
                }
            }

            if (localTasks.length > 0) {
                setTasks(localTasks);
            }
        } catch (e) {
            console.error('Failed to load tasks', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveTasks = async (newTasks: Task[]) => {
        try {
            await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
        } catch (e) {
            console.error('Failed to save tasks', e);
        }
    };

    const handleRealtimeUpdate = async (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        const myEmail = user?.email;
        const myId = user?.id;

        if (eventType === 'DELETE') {
            setTasks(prev => {
                const next = prev.filter(t => t.id !== oldRecord.id);
                saveTasks(next);
                return next;
            });
            return;
        }

        if (!newRecord) return;

        const isOwner = newRecord.user_id === myId;
        const isShared = newRecord.shared_with && newRecord.shared_with.includes(myEmail);

        if (!isOwner && !isShared) {
            setTasks(prev => {
                const exists = prev.find(t => t.id === newRecord.id);
                if (exists) {
                    const next = prev.filter(t => t.id !== newRecord.id);
                    saveTasks(next);
                    notifications.sendImmediateNotification('Akses Dicabut', `Anda tidak lagi memiliki akses ke task "${exists.title}"`);
                    return next;
                }
                return prev;
            });
            return;
        }

        const task = taskService.parseTask(newRecord);

        setTasks(prev => {
            const index = prev.findIndex(t => t.id === task.id);
            if (index >= 0) {
                const next = [...prev];
                next[index] = { ...prev[index], ...task };
                saveTasks(next);
                return next;
            } else {
                const next = [...prev, task];
                saveTasks(next);
                if (!isOwner) {
                    notifications.sendImmediateNotification('Task Baru', `Anda ditambahkan ke task "${task.title}"`);
                }
                return next;
            }
        });
    };

    const addTask = async (task: Task) => {
        let taskWithIds = { ...task };

        // Schedule notification if task has date, time, and reminderOffset
        if (task.date && task.time && task.reminderOffset !== undefined && task.reminderOffset !== null) {
            try {
                const [hours, minutes] = task.time.split(':').map(Number);
                const reminderTime = new Date(task.date);
                reminderTime.setHours(hours, minutes, 0, 0);

                // Apply offset
                reminderTime.setMinutes(reminderTime.getMinutes() - task.reminderOffset);

                if (reminderTime > new Date()) {
                    const notificationId = await notifications.scheduleReminder({
                        ...task,
                        reminderTime,
                    } as any);
                    if (notificationId) {
                        taskWithIds.notificationId = notificationId;
                    }
                }
            } catch (error) {
                console.error('Failed to schedule notification:', error);
            }
        }

        const newTasks = [...tasks, taskWithIds];
        setTasks(newTasks);
        saveTasks(newTasks);
        // Sync to Supabase only when task has collaborators
        if (user && taskWithIds.sharedWith && taskWithIds.sharedWith.length > 0) {
            const taskToSync = {
                ...taskWithIds,
                ownerId: user.id
            };
            taskService.createTask(taskToSync, user.id)
                .then(() => console.log('[TaskContext] Shared task synced to Supabase:', taskWithIds.id))
                .catch(console.error);
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const existingTask = tasks.find(t => t.id === id);
        if (!existingTask) return;

        let finalUpdates = {
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.user_metadata?.full_name || user?.email || 'Unknown',
            updatedByAvatar: user?.user_metadata?.avatar_url
        };

        // If time/date/offset changed, reschedule notification
        if (updates.date || updates.time || updates.reminderOffset !== undefined) {
            // Cancel old notification
            if (existingTask.notificationId) {
                await notifications.cancelReminder(existingTask.notificationId);
                finalUpdates.notificationId = undefined; // Clear ID
            }

            // Schedule new notification
            const newDate = updates.date || existingTask.date;
            const newTime = updates.time || existingTask.time;
            const newOffset = updates.reminderOffset !== undefined ? updates.reminderOffset : existingTask.reminderOffset;

            if (newDate && newTime && newOffset !== undefined && newOffset !== null) {
                try {
                    const [hours, minutes] = newTime.split(':').map(Number);
                    const reminderTime = new Date(newDate);
                    reminderTime.setHours(hours, minutes, 0, 0);

                    // Apply offset
                    reminderTime.setMinutes(reminderTime.getMinutes() - newOffset);

                    if (reminderTime > new Date()) {
                        const notificationId = await notifications.scheduleReminder({
                            ...existingTask,
                            ...updates,
                            reminderTime,
                        } as any);
                        if (notificationId) {
                            finalUpdates.notificationId = notificationId;
                        }
                    }
                } catch (error) {
                    console.error('Failed to reschedule notification:', error);
                }
            }
        }

        const newTasks = tasks.map(t => t.id === id ? { ...t, ...finalUpdates } : t);
        setTasks(newTasks);
        saveTasks(newTasks);

        if (user) {
            const updatedTask = newTasks.find(t => t.id === id);
            console.log('[TaskContext] Update check:', {
                id,
                hasTask: !!updatedTask,
                sharedWith: updatedTask?.sharedWith,
                sharedWithViewers: updatedTask?.sharedWithViewers
            });

            // Sync if task has any collaborators (editors OR viewers)
            const hasCollaborators = (updatedTask?.sharedWith && updatedTask.sharedWith.length > 0) ||
                (updatedTask?.sharedWithViewers && updatedTask.sharedWithViewers.length > 0);

            if (updatedTask && hasCollaborators) {
                // Only sync tasks with collaborators to Supabase
                const taskToSync = {
                    ...updatedTask,
                    ownerId: updatedTask.ownerId || user.id
                };
                taskService.upsertTask(taskToSync, user.id)
                    .then(() => console.log('[TaskContext] Shared task synced to Supabase:', id))
                    .catch(err => console.error('[TaskContext] Failed to sync task:', err));
            }
        }
    };

    const deleteTask = async (id: string) => {
        const taskToDelete = tasks.find(t => t.id === id);

        // Cancel notification if exists
        if (taskToDelete?.notificationId) {
            await notifications.cancelReminder(taskToDelete.notificationId);
        }

        const newTasks = tasks.filter(t => t.id !== id);
        setTasks(newTasks);
        saveTasks(newTasks);

        if (user) {
            taskService.deleteTask(id).catch(console.error);
        }
    };

    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        const newCompleted = !task?.isCompleted;

        // If completing task, cancel notification
        if (newCompleted && task?.notificationId) {
            await notifications.cancelReminder(task.notificationId);
        }

        const newTasks = tasks.map(t => t.id === id ? { ...t, isCompleted: newCompleted } : t);
        setTasks(newTasks);
        saveTasks(newTasks);

        if (user) {
            const updatedTask = newTasks.find(t => t.id === id);
            if (updatedTask && updatedTask.sharedWith && updatedTask.sharedWith.length > 0) {
                taskService.upsertTask(updatedTask, user.id).catch(console.error);
            }
        }
    };

    const resetTasks = async () => {
        try {
            await AsyncStorage.removeItem('tasks');
            setTasks([]);
            loadTasks();
        } catch (e) {
            console.error('Failed to reset tasks', e);
        }
    };

    const addCategory = (category: Category) => {
        const newCategories = [...categories, category];
        setCategories(newCategories);
        // Save only custom categories (non-default)
        const customCategories = newCategories.filter(c => !c.isDefault);
        saveCategories(customCategories);
    };

    const deleteCategory = (id: string) => {
        // Don't allow deleting default categories
        const categoryToDelete = categories.find(c => c.id === id);
        if (categoryToDelete?.isDefault) return;

        const newCategories = categories.filter(c => c.id !== id);
        setCategories(newCategories);
        const customCategories = newCategories.filter(c => !c.isDefault);
        saveCategories(customCategories);
    };

    const getCategoryById = (id: string) => {
        return categories.find(c => c.id === id);
    };

    // Contact functions
    const loadContacts = async () => {
        try {
            const storedContacts = await AsyncStorage.getItem(CONTACTS_KEY);
            if (storedContacts) {
                setContacts(JSON.parse(storedContacts));
            }
        } catch (e) {
            console.error('Failed to load contacts', e);
        }
    };

    const saveContacts = async (contactsList: Contact[]) => {
        try {
            await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contactsList));
        } catch (e) {
            console.error('Failed to save contacts', e);
        }
    };

    const addContact = (contact: Contact) => {
        // Check if contact already exists
        const exists = contacts.find(c => c.email === contact.email);
        if (exists) {
            // Update lastShared
            const updated = contacts.map(c =>
                c.email === contact.email
                    ? { ...c, lastShared: new Date().toISOString() }
                    : c
            );
            setContacts(updated);
            saveContacts(updated);
        } else {
            const newContacts = [...contacts, { ...contact, lastShared: new Date().toISOString() }];
            setContacts(newContacts);
            saveContacts(newContacts);
        }
    };

    const deleteContact = (id: string) => {
        const newContacts = contacts.filter(c => c.id !== id);
        setContacts(newContacts);
        saveContacts(newContacts);
    };

    const getCategoryDisplay = (id?: string) => {
        if (!id) return null;
        const category = getCategoryById(id);
        if (!category) return null;
        return {
            name: category.isDefault ? category.name : category.name, // Translation handled in component but name is here
            color: category.color,
            isDefault: category.isDefault
        };
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            categories,
            contacts,
            addTask,
            updateTask,
            deleteTask,
            toggleTask,
            resetTasks,
            addCategory,
            deleteCategory,
            getCategoryById,
            getCategoryDisplay,
            addContact,
            deleteContact,
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = () => useContext(TaskContext);
