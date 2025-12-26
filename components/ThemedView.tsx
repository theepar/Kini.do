import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
};

export function ThemedView({
    style,
    lightColor,
    darkColor,
    ...rest
}: ThemedViewProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const backgroundColor = colorScheme === 'light'
        ? (lightColor ?? Colors.light.cardBackground)
        : (darkColor ?? Colors.dark.cardBackground);

    return <View style={[{ backgroundColor }, style]} {...rest} />;
}
