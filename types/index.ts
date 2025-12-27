export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    date?: string; // ISO date string e.g., "2024-12-27"
    time?: string; // Time string e.g., "10:00"
    reminderTime?: Date;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    googleCalendarEventId?: string;
    notificationId?: string;
    sharedWith?: string[];
    sharedWithViewers?: string[];
    category?: string;
    tag?: string;
    tagColor?: string;
    reminderOffset?: number;
    syncToGoogle?: boolean;
    ownerId?: string;
    updatedBy?: string;
    updatedByAvatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoogleAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}
