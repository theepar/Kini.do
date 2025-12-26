export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    reminderTime?: Date;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    googleCalendarEventId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GoogleAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}
