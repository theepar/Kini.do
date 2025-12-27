import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ActionBar } from '@/components/ActionBar';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TaskContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Profile, userService } from '@/services/userService';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShareScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    // const colors = Colors[colorScheme]; // Colors might be undefined if not typed correctly, assume Colors.light/dark exist
    const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { t } = useLanguage();
    const { tasks, getCategoryById, updateTask } = useTasks();

    // Find task from id
    const task = tasks.find(t => t.id === id);
    const { user } = useAuth();
    const isOwner = !task?.ownerId || task.ownerId === user?.id;

    // Get category display
    const getCategoryDisplay = (categoryId?: string) => {
        if (!categoryId) return null;
        const category = getCategoryById(categoryId);
        if (!category) return null;
        const displayName = category.isDefault ? t(category.name as any) : category.name;
        return { name: displayName, color: category.color };
    };

    const category = task?.category ? getCategoryDisplay(task.category) : null;
    const taskTitle = task?.title || t('task');
    const taskTag = category?.name || task?.tag || t('task');

    // Frequent Collaborators Logic
    const [suggestedContacts, setSuggestedContacts] = useState<Profile[]>([]);

    useEffect(() => {
        const loadSuggestions = async () => {
            const emailCounts = new Map<string, number>();
            tasks.forEach(t => {
                if (t.sharedWith) {
                    t.sharedWith.forEach(e => {
                        if (e.includes('@')) emailCounts.set(e, (emailCounts.get(e) || 0) + 1);
                    });
                }
            });

            if (emailCounts.size === 0) {
                setSuggestedContacts([]);
                return;
            }

            const sorted = Array.from(emailCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(x => x[0]);

            if (sorted.length > 0) {
                const profiles = await userService.getProfilesByEmails(sorted);
                setSuggestedContacts(profiles);
            }
        };
        loadSuggestions();
    }, [tasks]);

    // Roles State (Editors & Viewers)
    const [editors, setEditors] = useState<string[]>(task?.sharedWith || []);
    const [viewers, setViewers] = useState<string[]>(task?.sharedWithViewers || []);
    const [currentAccessProfiles, setCurrentAccessProfiles] = useState<Profile[]>([]);

    // Load profiles for all selected emails
    useEffect(() => {
        const all = [...editors, ...viewers];
        const loadAccessProfiles = async () => {
            if (all.length > 0) {
                const profiles = await userService.getProfilesByEmails(all);
                setCurrentAccessProfiles(profiles);
            } else {
                setCurrentAccessProfiles([]);
            }
        };
        loadAccessProfiles();
    }, [editors.length, viewers.length]);


    // Role Selection State
    const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setSearching(true);
                try {
                    const results = await userService.searchUsers(searchQuery);
                    setSearchResults(results.filter(r => r.email !== user?.email));
                } finally {
                    setSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const toggleSelection = (email: string) => {
        const isEditor = editors.includes(email);
        const isViewer = viewers.includes(email);

        if (isEditor) {
            if (selectedRole === 'editor') {
                // Same role: Toggle Off
                setEditors(prev => prev.filter(e => e !== email));
            } else {
                // Different role: Switch to Viewer
                setEditors(prev => prev.filter(e => e !== email));
                setViewers(prev => [...prev, email]);
            }
        } else if (isViewer) {
            if (selectedRole === 'viewer') {
                // Same role: Toggle Off
                setViewers(prev => prev.filter(e => e !== email));
            } else {
                // Different role: Switch to Editor
                setViewers(prev => prev.filter(e => e !== email));
                setEditors(prev => [...prev, email]);
            }
        } else {
            // Not selected: Add based on selectedRole
            if (selectedRole === 'editor') {
                setEditors(prev => [...prev, email]);
            } else {
                setViewers(prev => [...prev, email]);
            }
        }
    };

    const changeRole = (email: string) => {
        if (editors.includes(email)) {
            // Change to Viewer
            setEditors(prev => prev.filter(e => e !== email));
            setViewers(prev => [...prev, email]);
        } else if (viewers.includes(email)) {
            // Change to Editor
            setViewers(prev => prev.filter(e => e !== email));
            setEditors(prev => [...prev, email]);
        }
    };

    const handleShare = () => {
        if (!task) return;
        updateTask(task.id, { sharedWith: editors, sharedWithViewers: viewers });
        router.back();
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 10,
                borderBottomColor: colors.borderLight,
                backgroundColor: colors.background
            }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('shareTask')}</Text>
                <TouchableOpacity style={styles.headerBtn}>
                    <MaterialIcons name="send" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Shared Item */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('sharedItem')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.sharedItemHeader, { borderBottomColor: colors.border }]}>
                            <View style={[styles.sharedIcon, { backgroundColor: category?.color || colors.primary }]}>
                                <MaterialIcons name="assignment" size={26} color="#FFF" />
                            </View>
                            <View style={styles.sharedInfo}>
                                <Text style={[styles.sharedTitle, { color: colors.text }]} numberOfLines={2}>{taskTitle}</Text>
                                <Text style={[styles.sharedSubtitle, { color: colors.textSecondary }]}>{taskTag}</Text>
                            </View>
                            <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? colors.surface : colors.surfaceSecondary }]}>
                                <Text style={[styles.editBtnText, { color: colors.text }]}>{t('change')}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 14,
                                paddingHorizontal: 14,
                                borderTopWidth: 1,
                                borderTopColor: colors.border
                            }}
                            onPress={() => isOwner && setSelectedRole(prev => prev === 'editor' ? 'viewer' : 'editor')}
                            disabled={!isOwner}
                        >
                            <View style={styles.accessLeft}>
                                <View style={[styles.accessIcon, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
                                    <MaterialIcons name="lock-open" size={18} color={isDark ? '#FB923C' : '#C2410C'} />
                                </View>
                                <Text style={[styles.accessLabel, { color: colors.text }]}>{t('userAccess')}</Text>
                            </View>
                            <View style={styles.accessRight}>
                                <Text style={[styles.accessValue, { color: colors.textSecondary }]}>
                                    {selectedRole === 'editor' ? (t('canEdit') || 'Can Edit') : 'Can View'}
                                </Text>
                                {isOwner && <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Search */}{isOwner && (
                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: isDark ? '#2C2C2E' : 'rgba(118, 118, 128, 0.12)', color: isDark ? '#FFF' : '#000' }]}
                            placeholder="Nama, email, atau kontak"
                            placeholderTextColor="#8E8E93"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searching && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
                    </View>)}

                {/* Search Results */}
                {searchQuery.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>HASIL PENCARIAN</Text>
                        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                            {searchResults.map((user, i) => {
                                const isSelected = editors.includes(user.email) || viewers.includes(user.email);
                                return (
                                    <TouchableOpacity key={user.id} onPress={() => toggleSelection(user.email)} style={[styles.contactItem, { backgroundColor: isSelected ? 'rgba(0,122,255,0.05)' : 'transparent', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                                        {user.avatar_url ? (
                                            <Image source={{ uri: user.avatar_url }} style={styles.contactImage} />
                                        ) : (
                                            <View style={[styles.contactAvatar, { backgroundColor: '#6366F1' }]}>
                                                <Text style={styles.initials}>{user.full_name ? user.full_name.charAt(0) : user.email.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        )}

                                        <View style={styles.contactInfo}>
                                            <View style={styles.contactRow}>
                                                <View>
                                                    <Text style={[styles.contactName, { color: isDark ? '#FFF' : '#000' }]}>{user.full_name || 'User'}</Text>
                                                    <Text style={styles.contactEmail}>{user.email}</Text>
                                                </View>
                                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}>
                                                    {isSelected && <MaterialIcons name="check" size={14} color="#FFF" />}
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            {searchResults.length === 0 && !searching && (
                                <Text style={{ padding: 16, color: colors.textSecondary, textAlign: 'center' }}>Tidak ditemukan user.</Text>
                            )}
                        </View>
                    </View>
                )}

                {/* People with Access (Existing) */}
                {(editors.length > 0 || viewers.length > 0) && searchQuery.length === 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>AKSES SAAT INI ({editors.length + viewers.length})</Text>
                        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                            {[...editors, ...viewers].map((email, i, arr) => {
                                const profile = currentAccessProfiles.find(p => p.email === email);
                                const name = profile?.full_name || email;
                                const avatar = profile?.avatar_url;
                                const isEditor = editors.includes(email);

                                return (
                                    <View key={email} style={[styles.contactItem, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', justifyContent: 'space-between' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                            {avatar ? (
                                                <Image source={{ uri: avatar }} style={styles.contactImage} />
                                            ) : (
                                                <View style={[styles.contactAvatar, { backgroundColor: '#10B981' }]}>
                                                    <Text style={styles.initials}>{name.charAt(0).toUpperCase()}</Text>
                                                </View>
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.contactName, { color: isDark ? '#FFF' : '#000' }]} numberOfLines={1}>{name}</Text>
                                                <Text style={[styles.contactEmail, { color: '#8E8E93' }]} numberOfLines={1}>{email}</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <TouchableOpacity onPress={() => isOwner && changeRole(email)} disabled={!isOwner} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: isEditor ? 'rgba(0,122,255,0.1)' : 'rgba(142, 142, 147, 0.2)', borderRadius: 6, opacity: isOwner ? 1 : 0.6 }}>
                                                <Text style={{ fontSize: 11, color: isEditor ? '#007AFF' : (isDark ? '#D1D5DB' : '#6B7280'), fontWeight: '500' }}>
                                                    {isEditor ? 'Editor' : 'Viewer'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => (isOwner || email === user?.email) && toggleSelection(email)} disabled={!isOwner && email !== user?.email}>
                                                <MaterialIcons name={email === user?.email ? "exit-to-app" : "remove-circle-outline"} size={22} color={(email === user?.email) ? "#FF9500" : "#FF3B30"} style={{ opacity: (!isOwner && email !== user?.email) ? 0.3 : 1 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Suggested based on Frequency */}
                {isOwner && suggestedContacts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>DISARANKAN (Sering Berkolaborasi)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedList}>
                            {suggestedContacts.map((user, i) => {
                                const isSelected = editors.includes(user.email) || viewers.includes(user.email);
                                return (
                                    <TouchableOpacity key={user.id} style={styles.suggestedUser} onPress={() => toggleSelection(user.email)}>
                                        <View style={[styles.avatarContainer, isSelected && { borderColor: '#007AFF', borderWidth: 2 }]}>
                                            {user.avatar_url ? (
                                                <Image source={{ uri: user.avatar_url }} style={styles.avatarLarge} />
                                            ) : (
                                                <View style={[styles.avatarLarge, { backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }]}>
                                                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '600' }}>{user.full_name ? user.full_name[0] : user.email[0].toUpperCase()}</Text>
                                                </View>
                                            )}
                                            {isSelected && (
                                                <View style={styles.checkBadge}>
                                                    <MaterialIcons name="check" size={10} color="#FFF" />
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.userName, { color: isSelected ? '#007AFF' : (isDark ? '#FFF' : '#000') }]}>{user.full_name || user.email}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <ActionBar>
                <TouchableOpacity style={styles.sendBtn} onPress={handleShare}>
                    <Text style={styles.sendBtnText}>Bagikan ke {editors.length + viewers.length} Kontak</Text>
                    <MaterialIcons name="send" size={20} color="#FFF" />
                </TouchableOpacity>
            </ActionBar>
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
        backgroundColor: 'transparent',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        paddingVertical: 24,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 12,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sharedItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
        borderBottomWidth: 1,
    },
    sharedIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sharedInfo: {
        flex: 1,
    },
    sharedTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sharedSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    editBtnText: {
        fontSize: 13,
        fontWeight: '500',
    },
    accessRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    accessLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    accessIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accessLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    accessRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    accessValue: {
        fontSize: 15,
        color: '#8E8E93',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 30,
        top: 12,
        zIndex: 1,
    },
    searchInput: {
        height: 44,
        borderRadius: 12,
        paddingLeft: 44,
        paddingRight: 16,
        fontSize: 17,
    },
    suggestedList: {
        gap: 16,
        paddingHorizontal: 4,
    },
    suggestedUser: {
        alignItems: 'center',
        width: 72,
        gap: 8,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        position: 'relative',
    },
    avatarLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    checkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#007AFF',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    initials: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    contactInfo: {
        flex: 1,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactEmail: {
        fontSize: 13,
        color: '#8E8E93',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },
    sendBtn: {
        backgroundColor: '#007AFF',
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
