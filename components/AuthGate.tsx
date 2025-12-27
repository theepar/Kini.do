import { router, useRootNavigationState, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

interface AuthGateProps {
    children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        // Wait until navigation is ready
        if (!navigationState?.key) return;
        if (isLoading) return;

        const currentRoute = segments[0];
        const isAuthRoute = currentRoute === 'login' || currentRoute === 'welcome' || currentRoute === 'reset-password';

        if (!user && !isAuthRoute) {
            // User is not signed in and trying to access protected route
            router.replace('/login');
        } else if (user && isAuthRoute) {
            // User is signed in but on login or welcome page
            router.replace('/(tabs)');
        }
    }, [user, isLoading, segments, navigationState?.key]);

    if (isLoading || !navigationState?.key) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return <>{children}</>;
}
