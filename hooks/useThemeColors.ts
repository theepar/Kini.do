import { Colors, hexToRgba } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMemo } from 'react';

export interface ThemeColors {
    // Base colors from Colors.ts
    text: string;
    textSecondary: string;
    background: string;
    cardBackground: string;
    surface: string;
    surfaceSecondary: string;
    tint: string;
    primary: string;
    icon: string;
    tabIconDefault: string;
    tabIconSelected: string;
    border: string;
    borderLight: string;
    success: string;
    warning: string;
    danger: string;
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    skeleton: string;
    tabInactive: string;
    tabActive: string;

    // Computed colors for UI consistency
    headerBackground: string;
    modalOverlay: string;
    switchTrackFalse: string;
    switchTrackTrue: string;
    inputBackground: string;
    divider: string;
}

export interface ThemedStyleOptions {
    card: {
        backgroundColor: string;
        borderColor: string;
    };
    input: {
        backgroundColor: string;
        color: string;
        placeholderColor: string;
    };
    header: {
        backgroundColor: string;
        borderColor: string;
    };
    modal: {
        backgroundColor: string;
        overlayColor: string;
    };
}

export function useThemeColors() {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';

    const colors = useMemo<ThemeColors>(() => {
        const baseColors = Colors[colorScheme];

        return {
            ...baseColors,
            // Computed colors based on theme
            headerBackground: isDark
                ? 'rgba(0, 0, 0, 0.95)'
                : baseColors.background,
            modalOverlay: 'rgba(0, 0, 0, 0.5)',
            switchTrackFalse: isDark ? '#3A3A3C' : '#E5E7EB',
            switchTrackTrue: '#34C759',
            inputBackground: isDark ? '#2C2C2E' : '#F3F4F6',
            divider: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',
        };
    }, [colorScheme, isDark]);

    const themedStyles = useMemo<ThemedStyleOptions>(() => ({
        card: {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
        },
        input: {
            backgroundColor: colors.inputBackground,
            color: colors.text,
            placeholderColor: colors.textSecondary,
        },
        header: {
            backgroundColor: colors.headerBackground,
            borderColor: colors.border,
        },
        modal: {
            backgroundColor: colors.cardBackground,
            overlayColor: colors.modalOverlay,
        },
    }), [colors]);

    /**
     * Get rgba color with alpha transparency
     */
    const getColorWithAlpha = (hex: string, alpha: number): string => {
        return hexToRgba(hex, alpha);
    };

    /**
     * Get priority color based on priority level
     */
    const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
        switch (priority) {
            case 'low': return colors.priorityLow;
            case 'medium': return colors.priorityMedium;
            case 'high': return colors.priorityHigh;
        }
    };

    /**
     * Get badge style with background and text color
     */
    const getBadgeStyle = (baseColor: string) => ({
        backgroundColor: getColorWithAlpha(baseColor, isDark ? 0.2 : 0.15),
        textColor: baseColor,
    });

    return {
        colors,
        isDark,
        colorScheme,
        themedStyles,
        getColorWithAlpha,
        getPriorityColor,
        getBadgeStyle,
    };
}

export default useThemeColors;
