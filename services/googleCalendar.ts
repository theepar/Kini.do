import { Task } from '@/types';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    attendees?: { email: string }[];
}

export const googleCalendar = {
    /**
     * Create a calendar event from a task
     */
    async createEvent(accessToken: string, task: Task): Promise<CalendarEvent | null> {
        // Support both dueDate and date+time formats
        let startTime: Date;

        if (task.dueDate) {
            startTime = new Date(task.dueDate);
        } else if (task.date) {
            startTime = new Date(task.date);
            if (task.time) {
                const [hours, minutes] = task.time.split(':').map(Number);
                startTime.setHours(hours, minutes, 0, 0);
            }
        } else {
            return null;
        }

        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min duration

        // Map collaborators to attendees
        const attendees: { email: string }[] = [];
        if (task.sharedWith) {
            task.sharedWith.forEach(email => attendees.push({ email }));
        }
        if (task.sharedWithViewers) {
            task.sharedWithViewers.forEach(email => attendees.push({ email }));
        }

        const event = {
            summary: task.title,
            description: task.description || `Task dari Kini.do - Prioritas: ${task.priority || 'normal'}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: attendees.length > 0 ? attendees : undefined,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 30 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        try {
            const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Calendar API error:', error);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating calendar event:', error);
            return null;
        }
    },

    /**
     * Update an existing calendar event
     */
    async updateEvent(
        accessToken: string,
        eventId: string,
        task: Task
    ): Promise<CalendarEvent | null> {
        // Support both dueDate and date+time formats
        let startTime: Date;

        if (task.dueDate) {
            startTime = new Date(task.dueDate);
        } else if (task.date) {
            startTime = new Date(task.date);
            if (task.time) {
                const [hours, minutes] = task.time.split(':').map(Number);
                startTime.setHours(hours, minutes, 0, 0);
            }
        } else {
            return null;
        }

        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        const event = {
            summary: task.title,
            description: task.description || `Task dari Kini.do - Prioritas: ${task.priority || 'normal'}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        try {
            const response = await fetch(
                `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(event),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('Calendar API error:', error);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating calendar event:', error);
            return null;
        }
    },

    /**
     * Delete a calendar event
     */
    async deleteEvent(accessToken: string, eventId: string): Promise<boolean> {
        try {
            const response = await fetch(
                `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            return response.ok;
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            return false;
        }
    },

    /**
     * Get upcoming events from Google Calendar
     */
    async getUpcomingEvents(
        accessToken: string,
        maxResults: number = 10
    ): Promise<CalendarEvent[]> {
        try {
            const timeMin = new Date().toISOString();
            const response = await fetch(
                `${CALENDAR_API_BASE}/calendars/primary/events?` +
                `maxResults=${maxResults}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('Calendar API error:', error);
                return [];
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },
};
