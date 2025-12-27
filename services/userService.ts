import { supabase } from '@/lib/supabase';

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export const userService = {
    async searchUsers(query: string): Promise<Profile[]> {
        // Search by email
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', `%${query}%`)
            .limit(10);

        if (error) {
            console.error('Error searching users:', error);
            return [];
        }

        return data || [];
    },

    async getProfileByEmail(email: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data;
    },

    async getProfilesByEmails(emails: string[]): Promise<Profile[]> {
        if (emails.length === 0) return [];
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('email', emails);

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
        return data || [];
    }
};
