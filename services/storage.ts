import { Task } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'kini_tasks';

export const storage = {
    async getTasks(): Promise<Task[]> {
        try {
            const data = await AsyncStorage.getItem(TASKS_KEY);
            if (!data) return [];
            const tasks = JSON.parse(data);
            return tasks.map((task: any) => ({
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
            }));
        } catch (error) {
            console.error('Error reading tasks:', error);
            return [];
        }
    },

    async saveTasks(tasks: Task[]): Promise<void> {
        try {
            await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    },

    async addTask(task: Task): Promise<void> {
        const tasks = await this.getTasks();
        tasks.push(task);
        await this.saveTasks(tasks);
    },

    async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
        const tasks = await this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
            await this.saveTasks(tasks);
        }
    },

    async deleteTask(taskId: string): Promise<void> {
        const tasks = await this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        await this.saveTasks(filtered);
    },

    async toggleComplete(taskId: string): Promise<void> {
        const tasks = await this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;
            tasks[index].updatedAt = new Date();
            await this.saveTasks(tasks);
        }
    },
};
