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
    createdAt: Date;
    updatedAt: Date;
}

export interface GoogleAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}
