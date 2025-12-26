import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark theme matching the iOS design
const KiniDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#007AFF',
  },
};


// ... (existing imports)

import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
        setShowWelcome(hasSeenWelcome !== 'true');
      } catch {
        setShowWelcome(true);
      }
      setIsReady(true);
    }

    if (loaded) {
      checkFirstLaunch();
    }
  }, [loaded]);

  useEffect(() => {
    if (isReady && loaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, loaded]);

  if (!loaded || !isReady || showWelcome === null) {
    return null;
  }

  return (
    <AppThemeProvider>
      <RootLayoutNav showWelcome={showWelcome} />
    </AppThemeProvider>
  );
}

import { TaskProvider } from '@/context/TaskContext';

function RootLayoutNav({ showWelcome }: { showWelcome: boolean }) {
  const colorScheme = useColorScheme();

  return (
    <TaskProvider>
      <ThemeProvider value={KiniDarkTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000000' },
          }}
          initialRouteName={showWelcome ? 'welcome' : '(tabs)'}
        >
          <Stack.Screen
            name="welcome"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="task/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="task/share"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
      </ThemeProvider>
    </TaskProvider>
  );
}
