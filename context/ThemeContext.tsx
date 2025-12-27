import { usePreferences } from '@/context/PreferencesContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { createContext } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
});


export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}


export function useTheme(): ThemeContextType {
    const colorScheme = useColorScheme();
    const { themeMode, setThemeMode } = usePreferences();
    
    const theme: ThemeType = colorScheme === 'dark' ? 'dark' : 'light';
    
    const toggleTheme = async () => {
        // Toggle between light and dark (not system)
        await setThemeMode(theme === 'dark' ? 'light' : 'dark');
    };
    
    const setTheme = async (newTheme: ThemeType) => {
        await setThemeMode(newTheme);
    };
    
    return { theme, toggleTheme, setTheme };
}
