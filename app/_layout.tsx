import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.primary,
    notification: Colors.dark.tint,
  },
};

const KiniLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    primary: Colors.light.primary,
    notification: Colors.light.tint,
  },
};


import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Inter': require('../assets/fonts/Inter-Reguler.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Reguler.ttf'),
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

import { AuthGate } from '@/components/AuthGate';
import { AuthProvider } from '@/context/AuthContext';
import { CalendarSyncProvider } from '@/context/CalendarSyncContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { PreferencesProvider, usePreferences } from '@/context/PreferencesContext';
import { TaskProvider } from '@/context/TaskContext';
import { supabase } from '@/lib/supabase';
import { notifications } from '@/services/notifications';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

function AppThemeWrapper({ children }: { children: React.ReactNode }) {
  const { themeMode } = usePreferences();
  const systemScheme = useColorScheme();

  const theme = themeMode === 'system'
    ? (systemScheme === 'dark' ? KiniDarkTheme : KiniLightTheme)
    : (themeMode === 'dark' ? KiniDarkTheme : KiniLightTheme);

  return (
    <ThemeProvider value={theme}>
      {children}
    </ThemeProvider>
  );
}

function RootLayoutNav({ showWelcome }: { showWelcome: boolean }) {
  const colorScheme = useColorScheme();

  // Request notification permission on app launch
  useEffect(() => {
    notifications.requestPermissions();
  }, []);

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        // Extract tokens from URL
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');

          if (accessToken && type === 'recovery') {
            // Set the session for password reset
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            // Navigate to reset password screen
            router.replace('/reset-password');
          }
        }
      }
    };

    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <PreferencesProvider>
        <TaskProvider>
          <CalendarSyncProvider>
            <LanguageProvider>
              <AppThemeWrapper>
                <AuthGate>
                  <Stack
                    screenOptions={{
                      headerShown: false,

                      animation: 'slide_from_bottom',
                      animationDuration: 280,
                      gestureEnabled: true,
                      gestureDirection: 'vertical',
                      freezeOnBlur: true,
                    }}
                    initialRouteName={showWelcome ? 'welcome' : '(tabs)'}
                  >
                    <Stack.Screen
                      name="welcome"
                      options={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 300,
                      }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{
                        headerShown: false,
                        animation: 'none',
                      }}
                    />
                    <Stack.Screen
                      name="modal"
                      options={{
                        presentation: 'containedTransparentModal',
                        headerShown: false,
                        animation: 'slide_from_bottom',
                        animationDuration: 280,
                        contentStyle: { backgroundColor: 'transparent' },
                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                      }}
                    />
                    <Stack.Screen
                      name="task/[id]"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_bottom',
                        animationDuration: 280,

                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                      }}
                    />
                    <Stack.Screen
                      name="task/share"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_bottom',
                        animationDuration: 280,

                        gestureEnabled: true,
                        gestureDirection: 'vertical',
                      }}
                    />
                    <Stack.Screen
                      name="login"
                      options={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 300,

                      }}
                    />
                    <Stack.Screen
                      name="reset-password"
                      options={{
                        headerShown: false,
                        animation: 'fade',
                        animationDuration: 300,

                      }}
                    />
                  </Stack>
                </AuthGate>
              </AppThemeWrapper>
            </LanguageProvider>
          </CalendarSyncProvider>
        </TaskProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
