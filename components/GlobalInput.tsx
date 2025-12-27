import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';

interface GlobalInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export function GlobalInput({
    label,
    error,
    containerStyle,
    style,
    ...props
}: GlobalInputProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const { fontSize, spacing, borderRadius } = useResponsive();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text
                    style={[
                        styles.label,
                        {
                            color: colors.text,
                            fontSize: fontSize.sm,
                            marginBottom: spacing.sm,
                        },
                    ]}
                >
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor={colors.textSecondary}
                style={[
                    styles.input,
                    {
                        backgroundColor: isDark ? colors.surface : colors.background,
                        color: colors.text,
                        borderColor: error ? colors.danger : colors.border,
                        borderRadius: borderRadius.base,
                        fontSize: fontSize.base,
                        paddingHorizontal: spacing.base,
                        paddingVertical: spacing.base,
                    },
                    props.multiline && {
                        minHeight: 100,
                        textAlignVertical: 'top',
                    },
                    style,
                ]}
                {...props}
            />
            {error && (
                <Text
                    style={[
                        styles.error,
                        {
                            color: colors.danger,
                            fontSize: fontSize.xs,
                            marginTop: spacing.xs,
                        },
                    ]}
                >
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    input: {
        borderWidth: 1,
        fontFamily: 'Inter',
    },
    error: {
        fontWeight: '500',
        fontFamily: 'Inter',
    },
});
