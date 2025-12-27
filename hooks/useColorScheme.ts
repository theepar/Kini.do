import { usePreferences } from '@/context/PreferencesContext';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
    const { themeMode } = usePreferences();
    const systemScheme = useRNColorScheme();

    if (themeMode === 'system') {
        return systemScheme || 'light';
    }

    return themeMode;
}
