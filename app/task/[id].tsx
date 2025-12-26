import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTasks } from '@/context/TaskContext';

export default function TaskDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const { tasks, toggleTask } = useTasks();

    // Find Task
    const task = tasks.find(t => t.id === id);

    if (!task) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} darkColor="#000000">
                <Text style={{ color: isDark ? '#FFF' : '#000' }}>Tugas tidak ditemukan</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#007AFF' }}>Kembali</Text>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container} darkColor="#000000">
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back-ios-new" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Detail Tugas</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="more-horiz" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title Card */}
                <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={styles.titleRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, { borderColor: isDark ? '#4B5563' : '#D1D5DB', backgroundColor: task.isCompleted ? '#007AFF' : 'transparent', borderWidth: task.isCompleted ? 0 : 2.5, alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => toggleTask(task.id)}
                        >
                            {task.isCompleted && <MaterialIcons name="check" size={16} color="#FFF" />}
                        </TouchableOpacity>
                        <View style={styles.titleContent}>
                            <Text style={[styles.taskTitle, { color: isDark ? '#FFF' : '#111827', textDecorationLine: task.isCompleted ? 'line-through' : 'none' }]}>
                                {task.title}
                            </Text>
                            {task.tag && (
                                <View style={[styles.projectBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                    <Text style={[styles.projectText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.tag}</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity>
                            <MaterialIcons name={task.priority === 'high' ? "star" : "star-border"} size={28} color="#FACC15" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Metadata List */}
                <View style={[styles.menuGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    {/* Due Date */}
                    <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}>
                                <MaterialIcons name="calendar-today" size={20} color={isDark ? '#F87171' : '#DC2626'} />
                            </View>
                            <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#111827' }]}>Jatuh Tempo</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <Text style={[styles.menuValue, { color: isDark ? '#F87171' : '#EF4444' }]}>{task.date || 'Hari ini'}, {task.time || '17:00'}</Text>
                            <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
                        </View>
                    </View>

                    {/* Reminder */}
                    <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                                <MaterialIcons name="notifications" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
                            </View>
                            <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#111827' }]}>Pengingat</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <Text style={[styles.menuValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>1 jam sebelumnya</Text>
                            <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
                        </View>
                    </View>

                    {/* Priority */}
                    <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
                                <MaterialIcons name="flag" size={20} color={isDark ? '#FB923C' : '#EA580C'} />
                            </View>
                            <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#111827' }]}>Prioritas</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <View style={[styles.priorityBadge, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5' }]}>
                                <Text style={[styles.priorityText, { color: isDark ? '#FDBA74' : '#C2410C' }]}>{task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="description" size={20} color="#9CA3AF" />
                        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Deskripsi</Text>
                    </View>
                    <View style={styles.descContent}>
                        <Text style={[styles.descText, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>
                            {task.description || 'Tidak ada deskripsi.'}
                        </Text>
                    </View>
                </View>

                {/* Shared With - Mock for now unless task has avatars */}
                {task.avatars && (
                    <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={[styles.sectionHeader, { justifyContent: 'space-between', marginBottom: 16 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MaterialIcons name="group" size={20} color="#9CA3AF" />
                                <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#111827' }]}>Dibagikan dengan</Text>
                            </View>
                            <TouchableOpacity style={[styles.manageBtn, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                                <Text style={styles.manageText}>Kelola</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarsRow}>
                            <View style={styles.avatarGroup}>
                                {task.avatars.map((uri, i) => (
                                    <Image
                                        key={i}
                                        source={{ uri }}
                                        style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0, borderColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                                    />
                                ))}
                            </View>
                            <TouchableOpacity style={[styles.addAvatarBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6', borderColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                                <MaterialIcons name="add" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Bottom Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: isDark ? '#4B5563' : '#F3F4F6' }]}
                        onPress={() => router.push('/task/share')}
                    >
                        <MaterialIcons name="share" size={22} color="#007AFF" />
                        <Text style={[styles.actionBtnText, { color: isDark ? '#FFF' : '#111827' }]}>Bagikan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#007AFF', flex: 1 }]}
                        onPress={() => router.push({ pathname: '/modal', params: { id } })}
                    >
                        <MaterialIcons name="edit" size={22} color="#FFFFFF" />
                        <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Edit Tugas</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        gap: 24,
    },
    card: {
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2.5,
        marginTop: 4,
    },
    titleContent: {
        flex: 1,
        gap: 8,
    },
    taskTitle: {
        fontSize: 22,
        fontWeight: '700',
        lineHeight: 28,
    },
    projectBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    projectText: {
        fontSize: 12,
        fontWeight: '600',
    },
    menuGroup: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // Overridden in render
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    menuValue: {
        fontSize: 15,
        fontWeight: '500',
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '600',
    },
    googleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    descContent: {
        marginTop: 8,
    },
    descText: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 16,
    },
    bulletList: {
        borderLeftWidth: 3,
        paddingLeft: 16,
        gap: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#007AFF',
        opacity: 0.6,
    },
    bulletText: {
        fontSize: 14,
    },
    manageBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
    },
    manageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#007AFF',
    },
    avatarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarGroup: {
        flexDirection: 'row',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
    },
    addAvatarBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flex: 1,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
