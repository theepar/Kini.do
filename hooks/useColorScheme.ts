import { PreferencesContext } from '@/context/PreferencesContext';
import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
    const systemScheme = useRNColorScheme();

    // Safely try to access preferences context - may not be available yet in RootLayoutNav
    const preferencesContext = useContext(PreferencesContext);

    // If no provider is available, fall back to system color scheme
    if (!preferencesContext) {
        return systemScheme || 'light';
    }

    const { themeMode } = preferencesContext;

    if (themeMode === 'system') {
        return systemScheme || 'light';
    }

    return themeMode;
}
