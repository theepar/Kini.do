import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
    user: User | null;
    session: Session | null;
    googleAccessToken: string | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error?: string }>;
}

const GOOGLE_TOKEN_KEY = 'kini_google_token';

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    googleAccessToken: null,
    isLoading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => ({}),
    signUpWithEmail: async () => ({}),
    signOut: async () => { },
    resetPassword: async () => ({}),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Load persisted Google Token
        AsyncStorage.getItem(GOOGLE_TOKEN_KEY).then(token => {
            if (token) setGoogleAccessToken(token);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'kini://auth/callback',
                    skipBrowserRedirect: true,
                    scopes: 'https://www.googleapis.com/auth/calendar',
                },
            });

            if (error) throw error;

            if (data.url) {
                const result = await WebBrowser.openAuthSessionAsync(
                    data.url,
                    'kini://auth/callback'
                );

                if (result.type === 'success' && result.url) {
                    // Extract tokens from the URL
                    const url = result.url;

                    // Check for hash fragment (tokens are in fragment)
                    if (url.includes('#')) {
                        const fragment = url.split('#')[1];
                        const params = new URLSearchParams(fragment);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');
                        const providerToken = params.get('provider_token');

                        // Store Google provider token for Calendar API
                        if (providerToken) {
                            console.log('Got Google provider token');
                            setGoogleAccessToken(providerToken);
                            AsyncStorage.setItem(GOOGLE_TOKEN_KEY, providerToken);
                        }

                        if (accessToken) {
                            await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken || '',
                            });
                        }
                    }
                } else if (result.type === 'cancel' || result.type === 'dismiss') {
                    // User cancelled, no error needed
                    console.log('User cancelled Google sign in');
                }
            }
        } catch (error: any) {
            console.error('Google sign in error:', error);
            Alert.alert('Error', error.message || 'Gagal masuk dengan Google');
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    return { error: 'Please confirm your email before signing in' };
                }
                return { error: error.message };
            }

            return {};
        } catch (error: any) {
            return { error: error.message || 'Failed to sign in' };
        }
    };

    const signUpWithEmail = async (email: string, password: string, name: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: name,
                        full_name: name,
                    },
                    emailRedirectTo: 'kini://auth/callback',
                },
            });

            if (error) {
                return { error: error.message };
            }

            return { needsConfirmation: true };
        } catch (error: any) {
            return { error: error.message || 'Failed to sign up' };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.removeItem(GOOGLE_TOKEN_KEY);
            setGoogleAccessToken(null);
        } catch (error: any) {
            console.error('Sign out error:', error);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'kini://auth/reset-password',
            });

            if (error) {
                return { error: error.message };
            }

            return {};
        } catch (error: any) {
            return { error: error.message || 'Failed to send reset email' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            googleAccessToken,
            isLoading,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            signOut,
            resetPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
