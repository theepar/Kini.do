import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_TOKENS_KEY = 'kini_google_tokens';

interface GoogleTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}

export function useGoogleAuth() {
    const [tokens, setTokens] = useState<GoogleTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<any>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'openid',
            'profile',
            'email',
        ],
    });

    // Load saved tokens on mount
    useEffect(() => {
        loadTokens();
    }, []);

    // Handle OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                const newTokens: GoogleTokens = {
                    accessToken: authentication.accessToken,
                    refreshToken: authentication.refreshToken || undefined,
                    expiresAt: Date.now() + (authentication.expiresIn || 3600) * 1000,
                };
                saveTokens(newTokens);
                fetchUserInfo(newTokens.accessToken);
            }
        }
    }, [response]);

    const loadTokens = async () => {
        try {
            const stored = await AsyncStorage.getItem(GOOGLE_TOKENS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as GoogleTokens;
                // Check if token is expired
                if (parsed.expiresAt > Date.now()) {
                    setTokens(parsed);
                    fetchUserInfo(parsed.accessToken);
                } else {
                    // Token expired, clear it
                    await AsyncStorage.removeItem(GOOGLE_TOKENS_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTokens = async (newTokens: GoogleTokens) => {
        try {
            await AsyncStorage.setItem(GOOGLE_TOKENS_KEY, JSON.stringify(newTokens));
            setTokens(newTokens);
        } catch (error) {
            console.error('Error saving tokens:', error);
        }
    };

    const fetchUserInfo = async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await response.json();
            setUserInfo(data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const signIn = useCallback(async () => {
        if (request) {
            await promptAsync();
        }
    }, [request, promptAsync]);

    const signOut = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(GOOGLE_TOKENS_KEY);
            setTokens(null);
            setUserInfo(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, []);

    return {
        isAuthenticated: !!tokens,
        isLoading,
        tokens,
        userInfo,
        signIn,
        signOut,
        request,
    };
}
