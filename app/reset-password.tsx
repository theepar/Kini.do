import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const params = useLocalSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const backgroundColor = isDark ? '#000000' : '#F2F2F7';
    const surfaceColor = isDark ? 'rgba(28, 28, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';
    const textColor = isDark ? '#FFFFFF' : '#1E293B';
    const subtextColor = isDark ? '#9CA3AF' : '#64748B';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Check if we have a valid reset session from the URL
    useEffect(() => {
        checkResetSession();
    }, []);

    const checkResetSession = async () => {
        try {
            // Supabase handles the token from URL automatically
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Session check error:', error);
                setError('Link reset tidak valid atau sudah kadaluarsa');
                setIsValidSession(false);
            } else if (session) {
                setIsValidSession(true);
            } else {
                setError('Silakan gunakan link reset dari email Anda');
                setIsValidSession(false);
            }
        } catch (err) {
            console.error('Error checking session:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setIsValidSession(false);
        } finally {
            setCheckingSession(false);
        }
    };

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return 'Password minimal 8 karakter';
        }
        if (!/[A-Z]/.test(pwd)) {
            return 'Password harus mengandung huruf besar';
        }
        if (!/[a-z]/.test(pwd)) {
            return 'Password harus mengandung huruf kecil';
        }
        if (!/[0-9]/.test(pwd)) {
            return 'Password harus mengandung angka';
        }
        return null;
    };

    const handleResetPassword = async () => {
        setError('');

        // Validate passwords
        if (!password || !confirmPassword) {
            setError('Mohon isi semua kolom');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        const validationError = validatePassword(password);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                // Sign out after password reset for security
                await supabase.auth.signOut();

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.replace('/login');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Gagal mereset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        router.replace('/login');
    };

    if (checkingSession) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={[styles.loadingText, { color: textColor }]}>
                    Memverifikasi link reset...
                </Text>
            </View>
        );
    }

    if (success) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor }]}>
                <View style={styles.successIcon}>
                    <MaterialIcons name="check-circle" size={64} color="#10B981" />
                </View>
                <Text style={[styles.successTitle, { color: textColor }]}>
                    Password Berhasil Diubah!
                </Text>
                <Text style={[styles.successSubtitle, { color: subtextColor }]}>
                    Anda akan diarahkan ke halaman login...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Background Gradients */}
            <View style={styles.gradientContainer}>
                <View style={[styles.gradientBlob, styles.gradientBlob1]} />
                <View style={[styles.gradientBlob, styles.gradientBlob2]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <MaterialIcons name="lock-reset" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.title, { color: textColor }]}>
                            Reset Password
                        </Text>
                        <Text style={[styles.subtitle, { color: subtextColor }]}>
                            Buat password baru untuk akun Anda
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {!isValidSession ? (
                        // Invalid session - show error and login button
                        <View style={styles.invalidSessionContainer}>
                            <TouchableOpacity
                                style={styles.loginBtn}
                                onPress={handleGoToLogin}
                            >
                                <Text style={styles.loginBtnText}>Kembali ke Login</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Valid session - show password form
                        <View style={[styles.glassPanel, { backgroundColor: surfaceColor, borderColor }]}>
                            {/* Password Requirements */}
                            <View style={styles.requirementsContainer}>
                                <Text style={[styles.requirementsTitle, { color: textColor }]}>
                                    Persyaratan Password:
                                </Text>
                                <Text style={[styles.requirementItem, { color: subtextColor }]}>
                                    • Minimal 8 karakter
                                </Text>
                                <Text style={[styles.requirementItem, { color: subtextColor }]}>
                                    • Mengandung huruf besar (A-Z)
                                </Text>
                                <Text style={[styles.requirementItem, { color: subtextColor }]}>
                                    • Mengandung huruf kecil (a-z)
                                </Text>
                                <Text style={[styles.requirementItem, { color: subtextColor }]}>
                                    • Mengandung angka (0-9)
                                </Text>
                            </View>

                            {/* New Password Input */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: subtextColor }]}>
                                    Password Baru
                                </Text>
                                <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                                    <MaterialIcons name="lock" size={22} color={subtextColor} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: textColor }]}
                                        placeholder="Masukkan password baru"
                                        placeholderTextColor={subtextColor}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        <MaterialIcons
                                            name={showPassword ? 'visibility' : 'visibility-off'}
                                            size={22}
                                            color={subtextColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: subtextColor }]}>
                                    Konfirmasi Password
                                </Text>
                                <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                                    <MaterialIcons name="lock-outline" size={22} color={subtextColor} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: textColor }]}
                                        placeholder="Masukkan ulang password"
                                        placeholderTextColor={subtextColor}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                                        <MaterialIcons
                                            name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                            size={22}
                                            color={subtextColor}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.submitBtnText}>Reset Password</Text>
                                        <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: insets.bottom + 20 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    successIcon: {
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    gradientBlob: {
        position: 'absolute',
        borderRadius: 999,
    },
    gradientBlob1: {
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    gradientBlob2: {
        bottom: -50,
        left: -100,
        width: 250,
        height: 250,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        gap: 10,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    invalidSessionContainer: {
        alignItems: 'center',
        marginTop: 24,
    },
    loginBtn: {
        backgroundColor: '#3B82F6',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    loginBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    glassPanel: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    requirementsContainer: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 12,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    requirementItem: {
        fontSize: 13,
        marginTop: 4,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeBtn: {
        padding: 4,
    },
    submitBtn: {
        backgroundColor: '#3B82F6',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
