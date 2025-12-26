import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

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
    const systemColorScheme = useRNColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('dark');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem('userTheme');
            if (storedTheme === 'light' || storedTheme === 'dark') {
                setThemeState(storedTheme);
            } else {
                // Default to dark if nothing stored, or system if you prefer
                setThemeState('dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            await AsyncStorage.setItem('userTheme', newTheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Prevent flash of wrong theme by rendering nothing until loaded?
    // Or just render children with default (dark). isLoaded checks can be done if strict.
    // For now we render children immediately to adapt quickly, but might flash.
    // Given user preference is dark, default dark is safe.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
