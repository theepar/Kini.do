// iOS-style Theme Palette
// Global color constants for consistent theming

// Raw color palette for reference
export const Palette = {
  // Primary colors
  blue: '#007AFF',
  cyan: '#13a4ec',

  // Semantic colors
  green: '#34C759',
  greenDark: '#30D158',
  orange: '#FF9500',
  orangeDark: '#FF9F0A',
  red: '#FF3B30',
  redDark: '#FF453A',

  // Gray scale
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F2F2F7',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1C1C1E',
  gray900: '#111827',

  // Accent colors
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  indigo: '#6366F1',
};

export const Colors = {
  light: {
    // Text
    text: Palette.black,
    textSecondary: '#8E8E93',

    // Backgrounds
    background: Palette.gray100,
    cardBackground: Palette.white,
    surface: '#F9F9F9',
    surfaceSecondary: Palette.gray200,

    // Accent
    tint: Palette.blue,
    primary: Palette.blue,

    // Icons
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: Palette.blue,

    // Borders
    border: 'rgba(0, 0, 0, 0.1)',
    borderLight: 'rgba(0, 0, 0, 0.05)',

    // Status
    success: Palette.green,
    warning: Palette.orange,
    danger: Palette.red,

    // Priority
    priorityLow: Palette.green,
    priorityMedium: Palette.orange,
    priorityHigh: Palette.red,
  },
  dark: {
    // Text
    text: Palette.white,
    textSecondary: '#94a3b8',

    // Backgrounds
    background: Palette.black,
    cardBackground: Palette.gray800,
    surface: '#2C2C2E',
    surfaceSecondary: '#2C3A42',

    // Accent
    tint: Palette.cyan,
    primary: Palette.cyan,

    // Icons
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: Palette.cyan,

    // Borders
    border: 'rgba(255, 255, 255, 0.05)',
    borderLight: 'rgba(255, 255, 255, 0.08)',

    // Status
    success: Palette.greenDark,
    warning: Palette.orangeDark,
    danger: Palette.redDark,

    // Priority
    priorityLow: Palette.greenDark,
    priorityMedium: Palette.orangeDark,
    priorityHigh: Palette.redDark,
  },
};
