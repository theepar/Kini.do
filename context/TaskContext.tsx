import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Task {
    id: string;
    title: string;
    description?: string;
    tag?: string;
    tagColor?: string;
    time?: string; // Display time string e.g., "10:00"
    date?: string; // ISO Date string for filtering
    priority?: 'high' | 'medium' | 'low';
    isCompleted?: boolean;
    flagged?: boolean;
    avatars?: string[];
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType>({
    tasks: [],
    addTask: () => { },
    updateTask: () => { },
    deleteTask: () => { },
    toggleTask: () => { },
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const storedTasks = await AsyncStorage.getItem('tasks');
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            } else {
                // Initial Mock Data
                const initialTasks: Task[] = [
                    {
                        id: '1',
                        title: 'Meeting Tim Desain',
                        description: 'Review mockup final UI/UX untuk Kini.do iOS app.',
                        tag: 'KERJA',
                        tagColor: 'purple',
                        time: '10:00',
                        date: new Date().toISOString().split('T')[0], // Today
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
                        date: new Date().toISOString().split('T')[0],
                        priority: 'high',
                    },
                    {
                        id: '3',
                        title: 'Beli Kebutuhan Bulanan',
                        time: '17:00',
                        tag: 'Pribadi',
                        tagColor: 'green',
                        date: new Date().toISOString().split('T')[0],
                    },
                    {
                        id: '4',
                        title: 'Bayar Tagihan Listrik',
                        time: 'Hari ini',
                        tag: 'Rumah',
                        tagColor: 'yellow',
                        flagged: true,
                        date: new Date().toISOString().split('T')[0],
                    }
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

    const addTask = (task: Task) => {
        const newTasks = [...tasks, task];
        setTasks(newTasks);
        saveTasks(newTasks);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        setTasks(newTasks);
        saveTasks(newTasks);
    };

    const deleteTask = (id: string) => {
        const newTasks = tasks.filter(t => t.id !== id);
        setTasks(newTasks);
        saveTasks(newTasks);
    };

    const toggleTask = (id: string) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
        setTasks(newTasks);
        saveTasks(newTasks);
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTask }}>
            {children}
        </TaskContext.Provider>
    );
}

export const useTasks = () => useContext(TaskContext);
