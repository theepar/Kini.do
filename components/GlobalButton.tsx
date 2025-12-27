import { Colors, Palette } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsive } from '@/hooks/useResponsive';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface GlobalButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconPosition?: 'left' | 'right';
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function GlobalButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    style,
    textStyle,
}: GlobalButtonProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const { buttonHeight, fontSize, spacing, borderRadius } = useResponsive();

    const getBackgroundColor = (): string => {
        if (disabled) return isDark ? '#374151' : '#E5E7EB';
        switch (variant) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return isDark ? colors.surface : Palette.gray200;
            case 'outline':
            case 'ghost':
                return 'transparent';
            case 'danger':
                return colors.danger;
            default:
                return colors.primary;
        }
    };

    const getTextColor = (): string => {
        if (disabled) return isDark ? '#6B7280' : '#9CA3AF';
        switch (variant) {
            case 'primary':
            case 'danger':
                return Palette.white;
            case 'secondary':
                return colors.text;
            case 'outline':
                return colors.primary;
            case 'ghost':
                return colors.text;
            default:
                return Palette.white;
        }
    };

    const getBorderColor = (): string => {
        if (disabled) return isDark ? '#374151' : '#E5E7EB';
        if (variant === 'outline') return colors.primary;
        return 'transparent';
    };

    const getHeight = (): number => {
        switch (size) {
            case 'sm': return buttonHeight.sm;
            case 'lg': return buttonHeight.lg;
            default: return buttonHeight.base;
        }
    };

    const getFontSize = (): number => {
        switch (size) {
            case 'sm': return fontSize.sm;
            case 'lg': return fontSize.lg;
            default: return fontSize.base;
        }
    };

    const getIconSize = (): number => {
        switch (size) {
            case 'sm': return 16;
            case 'lg': return 24;
            default: return 20;
        }
    };

    const height = getHeight();
    const textColor = getTextColor();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    height,
                    borderRadius: borderRadius.base,
                    paddingHorizontal: spacing.lg,
                },
                fullWidth && styles.fullWidth,
                variant === 'primary' && !disabled && {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                },
                style,
            ]}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={textColor} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <MaterialIcons
                            name={icon}
                            size={getIconSize()}
                            color={textColor}
                            style={{ marginRight: spacing.sm }}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            {
                                color: textColor,
                                fontSize: getFontSize(),
                            },
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <MaterialIcons
                            name={icon}
                            size={getIconSize()}
                            color={textColor}
                            style={{ marginLeft: spacing.sm }}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
    },
});
