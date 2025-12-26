import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Database types
export interface DbTask {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    reminder_time: string | null;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    google_calendar_event_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbTaskShare {
    id: string;
    task_id: string;
    shared_by: string;
    shared_with: string;
    permission: 'view' | 'edit';
    created_at: string;
}

export interface DbUser {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
}
