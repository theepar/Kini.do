// Google Translate API Service for Kini.do
// Uses the free Google Translate API endpoint

export type SupportedLanguage = 'id' | 'en' | 'zh' | 'ja' | 'ko' | 'ru' | 'ms';

export interface LanguageInfo {
    nativeName: string;
    englishName: string;
    flag: string;
}

// Language names with native name, English name, and flag emoji
export const languageNames: Record<SupportedLanguage, LanguageInfo> = {
    id: { nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', flag: '🇮🇩' },
    en: { nativeName: 'English', englishName: 'English', flag: '🇺🇸' },
    zh: { nativeName: '中文', englishName: 'Chinese', flag: '🇨🇳' },
    ja: { nativeName: '日本語', englishName: 'Japanese', flag: '🇯🇵' },
    ko: { nativeName: '한국어', englishName: 'Korean', flag: '🇰🇷' },
    ru: { nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
    ms: { nativeName: 'Bahasa Melayu', englishName: 'Malaysian', flag: '🇲🇾' },
};

// Supported languages array
export const supportedLanguages: SupportedLanguage[] = ['id', 'en', 'zh', 'ja', 'ko', 'ru', 'ms'];

/**
 * Translate text using Google Translate API (free endpoint)
 * @param text - Text to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Translated text
 */
export async function translateText(
    text: string,
    targetLang: SupportedLanguage,
    sourceLang: SupportedLanguage = 'en'
): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (targetLang === sourceLang) return text;

    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Translation failed: ${response.status}`);
        }

        const data = await response.json();

        // Google Translate API returns an array of arrays
        // The translated text is in the first element of each inner array
        if (data && data[0] && Array.isArray(data[0])) {
            const translatedText = data[0]
                .map((item: any[]) => item[0])
                .filter(Boolean)
                .join('');
            return translatedText || text;
        }

        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text; // Return original text on error
    }
}

/**
 * Translate multiple texts at once
 * @param texts - Array of texts to translate
 * @param targetLang - Target language code
 * @param sourceLang - Source language code (default: 'en')
 * @returns Array of translated texts
 */
export async function translateMultiple(
    texts: string[],
    targetLang: SupportedLanguage,
    sourceLang: SupportedLanguage = 'en'
): Promise<string[]> {
    if (targetLang === sourceLang) return texts;

    // Translate in parallel with rate limiting
    const results: string[] = [];
    const batchSize = 5; // Translate 5 at a time to avoid rate limiting

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(text => translateText(text, targetLang, sourceLang))
        );
        results.push(...batchResults);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

// Base translations in English (source of truth)
export const baseTranslations = {
    // Navigation
    home: 'Tasks',
    calendar: 'Calendar',
    search: 'Search',
    settings: 'Settings',

    // Home
    taskList: 'TASK LIST',
    today: 'Today',
    upcoming: 'Upcoming',
    completed: 'Completed',
    completedFilter: 'Completed',
    highPriority: 'High Priority',
    priorityMain: 'Priority',
    later: 'Later',
    googleSyncActive: 'Google Sync Active',
    lastUpdated: 'Last',
    allDay: 'All Day',

    // Calendar
    month: 'MONTH',
    week: 'WEEK',
    noTasksForDate: 'No tasks for this date.',

    // Search
    searchPlaceholder: 'Search tasks, projects, reminders...',
    all: 'All',
    overdue: 'Overdue',
    shared: 'Shared',
    recentSearches: 'Recent Searches',
    searchResults: 'Search Results',
    noResults: 'No results found',

    // Settings
    accountSync: 'ACCOUNT & SYNC',
    googleAccount: 'Google Account',
    connectedAs: 'Connected as',
    manage: 'Manage',
    autoSync: 'Auto Sync',
    notifications: 'NOTIFICATIONS',
    allowNotifications: 'Allow Notifications',
    deadlines: 'Deadlines',
    dailyDigest: 'Daily Digest',
    general: 'GENERAL',
    darkMode: 'Dark Mode',
    language: 'Language',
    startWeekOn: 'Start Week On',
    monday: 'Monday',
    sunday: 'Sunday',
    support: 'SUPPORT',
    helpFaq: 'Help & FAQ',
    privacyPolicy: 'Privacy Policy',
    data: 'DATA',
    resetTasks: 'Reset Task Data',
    resetTasksSubtitle: 'Reload sample tasks',
    logout: 'Logout',
    version: 'Kini.do Version',

    // Task Detail
    taskDetail: 'Task Detail',
    dueDate: 'Due Date',
    reminder: 'Reminder',
    hourBefore: 'hour before',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    description: 'Description',
    noDescription: 'No description.',
    sharedWith: 'Shared with',
    edit: 'Edit',
    delete: 'Delete',
    taskNotFound: 'Task not found',
    back: 'Back',
    shareTask: 'Share Task',
    editTaskBtn: 'Edit Task',

    // Task Form
    newTask: 'New Task',
    editTask: 'Edit Task',
    title: 'Title',
    notes: 'Notes...',
    date: 'Date',
    time: 'Time',
    remindMe: 'Remind Me',
    none: 'None',
    googleTasks: 'Google Tasks',
    deleteTask: 'Delete Task',
    lastEdited: 'Last edited',

    // Share
    sharedItem: 'SHARED ITEM',
    userAccess: 'User Access',
    canEdit: 'Can Edit',
    canView: 'Can View',
    suggested: 'SUGGESTED',
    contacts: 'CONTACTS',
    copyInviteLink: 'Copy Invite Link',
    anyoneWithLink: 'Anyone with the link can view',
    shareTo: 'Share to',
    contact: 'Contact',
    task: 'Task',
    change: 'Change',

    // Alerts
    confirm: 'Confirm',
    cancel: 'Cancel',
    reset: 'Reset',
    success: 'Success',
    resetConfirmTitle: 'Reset Task Data',
    resetConfirmMessage: 'Are you sure you want to reset all tasks and reload sample data?',
    resetSuccessMessage: 'Task data has been reset',

    // Days
    sun: 'SUN',
    mon: 'MON',
    tue: 'TUE',
    wed: 'WED',
    thu: 'THU',
    fri: 'FRI',
    sat: 'SAT',

    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',

    // Loading states
    translating: 'Translating...',
    selectLanguage: 'Select Language',

    // Categories
    category: 'Category',
    categoryPersonal: 'Personal',
    categoryWork: 'Work',
    categoryHome: 'Home',
    categoryHealth: 'Health',
    categoryShopping: 'Shopping',
    categoryFinance: 'Finance',
    categoryStudy: 'Study',
    categoryOther: 'Other',
    addCategory: 'Add Category',
    selectCategory: 'Select Category',
    customCategory: 'Custom Category',
    newCategory: 'New Category',
    enterCategoryName: 'Enter category name',
    add: 'Add',
};

export type TranslationKey = keyof typeof baseTranslations;
export type Translations = Record<TranslationKey, string>;
