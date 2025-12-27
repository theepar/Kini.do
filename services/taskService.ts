import { Task } from '@/context/TaskContext';
import { supabase } from '@/lib/supabase';

// Map DB snake_case to Local camelCase
const mapToLocalTask = (data: any): Task => ({
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    isCompleted: data.is_completed,
    flagged: data.is_flagged,
    date: data.date,
    time: data.time,
    reminderOffset: data.reminder_offset,
    googleCalendarEventId: data.google_calendar_event_id,
    syncToGoogle: data.sync_to_google,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
    sharedWith: data.shared_with || [],
    sharedWithViewers: data.shared_with_viewers || [],
    ownerId: data.user_id,
    // We might want to persist avatars if they are custom, or derive them.
    // For now, let's assume avatars are not directly in DB or mapped from shared_with in UI
});

// Map Local camelCase to DB snake_case
const mapToDbTask = (task: Partial<Task>) => {
    const dbTask: any = {};
    // Essential columns
    if (task.id !== undefined) dbTask.id = task.id;
    if (task.title !== undefined) dbTask.title = task.title;
    if (task.description !== undefined) dbTask.description = task.description;
    if (task.category !== undefined) dbTask.category = task.category;
    if (task.priority !== undefined) dbTask.priority = task.priority;
    if (task.isCompleted !== undefined) dbTask.is_completed = task.isCompleted;
    if (task.flagged !== undefined) dbTask.is_flagged = task.flagged;
    if (task.date !== undefined) dbTask.date = task.date;
    if (task.time !== undefined) dbTask.time = task.time;
    // Reminder & Calendar sync columns
    if (task.reminderOffset !== undefined) dbTask.reminder_offset = task.reminderOffset;
    if (task.googleCalendarEventId !== undefined) dbTask.google_calendar_event_id = task.googleCalendarEventId;
    if (task.syncToGoogle !== undefined) dbTask.sync_to_google = task.syncToGoogle;
    // Update tracking columns
    if (task.updatedAt !== undefined) dbTask.updated_at = task.updatedAt;
    if (task.updatedBy !== undefined) dbTask.updated_by = task.updatedBy;
    if (task.updatedByAvatar !== undefined) dbTask.updated_by_avatar = task.updatedByAvatar;
    // Collaboration columns
    if (task.sharedWith !== undefined) dbTask.shared_with = task.sharedWith;
    if (task.sharedWithViewers !== undefined) dbTask.shared_with_viewers = task.sharedWithViewers;

    return dbTask;
};

export const taskService = {
    parseTask(data: any): Task {
        return mapToLocalTask(data);
    },

    async fetchTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapToLocalTask);
    },

    async createTask(task: Task, userId: string) {
        const dbTask = {
            ...mapToDbTask(task),
            user_id: userId,
        };
        Object.keys(dbTask).forEach(key => dbTask[key] === undefined && delete dbTask[key]);

        const { data, error } = await supabase
            .from('tasks')
            .insert(dbTask)
            .select()
            .single();

        if (error) throw error;
        return mapToLocalTask(data);
    },

    async updateTask(id: string, updates: Partial<Task>) {
        // Validate UUID
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_REGEX.test(id)) {
            console.warn(`[taskService] Invalid UUID '${id}' for update task. Skipping DB sync.`);
            return { ...updates, id }; // Return mock update
        }

        const dbUpdates = mapToDbTask(updates);
        Object.keys(dbUpdates).forEach(key => dbUpdates[key] === undefined && delete dbUpdates[key]);

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToLocalTask(data);
    },

    async upsertTask(task: Task, userId: string) {
        const dbTask = {
            ...mapToDbTask(task),
            user_id: userId,
        };
        Object.keys(dbTask).forEach(key => dbTask[key] === undefined && delete dbTask[key]);

        console.log('[taskService] Upserting task:', {
            id: dbTask.id,
            shared_with: dbTask.shared_with,
            shared_with_viewers: dbTask.shared_with_viewers
        });

        const { data, error } = await supabase
            .from('tasks')
            .upsert(dbTask)
            .select()
            .single();

        if (error) {
            console.error('[taskService] Upsert error:', error);
            throw error;
        }

        console.log('[taskService] Upsert success:', { id: data?.id, shared_with: data?.shared_with });
        return mapToLocalTask(data);
    },

    async deleteTask(id: string) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
