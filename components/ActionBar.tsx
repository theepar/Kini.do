import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ActionBarProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

/**
 * Reusable bottom action bar component for non-homepage screens
 * Features: solid background, rounded top corners, flush bottom
 */
export function ActionBar({ children, style }: ActionBarProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    borderTopColor: colors.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },
});
