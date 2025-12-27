import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    style?: ViewStyle;
    noPadding?: boolean;
}

export function Card({
    children,
    variant = 'default',
    style,
    noPadding = false,
}: CardProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const { spacing, borderRadius } = useResponsive();

    const getBackgroundColor = (): string => {
        switch (variant) {
            case 'outlined':
                return 'transparent';
            default:
                return colors.cardBackground;
        }
    };

    const getBorderWidth = (): number => {
        return variant === 'outlined' ? 1 : 0;
    };

    const getShadowStyle = (): ViewStyle => {
        if (variant === 'elevated') {
            return {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 5,
            };
        }
        if (variant === 'default') {
            return {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
            };
        }
        return {};
    };

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: colors.border,
                    borderWidth: getBorderWidth(),
                    borderRadius: borderRadius.lg,
                    padding: noPadding ? 0 : spacing.base,
                },
                getShadowStyle(),
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
    },
});
