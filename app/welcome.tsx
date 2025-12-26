import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 200;

const FEATURES = [
    {
        icon: 'sync',
        iconType: 'material',
        title: 'Sinkronisasi Google',
        description: 'Terhubung otomatis dengan kalender Anda.',
        color: '#007AFF',
        bgColor: 'rgba(0, 122, 255, 0.15)',
    },
    {
        icon: 'notifications-active',
        iconType: 'material',
        title: 'Pengingat',
        description: 'Notifikasi pintar agar tugas tidak terlewat.',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.15)',
    },
    {
        icon: 'ios-share',
        iconType: 'material',
        title: 'Berbagi Tugas',
        description: 'Kolaborasi tim yang mudah dan cepat.',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.15)',
    },
];

export default function WelcomeScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const floatAnim = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Floating animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim2, {
                        toValue: -8,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim2, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, 1500);
    }, []);

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
        setActiveIndex(index);
    };

    const handleStart = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        router.replace('/(tabs)');
    };

    const handleLogin = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradients */}
            <View style={styles.bgGradient1} />
            <View style={styles.bgGradient2} />

            {/* Illustration Section */}
            <View style={styles.illustrationContainer}>
                {/* Background floating card */}
                <Animated.View
                    style={[
                        styles.bgCard,
                        { transform: [{ translateY: floatAnim2 }, { rotate: '6deg' }] }
                    ]}
                />

                {/* Main Icon Card */}
                <Animated.View
                    style={[
                        styles.mainCard,
                        { transform: [{ translateY: floatAnim }] }
                    ]}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.checkIcon}>
                            <MaterialIcons name="check-circle" size={20} color="#007AFF" />
                        </View>
                        <Text style={styles.cardBrand}>KINI.DO</Text>
                    </View>

                    <View style={styles.cardLines}>
                        <View style={styles.linesGroup}>
                            <View style={[styles.line, { width: 96, height: 10 }]} />
                            <View style={[styles.line, { width: 64, height: 10 }]} />
                        </View>
                        <View style={[styles.linesGroup, { paddingTop: 8 }]}>
                            <View style={[styles.line, { width: 80, height: 10 }]} />
                        </View>
                        <View style={[styles.linesGroup, { paddingTop: 8, opacity: 0.5 }]}>
                            <View style={[styles.line, { width: 112, height: 10 }]} />
                        </View>
                    </View>

                    <View style={styles.cardFooter}>
                        <View style={[styles.smallIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                            <MaterialIcons name="share" size={14} color="#10B981" />
                        </View>
                        <View style={[styles.smallIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                            <MaterialIcons name="notifications" size={14} color="#F59E0B" />
                        </View>
                    </View>
                </Animated.View>

                {/* Floating Icons */}
                <Animated.View style={[styles.floatingIcon, styles.calendarIcon]}>
                    <MaterialIcons name="event-available" size={24} color="#EA4335" />
                </Animated.View>

                <Animated.View style={[styles.floatingIcon, styles.syncIcon]}>
                    <MaterialIcons name="cloud-sync" size={24} color="#007AFF" />
                </Animated.View>
            </View>

            {/* Hero Text */}
            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                    Selamat Datang di{'\n'}
                    <Text style={styles.heroHighlight}>Kini.do</Text>
                </Text>
                <Text style={styles.heroSubtitle}>
                    Aplikasi pengelola tugas all-in-one dengan sinkronisasi Google, pengingat, dan fitur berbagi.
                </Text>
            </View>

            {/* Feature Cards Carousel */}
            <View style={styles.carouselContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + 16}
                    decelerationRate="fast"
                    contentContainerStyle={styles.featuresContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <View style={styles.cardIconHeader}>
                                {/* Background Number/Icon handled by View above? No, design has icon bg */}
                                <View style={[styles.featureIconBg, { backgroundColor: feature.bgColor }]}>
                                    {feature.iconType === 'material' ? (
                                        <MaterialIcons name={feature.icon as any} size={28} color={feature.color} />
                                    ) : (
                                        <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                                    )}
                                </View>
                                {/* Floating large icon opacity handled by View above? Design has absolute icon */}
                                <View style={styles.bgIconOverlay}>
                                    {feature.iconType === 'material' ? (
                                        <MaterialIcons name={feature.icon as any} size={60} color={feature.color} />
                                    ) : (
                                        <Ionicons name={feature.icon as any} size={60} color={feature.color} />
                                    )}
                                </View>
                            </View>

                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDesc}>{feature.description}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Page Indicators */}
            <View style={styles.indicators}>
                {FEATURES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            activeIndex === index ? styles.indicatorActive : styles.indicatorInactive,
                        ]}
                    />
                ))}
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStart}
                    activeOpacity={0.9}
                >
                    <Text style={styles.startButtonText}>Mulai Sekarang</Text>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                    <Text style={styles.loginText}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={handleLogin}>
                        <Text style={styles.loginLink}>Masuk</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    bgGradient1: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderRadius: 200,
        opacity: 0.6,
    },
    bgGradient2: {
        position: 'absolute',
        bottom: -100,
        right: -100,
        width: 350,
        height: 350,
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderRadius: 175,
        opacity: 0.6,
    },
    illustrationContainer: {
        flex: 1,
        maxHeight: '40%', // matches max-h-[40vh]
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 56, // pt-14
        paddingBottom: 16, // pb-4
    },
    bgCard: {
        position: 'absolute',
        width: 160,
        height: 160,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32,
        transform: [{ translateX: 56 }, { translateY: 40 }], // translate-x-14 translate-y-10
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    mainCard: {
        width: 192, // w-48 ~ 192px
        height: 224, // h-56 ~ 224px
        backgroundColor: '#1C1C1E',
        borderRadius: 40,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 122, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBrand: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '600',
        letterSpacing: 1,
    },
    cardLines: {
        flex: 1,
        gap: 12,
    },
    linesGroup: {
        gap: 8,
    },
    line: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 999,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    smallIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingIcon: {
        position: 'absolute',
        backgroundColor: '#1C1C1E',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    calendarIcon: {
        top: 40,
        right: 48, // Adjusted position
    },
    syncIcon: {
        bottom: 24,
        left: 24, // Adjusted position
    },
    heroSection: {
        paddingHorizontal: 32,
        alignItems: 'center',
        marginBottom: 16,
        zIndex: 20,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 40,
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    heroHighlight: {
        color: '#007AFF',
    },
    heroSubtitle: {
        fontSize: 17,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    carouselContainer: {
        marginBottom: 16,
        zIndex: 20,
    },
    featuresContent: {
        paddingHorizontal: 24,
        gap: 16,
    },
    featureCard: {
        width: CARD_WIDTH,
        padding: 20,
        backgroundColor: '#1C1C1E',
        borderRadius: 32,
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        position: 'relative',
    },
    cardIconHeader: {
        marginBottom: 16,
    },
    featureIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    bgIconOverlay: {
        position: 'absolute',
        top: -16,
        right: -16,
        opacity: 0.05,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 18,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 8,
        zIndex: 20,
    },
    indicator: {
        height: 6,
        borderRadius: 3,
    },
    indicatorActive: {
        width: 24,
        backgroundColor: '#007AFF',
    },
    indicatorInactive: {
        width: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    ctaSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        backgroundColor: 'rgba(28, 28, 30, 0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        zIndex: 30,
    },
    startButton: {
        height: 56,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    startButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '500',
    },
    loginLink: {
        fontSize: 13,
        color: '#007AFF',
        fontWeight: '600',
    },
});
