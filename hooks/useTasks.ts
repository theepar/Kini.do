import { storage } from '@/services/storage';
import { Task } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        const data = await storage.getTasks();
        setTasks(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const addTask = async (task: Task) => {
        await storage.addTask(task);
        await loadTasks();
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        await storage.updateTask(taskId, updates);
        await loadTasks();
    };

    const deleteTask = async (taskId: string) => {
        await storage.deleteTask(taskId);
        await loadTasks();
    };

    const toggleComplete = async (taskId: string) => {
        await storage.toggleComplete(taskId);
        await loadTasks();
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return {
        tasks,
        pendingTasks,
        completedTasks,
        loading,
        loadTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
    };
}
