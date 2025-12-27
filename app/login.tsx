import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Google Icon Component
const GoogleIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <Path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <Path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <Path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </Svg>
);

// Apple Icon Component
const AppleIcon = ({ color }: { color: string }) => (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill={color}>
        <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
);

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

    // Mode: 'login' | 'register' | 'forgotPassword'
    const [mode, setMode] = useState<'login' | 'register' | 'forgotPassword'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleEmailAuth = async () => {
        if (mode === 'forgotPassword') {
            if (!email) {
                setError('Mohon masukkan email Anda');
                return;
            }
            setIsLoading(true);
            setError('');
            setSuccessMessage('');

            const result = await resetPassword(email);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccessMessage('Link reset password telah dikirim ke email Anda');
                setMode('login');
            }
            setIsLoading(false);
            return;
        }

        if (!email || !password) {
            setError('Mohon isi semua kolom');
            return;
        }

        if (mode === 'register' && !name) {
            setError('Mohon masukkan nama Anda');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        if (mode === 'login') {
            const result = await signInWithEmail(email, password);
            if (result.error) {
                setError(result.error);
            }
        } else {
            const result = await signUpWithEmail(email, password, name);
            if (result.error) {
                setError(result.error);
            } else if (result.needsConfirmation) {
                setSuccessMessage('Silakan periksa email Anda untuk mengkonfirmasi akun');
                setMode('login');
            }
        }

        setIsLoading(false);
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithGoogle();
        } catch (e: any) {
            setError(e.message || 'Gagal masuk dengan Google');
        } finally {
            setIsLoading(false);
        }
    };

    const backgroundColor = isDark ? '#000000' : '#F2F2F7';
    const surfaceColor = isDark ? 'rgba(28, 28, 30, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    const inputBg = isDark ? '#2C2C2E' : '#F3F4F6';
    const textColor = isDark ? '#FFFFFF' : '#1E293B';
    const subtextColor = isDark ? '#9CA3AF' : '#64748B';
    const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

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
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoContainer}>
                                <MaterialIcons name="check-circle" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={[styles.logoText, { color: textColor }]}>Kini.do</Text>
                        </View>

                        <Text style={[styles.title, { color: textColor }]}>
                            {mode === 'login' ? 'Selamat Datang' : mode === 'register' ? 'Buat Akun' : 'Lupa Kata Sandi'}
                        </Text>
                        <Text style={[styles.subtitle, { color: subtextColor }]}>
                            {mode === 'forgotPassword'
                                ? 'Masukkan email untuk mereset kata sandi.'
                                : 'Aplikasi pengelola tugas all-in-one Anda.'}
                        </Text>
                    </View>

                    {/* Error/Success Messages */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {successMessage ? (
                        <View style={styles.successContainer}>
                            <MaterialIcons name="check-circle-outline" size={20} color="#10B981" />
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    {/* Glass Panel Form */}
                    <View style={[styles.glassPanel, { backgroundColor: surfaceColor, borderColor }]}>
                        {/* Name Input (Register only) */}
                        {mode === 'register' && (
                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                                    <MaterialIcons name="person" size={22} color={subtextColor} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: textColor }]}
                                        placeholder="Nama Lengkap"
                                        placeholderTextColor={subtextColor}
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>
                        )}

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                                <MaterialIcons name="mail" size={22} color={subtextColor} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: textColor }]}
                                    placeholder="Email atau Username"
                                    placeholderTextColor={subtextColor}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Password Input (not for forgot password) */}
                        {mode !== 'forgotPassword' && (
                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, { backgroundColor: inputBg }]}>
                                    <MaterialIcons name="lock" size={22} color={subtextColor} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: textColor }]}
                                        placeholder="Kata Sandi"
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

                                {mode === 'login' && (
                                    <TouchableOpacity
                                        style={styles.forgotBtn}
                                        onPress={() => {
                                            setMode('forgotPassword');
                                            setError('');
                                            setSuccessMessage('');
                                        }}
                                    >
                                        <Text style={styles.forgotText}>Lupa kata sandi?</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                            onPress={handleEmailAuth}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.submitBtnText}>
                                        {mode === 'login' ? 'Masuk' : mode === 'register' ? 'Daftar' : 'Kirim Link Reset'}
                                    </Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Back to login for forgot password */}
                        {mode === 'forgotPassword' && (
                            <TouchableOpacity
                                style={styles.backToLoginBtn}
                                onPress={() => {
                                    setMode('login');
                                    setError('');
                                    setSuccessMessage('');
                                }}
                            >
                                <MaterialIcons name="arrow-back" size={18} color="#3B82F6" />
                                <Text style={styles.backToLoginText}>Kembali ke Masuk</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Social Login Buttons (not for forgot password) */}
                    {mode !== 'forgotPassword' && (
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', borderColor }]}
                                onPress={handleGoogleAuth}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <GoogleIcon />
                                <Text style={[styles.socialBtnText, { color: textColor }]}>
                                    Lanjutkan dengan Google
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', borderColor }]}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <AppleIcon color={isDark ? '#FFFFFF' : '#000000'} />
                                <Text style={[styles.socialBtnText, { color: textColor }]}>
                                    Lanjutkan dengan Apple
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Toggle Login/Register (not for forgot password) */}
                    {mode !== 'forgotPassword' && (
                        <View style={styles.toggleContainer}>
                            <Text style={[styles.toggleText, { color: subtextColor }]}>
                                {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                                setSuccessMessage('');
                            }}>
                                <Text style={styles.toggleLink}>
                                    {mode === 'login' ? 'Daftar' : 'Masuk'}
                                </Text>
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
        marginBottom: 24,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    logoContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '700',
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 26,
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
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        gap: 10,
    },
    successText: {
        color: '#10B981',
        fontSize: 14,
        flex: 1,
        fontWeight: '500',
    },
    glassPanel: {
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
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
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
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
    socialContainer: {
        gap: 12,
        marginBottom: 24,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    socialBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    toggleText: {
        fontSize: 14,
    },
    toggleLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3B82F6',
    },
    backToLoginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#3B82F6',
        backgroundColor: 'transparent',
    },
    backToLoginText: {
        color: '#3B82F6',
        fontSize: 15,
        fontWeight: '600',
    },
});
