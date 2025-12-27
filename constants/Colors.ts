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
    text: '#111111',
    textSecondary: '#86868B',

    // Backgrounds
    background: '#F6F7F8',
    cardBackground: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',

    // Accent
    tint: '#13a4ec',
    primary: '#13a4ec',

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

    // Neutral / Skeleton
    skeleton: '#E2E8F0',
    tabInactive: '#94a3b8',
    tabActive: '#000000',
  },
  dark: {
    // Text
    text: Palette.white,
    textSecondary: '#94a3b8',

    // Backgrounds
    background: Palette.black,
    cardBackground: Palette.gray800,
    surface: '#1C1C1E',
    surfaceSecondary: '#2C3A42',

    // Accent
    tint: '#13a4ec',
    primary: '#13a4ec',

    // Icons
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#13a4ec',

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

    // Neutral / Skeleton
    skeleton: '#1e293b',
    tabInactive: '#475569',
    tabActive: '#FFFFFF',
  },
};

// Common UI Styles helper (Clean Code)
export const UIStyles = {
  getCardStyle: (isDark: boolean) => ({
    backgroundColor: isDark ? Colors.dark.cardBackground : Colors.light.cardBackground,
    borderColor: isDark ? Colors.dark.border : Colors.light.border,
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: isDark ? 5 : 2,
  }),
  getShadow: (isDark: boolean) => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.03,
    shadowRadius: 10,
    elevation: isDark ? 5 : 2,
  }),
};

export const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
