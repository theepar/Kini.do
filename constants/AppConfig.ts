export const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', icon: 'flag-outline' },
    { value: 'medium', label: 'Medium', icon: 'flag-outline' },
    { value: 'high', label: 'High', icon: 'flag' },
] as const;

/**
 * Reminder time options in minutes before task
 * Used in task creation/edit modal
 */
export const REMINDER_OPTIONS = [
    { label: 'At time of task', value: 0 },
    { label: '5 minutes before', value: 5 },
    { label: '10 minutes before', value: 10 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
    { label: '1 day before', value: 1440 },
] as const;

/**
 * Default categories available for all users
 */
export const DEFAULT_CATEGORIES = [
    { id: 'default-work', name: 'Work', color: '#007AFF' },
    { id: 'default-personal', name: 'Personal', color: '#FF9500' },
    { id: 'default-shopping', name: 'Shopping', color: '#34C759' },
    { id: 'default-health', name: 'Health', color: '#FF3B30' },
    { id: 'default-study', name: 'Study', color: '#AF52DE' },
] as const;

/**
 * Color palette for category customization
 */
export const CATEGORY_COLORS = [
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#34C759', // Green
    '#00C7BE', // Teal
    '#007AFF', // Blue
    '#5856D6', // Indigo
    '#AF52DE', // Purple
    '#FF2D55', // Pink
    '#8E8E93', // Gray
] as const;

/**
 * Form validation constraints
 */
export const VALIDATION = {
    // Task validation
    TASK_TITLE_MIN_LENGTH: 1,
    TASK_TITLE_MAX_LENGTH: 200,
    TASK_DESCRIPTION_MAX_LENGTH: 2000,

    // Category validation
    CATEGORY_NAME_MIN_LENGTH: 1,
    CATEGORY_NAME_MAX_LENGTH: 50,

    // User input
    EMAIL_MAX_LENGTH: 254, // RFC 5321 standard
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,

    // Lists
    MAX_CATEGORIES_PER_USER: 50,
    MAX_TASKS_PER_USER: 1000,
    MAX_SUBTASKS_PER_TASK: 20,
} as const;

/**
 * Security configuration
 */
export const SECURITY = {
    // Rate limiting (client-side awareness)
    MAX_REQUESTS_PER_MINUTE: 60,
    DEBOUNCE_MS: 300,

    // Session
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    TOKEN_REFRESH_BUFFER_MS: 5 * 60 * 1000, // Refresh 5 minutes before expiry

    // Validation patterns
    UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    SAFE_STRING_REGEX: /^[\w\s.,!?@#$%&*()-=+:;"'<>\/\u0080-\uFFFF]+$/,
    HEX_COLOR_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,

    // Content sanitization
    MAX_CONSECUTIVE_SPACES: 3,
    STRIP_HTML_TAGS: true,
} as const;

/**
 * Animation timing constants (in milliseconds)
 */
export const ANIMATION = {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    MODAL_ENTER: 300,
    MODAL_EXIT: 200,
    HAPTIC_DELAY: 50,
} as const;

/**
 * UI dimension constants
 */
export const DIMENSIONS = {
    // Border radius
    RADIUS_SMALL: 8,
    RADIUS_MEDIUM: 12,
    RADIUS_LARGE: 16,
    RADIUS_XLARGE: 24,

    // Spacing
    SPACING_XS: 4,
    SPACING_SM: 8,
    SPACING_MD: 12,
    SPACING_LG: 16,
    SPACING_XL: 24,
    SPACING_XXL: 32,

    // Typography
    FONT_SIZE_XS: 11,
    FONT_SIZE_SM: 13,
    FONT_SIZE_MD: 15,
    FONT_SIZE_LG: 17,
    FONT_SIZE_XL: 20,
    FONT_SIZE_XXL: 28,
    FONT_SIZE_TITLE: 34,

    // Component heights
    INPUT_HEIGHT: 50,
    BUTTON_HEIGHT: 56,
    TAB_BAR_HEIGHT: 85,
    HEADER_HEIGHT: 56,
    CARD_ICON_SIZE: 22,
    AVATAR_SIZE: 40,
} as const;

/**
 * Default values for various features
 */
export const DEFAULTS = {
    // Task defaults
    TASK_PRIORITY: 'medium' as const,
    REMINDER_MINUTES: 15,

    // Preferences
    THEME_MODE: 'system' as const,
    START_WEEK_ON: 'monday' as const,
    NOTIFICATIONS_ENABLED: true,
    AUTO_SYNC_ENABLED: true,

    // Pagination
    PAGE_SIZE: 20,
    INITIAL_LOAD_COUNT: 10,
} as const;

/**
 * Error messages for consistent user feedback
 */
export const ERROR_MESSAGES = {
    // Network
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',

    // Auth
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',

    // Validation
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
    TITLE_TOO_LONG: `Title cannot exceed ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters.`,
    DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} characters.`,
    INVALID_INPUT: 'Invalid input. Please check your entry.',

    // Tasks
    TASK_NOT_FOUND: 'Task not found.',
    TASK_CREATE_FAILED: 'Failed to create task. Please try again.',
    TASK_UPDATE_FAILED: 'Failed to update task. Please try again.',
    TASK_DELETE_FAILED: 'Failed to delete task. Please try again.',

    // Categories
    CATEGORY_EXISTS: 'A category with this name already exists.',
    CATEGORY_LIMIT_REACHED: `You can have up to ${VALIDATION.MAX_CATEGORIES_PER_USER} categories.`,
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    TASK_CREATED: 'Task created successfully!',
    TASK_UPDATED: 'Task updated successfully!',
    TASK_DELETED: 'Task deleted successfully!',
    TASK_COMPLETED: 'Task completed! Great job!',
    CATEGORY_CREATED: 'Category created successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

export type PriorityValue = typeof PRIORITY_OPTIONS[number]['value'];
export type ReminderValue = typeof REMINDER_OPTIONS[number]['value'];
export type CategoryColor = typeof CATEGORY_COLORS[number];
export type ThemeMode = typeof DEFAULTS.THEME_MODE | 'light' | 'dark';
export type StartWeekOn = typeof DEFAULTS.START_WEEK_ON | 'sunday';
