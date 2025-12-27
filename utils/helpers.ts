import { Alert, AlertButton } from 'react-native';

// ============================================================
// INLINE CONSTANTS FOR VALIDATION
// These values are centralized here to avoid circular dependencies
// ============================================================

const SECURITY = {
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    HEX_COLOR_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    STRIP_HTML_TAGS: true,
};

const VALIDATION = {
    TASK_TITLE_MIN_LENGTH: 1,
    TASK_TITLE_MAX_LENGTH: 200,
    TASK_DESCRIPTION_MAX_LENGTH: 2000,
    CATEGORY_NAME_MIN_LENGTH: 1,
    CATEGORY_NAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
};

const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
    TITLE_TOO_LONG: `Title cannot exceed ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters.`,
    DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} characters.`,
    INVALID_INPUT: 'Invalid input. Please check your entry.',
};

// ============================================================
// DIALOG & ALERT UTILITIES
// ============================================================

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

// ============================================================
// SECURITY & VALIDATION UTILITIES
// ============================================================

/**
 * Validates UUID format to prevent injection attacks.
 * Use before any database operation with user-provided IDs.
 * 
 * @param id - The ID string to validate
 * @returns true if valid UUID format
 * 
 * @example
 * if (!isValidUUID(taskId)) throw new Error('Invalid task ID');
 */
export const isValidUUID = (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    return SECURITY.UUID_REGEX.test(id);
};

/**
 * Validates hex color format for category colors.
 * 
 * @param color - Color string to validate (#RGB or #RRGGBB)
 * @returns true if valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
    if (!color || typeof color !== 'string') return false;
    return SECURITY.HEX_COLOR_REGEX.test(color);
};

/**
 * Sanitizes user input to prevent XSS and injection attacks.
 * Strips HTML tags, trims whitespace, normalizes spaces.
 * 
 * @param input - Raw user input
 * @param maxLength - Optional maximum length limit
 * @returns Sanitized string safe for storage/display
 * 
 * @example
 * const safeTitle = sanitizeInput(userInput, VALIDATION.TASK_TITLE_MAX_LENGTH);
 */
export const sanitizeInput = (input: string, maxLength?: number): string => {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // Strip HTML tags if configured
    if (SECURITY.STRIP_HTML_TAGS) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove potential script injections
    sanitized = sanitized
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/data:/gi, '');

    // Normalize whitespace
    sanitized = sanitized
        .trim()
        .replace(/\s+/g, ' ');

    // Apply max length if specified
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
};

/**
 * Validates task title with comprehensive checks.
 * 
 * @param title - Task title to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateTaskTitle = (title: string): { isValid: boolean; error?: string } => {
    if (!title || typeof title !== 'string') {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = title.trim();

    if (trimmed.length < VALIDATION.TASK_TITLE_MIN_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    if (trimmed.length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.TITLE_TOO_LONG };
    }

    return { isValid: true };
};

/**
 * Validates task description.
 * 
 * @param description - Description to validate (optional field)
 * @returns Object with isValid flag and error message if invalid
 */
export const validateTaskDescription = (description?: string): { isValid: boolean; error?: string } => {
    if (!description) return { isValid: true }; // Optional field

    if (typeof description !== 'string') {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
    }

    if (description.length > VALIDATION.TASK_DESCRIPTION_MAX_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.DESCRIPTION_TOO_LONG };
    }

    return { isValid: true };
};

/**
 * Validates email with comprehensive checks.
 * 
 * @param email - Email address to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length > VALIDATION.EMAIL_MAX_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }

    if (!isValidEmail(trimmed)) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }

    return { isValid: true };
};

/**
 * Validates password strength.
 * 
 * @param password - Password to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
    }

    if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
    }

    return { isValid: true };
};

/**
 * Validates category name.
 * 
 * @param name - Category name to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateCategoryName = (name: string): { isValid: boolean; error?: string } => {
    if (!name || typeof name !== 'string') {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = name.trim();

    if (trimmed.length < VALIDATION.CATEGORY_NAME_MIN_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }

    if (trimmed.length > VALIDATION.CATEGORY_NAME_MAX_LENGTH) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
    }

    return { isValid: true };
};

/**
 * Rate limiter for preventing rapid repeated actions.
 * Returns a function that tracks and limits calls.
 * 
 * @param limit - Maximum calls allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns Function that returns true if call is allowed
 */
export const createRateLimiter = (limit: number, windowMs: number) => {
    const calls: number[] = [];

    return (): boolean => {
        const now = Date.now();
        // Remove calls outside the window
        while (calls.length > 0 && calls[0] < now - windowMs) {
            calls.shift();
        }

        if (calls.length >= limit) {
            return false; // Rate limit exceeded
        }

        calls.push(now);
        return true;
    };
};

/**
 * Safely parses JSON with error handling.
 * 
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
    try {
        return JSON.parse(jsonString) as T;
    } catch {
        return fallback;
    }
};

/**
 * Masks sensitive data for logging (e.g., email: j***@example.com)
 * 
 * @param value - Value to mask
 * @param type - Type of data ('email' | 'id' | 'token')
 * @returns Masked string
 */
export const maskSensitiveData = (value: string, type: 'email' | 'id' | 'token'): string => {
    if (!value) return '***';

    switch (type) {
        case 'email':
            const [local, domain] = value.split('@');
            if (!domain) return '***@***';
            return `${local[0]}***@${domain}`;
        case 'id':
            return `${value.substring(0, 4)}...${value.slice(-4)}`;
        case 'token':
            return `${value.substring(0, 8)}...`;
        default:
            return '***';
    }
};

// ============================================================
// STRING & TEXT UTILITIES
// ============================================================

/**
 * Generate initials from name for avatar display.
 * 
 * @param name - Full name string
 * @returns 1-2 character initials (uppercase)
 */
export const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// ============================================================
// COLOR UTILITIES
// ============================================================

/**
 * Generate a deterministic color based on string hash.
 * Same input always produces the same color.
 * 
 * @param str - String to hash (e.g., user ID, email)
 * @returns Hex color string
 */
export const getColorFromString = (str: string): string => {
    const colors = [
        '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
        '#EC4899', '#14B8A6', '#6366F1', '#EF4444',
        '#6B7280', '#F97316', '#84CC16', '#06B6D4'
    ];

    if (!str) return colors[0];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

/**
 * Generate a random color for avatars.
 * @deprecated Use getColorFromString for consistent colors
 */
export const getRandomColor = (): string => {
    const colors = [
        '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981',
        '#EC4899', '#14B8A6', '#6366F1', '#EF4444',
        '#6B7280', '#F97316', '#84CC16', '#06B6D4'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// ============================================================
// DATE & TIME UTILITIES
// ============================================================

/**
 * Format date to readable string.
 * 
 * @param dateString - ISO date string or Date-compatible string
 * @param locale - Locale for formatting (default: 'id-ID')
 * @returns Formatted date string (e.g., "Senin, 27 Desember 2024")
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

// ============================================================
// VALIDATION UTILITIES (Basic)
// ============================================================

/**
 * Validate email format using regex.
 * 
 * @param email - Email string to validate
 * @returns true if valid email format
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

// ============================================================
// FUNCTION UTILITIES
// ============================================================

/**
 * Debounce function to limit execution rate.
 * Useful for search inputs, auto-save, etc.
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(search, 300);
 * onChange={e => debouncedSearch(e.target.value)}
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

// ============================================================
// ARRAY & OBJECT UTILITIES
// ============================================================

/**
 * Group array items by a specified key.
 * 
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Object with grouped items
 * 
 * @example
 * groupBy(tasks, 'category') // { work: [...], personal: [...] }
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
