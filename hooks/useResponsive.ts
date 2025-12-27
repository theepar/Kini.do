import { useWindowDimensions } from 'react-native';

// Breakpoints for responsive design
export const Breakpoints = {
    small: 320,   // Small phones (iPhone SE)
    medium: 375,  // Standard phones (iPhone 12/13)
    large: 414,   // Large phones (iPhone Plus/Max)
    tablet: 768,  // Tablets
};

export type DeviceSize = 'small' | 'medium' | 'large' | 'tablet';

/**
 * Hook to get responsive values based on screen width
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();

    const getDeviceSize = (): DeviceSize => {
        if (width >= Breakpoints.tablet) return 'tablet';
        if (width >= Breakpoints.large) return 'large';
        if (width >= Breakpoints.medium) return 'medium';
        return 'small';
    };

    const deviceSize = getDeviceSize();
    const isTablet = width >= Breakpoints.tablet;
    const isSmallDevice = width < Breakpoints.medium;

    // Responsive font sizes
    const fontSize = {
        xs: isTablet ? 14 : isSmallDevice ? 10 : 12,
        sm: isTablet ? 16 : isSmallDevice ? 12 : 14,
        base: isTablet ? 18 : isSmallDevice ? 14 : 16,
        lg: isTablet ? 22 : isSmallDevice ? 16 : 18,
        xl: isTablet ? 26 : isSmallDevice ? 20 : 22,
        '2xl': isTablet ? 32 : isSmallDevice ? 24 : 28,
        '3xl': isTablet ? 40 : isSmallDevice ? 28 : 34,
    };

    // Responsive spacing
    const spacing = {
        xs: isTablet ? 6 : isSmallDevice ? 2 : 4,
        sm: isTablet ? 12 : isSmallDevice ? 6 : 8,
        base: isTablet ? 20 : isSmallDevice ? 12 : 16,
        lg: isTablet ? 28 : isSmallDevice ? 16 : 20,
        xl: isTablet ? 36 : isSmallDevice ? 20 : 24,
        '2xl': isTablet ? 48 : isSmallDevice ? 24 : 32,
    };

    // Responsive border radius
    const borderRadius = {
        sm: isTablet ? 10 : 8,
        base: isTablet ? 16 : isSmallDevice ? 12 : 14,
        lg: isTablet ? 24 : isSmallDevice ? 16 : 20,
        xl: isTablet ? 32 : isSmallDevice ? 20 : 28,
        full: 999,
    };

    // Responsive button heights
    const buttonHeight = {
        sm: isTablet ? 40 : isSmallDevice ? 32 : 36,
        base: isTablet ? 52 : isSmallDevice ? 44 : 48,
        lg: isTablet ? 64 : isSmallDevice ? 52 : 56,
    };

    // Responsive icon sizes
    const iconSize = {
        sm: isTablet ? 20 : isSmallDevice ? 16 : 18,
        base: isTablet ? 28 : isSmallDevice ? 20 : 24,
        lg: isTablet ? 36 : isSmallDevice ? 28 : 32,
    };

    return {
        width,
        height,
        deviceSize,
        isTablet,
        isSmallDevice,
        fontSize,
        spacing,
        borderRadius,
        buttonHeight,
        iconSize,
    };
}

/**
 * Scale a value based on screen width
 */
export function scaleSize(size: number, baseWidth = 375): number {
    const { width } = useWindowDimensions();
    return Math.round((size * width) / baseWidth);
}
