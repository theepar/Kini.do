import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { notifications } from '@/services/notifications';

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
    addContact: () => { },
    deleteContact: () => { },
});

const CATEGORIES_KEY = 'kini_categories';
const CONTACTS_KEY = 'kini_contacts';

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTasks();
        loadCategories();
        loadContacts();
    }, []);

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
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            } else {
                // Initial Mock Data
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);

                const initialTasks: Task[] = [
                    {
                        id: '1',
                        title: 'Meeting Tim Desain',
                        description: 'Review mockup final UI/UX untuk Kini.do iOS app.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '10:00',
                        date: today.toISOString().split('T')[0],
                        priority: 'high',
                        avatars: [
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuDqeQA0UTd-xb_5uK5tHxBYki-6XaVW7JFz4H3ufAI-hP6U3jssmCd0sNRhrQXyCQmkS79y2HiDtwjRAZKektfjmUHs8y1C1uc994jpN5drnJxhj9sG9TieXXMzfWHJhBHR-qWUCWrIvp1jf56FVVm5-i8VeC-dthfkbCMy2kKD4c6RI77OKqOVmuLq7ay1HK4Cyxsdpxak-_K5M-q5KrIk9wG31wtao707vPD_uDqkvXDtoOrL3lg9nB7cKVL67HZ8uQfj-lKiKDI',
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuCnS8TZts7lROGBKsoI2sY8HgsfhUZIVNA78R5A1miKwPbS4Otfn0WTUkrlS3wnPRojn3egJvo4PXBYmxM1hx9AWann3Q63hNGMrQ2BXEKEJ4aGQJ6blRlHxQlMzGLvLEp7u7VsQHfjKWlgv3hCZKbdXXi4vY5o1prh2xpL0zOi47UnNQHWmY0Oy4op8KuiJx1oEQFztnPT26CeH2RoQrTGwCxGwIRE5L_Ehm4LMhOv13XvuvrAs3aHUKphwXbsq-RJYllbhI0SyZ8',
                        ],
                    },
                    {
                        id: '2',
                        title: 'Laporan Mingguan',
                        description: 'Kirim ke manajer sebelum makan siang.',
                        tag: 'ADMIN',
                        tagColor: 'blue',
                        time: '12:30',
                        date: today.toISOString().split('T')[0],
                        priority: 'high',
                    },
                    {
                        id: '3',
                        title: 'Beli Kebutuhan Bulanan',
                        time: '17:00',
                        tag: 'Pribadi',
                        tagColor: 'green',
                        date: today.toISOString().split('T')[0],
                    },
                    {
                        id: '4',
                        title: 'Bayar Tagihan Listrik',
                        time: 'Hari ini',
                        tag: 'Rumah',
                        tagColor: 'yellow',
                        flagged: true,
                        date: today.toISOString().split('T')[0],
                    },
                    {
                        id: '5',
                        title: 'Persiapan Presentasi Proposal Proyek Aplikasi Mobile untuk Klien PT. Teknologi Maju Indonesia',
                        description: 'Siapkan slide deck lengkap dengan demo aplikasi, timeline pengembangan 6 bulan, estimasi budget Rp 500jt, dan roadmap fitur. Pastikan semua mockup UI/UX sudah final dan disetujui tim desain. Koordinasi dengan tim backend untuk API documentation.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '09:00',
                        date: today.toISOString().split('T')[0],
                        priority: 'high',
                    },
                    {
                        id: '6',
                        title: 'Review dan Revisi Dokumen Kontrak Kerjasama dengan Vendor Cloud Infrastructure AWS untuk Migrasi Server',
                        description: 'Baca ulang semua klausul kontrak, pastikan SLA 99.9% uptime tercantum, negosiasi harga bulanan, dan diskusikan support 24/7. Siapkan pertanyaan untuk legal team mengenai data privacy dan compliance GDPR.',
                        tag: 'ADMIN',
                        tagColor: 'blue',
                        time: '14:00',
                        date: today.toISOString().split('T')[0],
                        priority: 'high',
                    },
                    {
                        id: '7',
                        title: 'Sprint Planning Q1 2025 - Breakdown Fitur Notifikasi Push, Integrasi Payment Gateway, dan Dashboard Analytics',
                        description: 'Breakdown semua user stories menjadi tasks, estimasi story points, assign ke tim developer. Target: 3 sprint untuk notifikasi, 4 sprint untuk payment gateway (Midtrans, Xendit, OVO), 2 sprint untuk dashboard analytics dengan charts dan export PDF.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '10:30',
                        date: tomorrow.toISOString().split('T')[0],
                        priority: 'high',
                        avatars: [
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuDqeQA0UTd-xb_5uK5tHxBYki-6XaVW7JFz4H3ufAI-hP6U3jssmCd0sNRhrQXyCQmkS79y2HiDtwjRAZKektfjmUHs8y1C1uc994jpN5drnJxhj9sG9TieXXMzfWHJhBHR-qWUCWrIvp1jf56FVVm5-i8VeC-dthfkbCMy2kKD4c6RI77OKqOVmuLq7ay1HK4Cyxsdpxak-_K5M-q5KrIk9wG31wtao707vPD_uDqkvXDtoOrL3lg9nB7cKVL67HZ8uQfj-lKiKDI',
                        ],
                    },
                    {
                        id: '8',
                        title: 'Perpanjang STNK Motor dan Bayar Pajak Tahunan di Samsat',
                        description: 'Bawa BPKB asli, KTP, STNK lama. Cek dulu apakah ada denda keterlambatan. Siapkan uang tunai sekitar Rp 500rb untuk jaga-jaga.',
                        tag: 'Pribadi',
                        tagColor: 'green',
                        time: '08:00',
                        date: tomorrow.toISOString().split('T')[0],
                        priority: 'medium',
                    },
                    {
                        id: '9',
                        title: 'Code Review Pull Request #247 - Implementasi Fitur Authentication OAuth2 dengan Google dan Apple Sign-In',
                        description: 'Review security implementation, pastikan token refresh mechanism benar, cek error handling untuk expired sessions, validate PKCE flow untuk mobile apps. Test di iOS dan Android emulator.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '15:00',
                        date: today.toISOString().split('T')[0],
                        priority: 'high',
                    },
                    {
                        id: '10',
                        title: 'Booking Tiket Pesawat dan Hotel untuk Business Trip ke Surabaya Tanggal 15-17 Januari',
                        description: 'Cari flight pagi hari, hotel dekat venue meeting di area Pakuwon. Budget maksimal Rp 3jt untuk transport dan akomodasi. Claim reimburse ke finance setelah trip.',
                        tag: 'ADMIN',
                        tagColor: 'blue',
                        time: '16:00',
                        date: nextWeek.toISOString().split('T')[0],
                        priority: 'medium',
                    },
                    {
                        id: '11',
                        title: 'Servis AC Ruang Kerja - Jadwal Teknisi Datang Jam 10 Pagi',
                        description: 'AC sudah tidak dingin sejak minggu lalu. Minta teknisi cek freon dan bersihkan filter. Siapkan akses ke ruangan.',
                        tag: 'Rumah',
                        tagColor: 'yellow',
                        time: '10:00',
                        date: tomorrow.toISOString().split('T')[0],
                        priority: 'low',
                    },
                    {
                        id: '12',
                        title: 'Workshop Internal: Best Practices React Native Performance Optimization dan State Management dengan Zustand',
                        description: 'Siapkan materi 2 jam, termasuk live coding demo. Topik: memo, useCallback, useMemo, FlatList optimization, image caching, bundle size reduction. Invite semua frontend developers.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '13:00',
                        date: nextWeek.toISOString().split('T')[0],
                        priority: 'high',
                        avatars: [
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuCnS8TZts7lROGBKsoI2sY8HgsfhUZIVNA78R5A1miKwPbS4Otfn0WTUkrlS3wnPRojn3egJvo4PXBYmxM1hx9AWann3Q63hNGMrQ2BXEKEJ4aGQJ6blRlHxQlMzGLvLEp7u7VsQHfjKWlgv3hCZKbdXXi4vY5o1prh2xpL0zOi47UnNQHWmY0Oy4op8KuiJx1oEQFztnPT26CeH2RoQrTGwCxGwIRE5L_Ehm4LMhOv13XvuvrAs3aHUKphwXbsq-RJYllbhI0SyZ8',
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuDqeQA0UTd-xb_5uK5tHxBYki-6XaVW7JFz4H3ufAI-hP6U3jssmCd0sNRhrQXyCQmkS79y2HiDtwjRAZKektfjmUHs8y1C1uc994jpN5drnJxhj9sG9TieXXMzfWHJhBHR-qWUCWrIvp1jf56FVVm5-i8VeC-dthfkbCMy2kKD4c6RI77OKqOVmuLq7ay1HK4Cyxsdpxak-_K5M-q5KrIk9wG31wtao707vPD_uDqkvXDtoOrL3lg9nB7cKVL67HZ8uQfj-lKiKDI',
                        ],
                    },
                ];
                setTasks(initialTasks);
                saveTasks(initialTasks);
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

    const addTask = async (task: Task) => {
        let taskWithIds = { ...task };

        // Schedule notification if task has date and time
        if (task.date && task.time) {
            try {
                const [hours, minutes] = task.time.split(':').map(Number);
                const reminderTime = new Date(task.date);
                reminderTime.setHours(hours, minutes, 0, 0);

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
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const existingTask = tasks.find(t => t.id === id);
        if (!existingTask) return;

        let finalUpdates = { ...updates };

        // If time/date changed, reschedule notification
        if (updates.date || updates.time) {
            // Cancel old notification
            if (existingTask.notificationId) {
                await notifications.cancelReminder(existingTask.notificationId);
            }

            // Schedule new notification
            const newDate = updates.date || existingTask.date;
            const newTime = updates.time || existingTask.time;

            if (newDate && newTime) {
                try {
                    const [hours, minutes] = newTime.split(':').map(Number);
                    const reminderTime = new Date(newDate);
                    reminderTime.setHours(hours, minutes, 0, 0);

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
            addContact,
            deleteContact,
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = () => useContext(TaskContext);
