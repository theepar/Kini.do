import { Alert, AlertButton } from 'react-native';

/**
 * Show a confirmation dialog
 */
export const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
        confirmText?: string;
        cancelText?: string;
        destructive?: boolean;
    }
) => {
    const buttons: AlertButton[] = [
        { text: options?.cancelText || 'Batal', style: 'cancel' },
        {
            text: options?.confirmText || 'OK',
            style: options?.destructive ? 'destructive' : 'default',
            onPress: onConfirm,
        },
    ];

    Alert.alert(title, message, buttons);
};

/**
 * Show a simple info alert
 */
export const showAlert = (title: string, message?: string) => {
    Alert.alert(title, message);
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Generate a random color for avatars
 */
export const getRandomColor = (): string => {
    const colors = [
        '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
        '#EC4899', '#14B8A6', '#6366F1', '#EF4444',
        '#6B7280', '#F97316', '#84CC16', '#06B6D4'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string, locale: string = 'id-ID'): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

/**
 * Format date to short format (e.g., "27 Des")
 */
export const formatDateShort = (dateString: string, locale: string = 'id-ID'): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
        });
    } catch {
        return dateString;
    }
};

/**
 * Format time to readable string (e.g., "10:00")
 */
export const formatTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateString;
    }
};

/**
 * Get relative time string (e.g., "2 jam lalu", "kemarin")
 */
export const getRelativeTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return formatDateShort(dateString);
    } catch {
        return dateString;
    }
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
    try {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    } catch {
        return false;
    }
};

/**
 * Check if date is tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
    try {
        const date = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    } catch {
        return false;
    }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalize = (text: string): string => {
    if (!text) return '';
    return text.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
};

/**
 * Sort array by date
 */
export const sortByDate = <T extends { date?: string }>(
    array: T[],
    ascending: boolean = true
): T[] => {
    return [...array].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return ascending ? dateA - dateB : dateB - dateA;
    });
};
