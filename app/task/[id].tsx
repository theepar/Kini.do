import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { ActionBar } from '@/components/ActionBar';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TaskContext';
import { Profile, userService } from '@/services/userService';

export default function TaskDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const { tasks, toggleTask, getCategoryById, deleteTask } = useTasks();
    const { t } = useLanguage();
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [collaborators, setCollaborators] = useState<Profile[]>([]);

    const getCategoryDisplay = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = getCategoryById(categoryId);
        if (!category) return null;
        const displayName = category.isDefault ? t(category.name as any) : category.name;
        return { name: displayName, color: category.color };
    };

    const task = tasks.find(t => t.id === id);

    React.useEffect(() => {
        const loadCollaborators = async () => {
            if (!task) return;
            const emails = [...(task.sharedWith || []), ...(task.sharedWithViewers || [])];
            const uniqueEmails = Array.from(new Set(emails));

            if (uniqueEmails.length > 0) {
                const profiles = await userService.getProfilesByEmails(uniqueEmails);
                setCollaborators(profiles);
            } else {
                setCollaborators([]);
            }
        };
        loadCollaborators();
    }, [task?.sharedWith, task?.sharedWithViewers]);

    if (!task) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>{t('taskNotFound')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>{t('back')}</Text>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
                <TouchableOpacity
                    style={styles.headerBtn}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('taskDetail')}</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => setShowMenu(true)}>
                    <MaterialIcons name="more-horiz" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.titleRow}>
                        <TouchableOpacity
                            style={[styles.checkbox, { borderColor: colors.textSecondary, backgroundColor: task.isCompleted ? colors.primary : 'transparent', borderWidth: task.isCompleted ? 0 : 2.5, alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => toggleTask(task.id)}
                        >
                            {task.isCompleted && <MaterialIcons name="check" size={16} color="#FFF" />}
                        </TouchableOpacity>
                        <View style={styles.titleContent}>
                            <Text style={[styles.taskTitle, { color: colors.text, textDecorationLine: task.isCompleted ? 'line-through' : 'none' }]}>
                                {task.title}
                            </Text>
                            {(task.category || task.tag) && (() => {
                                const category = task.category ? getCategoryDisplay(task.category) : null;
                                if (category) {
                                    const hexToRgba = (hex: string, alpha: number) => {
                                        const r = parseInt(hex.slice(1, 3), 16);
                                        const g = parseInt(hex.slice(3, 5), 16);
                                        const b = parseInt(hex.slice(5, 7), 16);
                                        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                                    };
                                    return (
                                        <View style={[styles.projectBadge, { backgroundColor: hexToRgba(category.color, isDark ? 0.2 : 0.15) }]}>
                                            <Text style={[styles.projectText, { color: category.color }]}>{category.name}</Text>
                                        </View>
                                    );
                                } else if (task.tag) {
                                    return (
                                        <View style={[styles.projectBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                            <Text style={[styles.projectText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{task.tag}</Text>
                                        </View>
                                    );
                                }
                                return null;
                            })()}
                        </View>
                        <TouchableOpacity>
                            <MaterialIcons name={task.priority === 'high' ? "star" : "star-border"} size={28} color="#FACC15" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Metadata List */}
                <View style={[styles.menuGroup, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    {/* Due Date */}
                    <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}>
                                <MaterialIcons name="calendar-today" size={20} color={colors.danger} />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('dueDate')}</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <Text style={[styles.menuValue, { color: colors.danger }]}>{task.date || t('today')}, {task.time || '17:00'}</Text>
                        </View>
                    </View>

                    {/* Reminder */}
                    <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}>
                                <MaterialIcons name="notifications" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('reminder')}</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>1 {t('hourBefore')}</Text>
                        </View>
                    </View>

                    {/* Priority */}
                    <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
                                <MaterialIcons name="flag" size={20} color={colors.warning} />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>{t('priority')}</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <View style={[styles.priorityBadge, { backgroundColor: isDark ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5' }]}>
                                <Text style={[styles.priorityText, { color: colors.warning }]}>{task.priority === 'high' ? t('high') : task.priority === 'medium' ? t('medium') : t('low')}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="description" size={20} color={colors.textSecondary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('description')}</Text>
                    </View>
                    <View style={styles.descContent}>
                        <Text style={[styles.descText, { color: colors.textSecondary }]}>
                            {task.description || t('noDescription')}
                        </Text>
                    </View>
                </View>

                {/* Shared With - Mock for now unless task has avatars */}
                {/* Shared With */}
                {collaborators.length > 0 && (
                    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <View style={[styles.sectionHeader, { justifyContent: 'space-between', marginBottom: 16 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MaterialIcons name="group" size={20} color={colors.textSecondary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('sharedWith')}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.manageBtn, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}
                                onPress={() => router.push({ pathname: '/task/share', params: { id: task.id } })}
                            >
                                <Text style={styles.manageText}>{t('manage')}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarsRow}>
                            <View style={styles.avatarGroup}>
                                {collaborators.map((profile, i) => (
                                    <View key={profile.id || i} style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0, borderColor: colors.cardBackground, backgroundColor: colors.skeleton, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }]}>
                                        {profile.avatar_url ? (
                                            <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>
                                                {(profile.full_name || profile.email).substring(0, 2).toUpperCase()}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity
                                style={[styles.addAvatarBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.cardBackground }]}
                                onPress={() => router.push({ pathname: '/task/share', params: { id: task.id } })}
                            >
                                <MaterialIcons name="add" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {collaborators.map(p => (
                                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceSecondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 }}>
                                    <Text style={{ fontSize: 12, color: colors.text }}>{p.full_name || p.email}</Text>
                                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                                        {task.sharedWith?.includes(p.email) ? '(Edit)' : '(View)'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Last Edited Info */}
                {task.updatedAt && (
                    <View style={{ alignItems: 'center', marginTop: 8, opacity: 0.7, paddingBottom: 16 }}>
                        <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#6B7280' }}>
                            Diedit: {new Date(task.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {task.updatedBy && (
                            <Text style={{ fontSize: 13, color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 2 }}>
                                Oleh: {task.updatedBy}
                            </Text>
                        )}
                    </View>
                )}

                {/* Bottom Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Action Bar */}
            <ActionBar>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isDark ? '#374151' : '#FFFFFF', borderColor: isDark ? '#4B5563' : '#F3F4F6' }]}
                        onPress={() => router.push({ pathname: '/task/share', params: { id: task.id } })}
                    >
                        <MaterialIcons name="share" size={22} color="#007AFF" />
                        <Text style={[styles.actionBtnText, { color: isDark ? '#FFF' : '#111827' }]}>{t('shareTask')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#007AFF', flex: 1 }]}
                        onPress={() => router.push({ pathname: '/modal', params: { id } })}
                    >
                        <MaterialIcons name="edit" size={22} color="#FFFFFF" />
                        <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>{t('editTaskBtn')}</Text>
                    </TouchableOpacity>
                </View>
            </ActionBar>

            {/* Dropdown Menu */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setShowMenu(false)}
                >
                    <View style={[styles.dropdownMenu, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', top: insets.top + 50, right: 16 }]}>
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setShowMenu(false);
                                router.push({ pathname: '/modal', params: { id } });
                            }}
                        >
                            <MaterialIcons name="edit" size={20} color="#007AFF" />
                            <Text style={[styles.dropdownText, { color: isDark ? '#FFF' : '#000' }]}>{t('edit')}</Text>
                        </TouchableOpacity>
                        <View style={[styles.dropdownDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                        <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                                setShowMenu(false);
                                setShowDeleteModal(true);
                            }}
                        >
                            <MaterialIcons name="delete" size={20} color="#EF4444" />
                            <Text style={[styles.dropdownText, { color: '#EF4444' }]}>{t('delete')}</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.confirmModal, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
                        <View style={styles.confirmIconContainer}>
                            <View style={styles.confirmIcon}>
                                <MaterialIcons name="delete-outline" size={32} color="#EF4444" />
                            </View>
                        </View>
                        <Text style={[styles.confirmTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('deleteTask')}</Text>
                        <Text style={[styles.confirmMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                            Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.
                        </Text>
                        <View style={styles.confirmButtons}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.cancelBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={[styles.confirmBtnText, { color: isDark ? '#FFF' : '#000' }]}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.deleteBtn]}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    deleteTask(task.id);
                                    router.back();
                                }}
                            >
                                <Text style={[styles.confirmBtnText, { color: '#FFF' }]}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownMenu: {
        position: 'absolute',
        minWidth: 160,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dropdownDivider: {
        height: 1,
        marginHorizontal: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    confirmModal: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
    },
    confirmIconContainer: {
        marginBottom: 16,
    },
    confirmIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    confirmMessage: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    confirmButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {},
    deleteBtn: {
        backgroundColor: '#EF4444',
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
