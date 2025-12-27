import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TaskContext';

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const { tasks, toggleTask } = useTasks();
    const { t } = useLanguage();

    const filters = [
        { key: 'all', icon: null, color: null },
        { key: 'today', icon: 'wb-sunny', color: '#EAB308' },
        { key: 'overdue', icon: 'warning', color: '#EF4444' },
        { key: 'shared', icon: 'group', color: '#A855F7' },
        { key: 'completed', icon: 'check-circle', color: '#22C55E' },
    ];

    const filterLabels: { [key: string]: string } = {
        all: t('all'),
        today: t('today'),
        overdue: t('overdue'),
        shared: t('shared'),
        completed: t('completedFilter'),
    };

    const filteredTasks = tasks.filter(task => {
        if (!searchText) return false;
        const matchesText = task.title.toLowerCase().includes(searchText.toLowerCase());
        return matchesText;
    });

    return (
        <ThemedView style={styles.container} darkColor={colors.background}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(246, 247, 248, 0.95)', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Text style={[styles.pageTitle, { color: colors.text }]}>{t('search')}</Text>
            </View>

            <View style={[styles.searchBarContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(246, 247, 248, 0.95)' }]}>
                <View style={styles.searchBarWrapper}>
                    <MaterialIcons name="search" size={24} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: isDark ? colors.cardBackground : '#FFF', color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                        placeholder={t('searchPlaceholder')}
                        placeholderTextColor="#94a3b8"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            style={[styles.clearBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                            onPress={() => setSearchText('')}
                        >
                            <MaterialIcons name="close" size={14} color={isDark ? '#CBD5E1' : '#64748B'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                    {filters.map((filter, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: activeFilter === filter.key
                                        ? colors.tint
                                        : (isDark ? colors.cardBackground : '#FFF'),
                                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                                    borderWidth: activeFilter === filter.key ? 0 : 1
                                }
                            ]}
                            onPress={() => setActiveFilter(filter.key)}
                        >
                            {filter.icon && (
                                <MaterialIcons name={filter.icon as any} size={18} color={activeFilter === filter.key ? '#FFF' : filter.color} style={{ marginRight: 6 }} />
                            )}
                            <Text style={[
                                styles.filterText,
                                { color: activeFilter === filter.key ? '#FFF' : (isDark ? '#E2E8F0' : '#475569') }
                            ]}>
                                {filterLabels[filter.key]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Search Results */}
                {/* Only show if searching */}
                {searchText.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>{t('searchResults')}</Text>
                        <View style={styles.resultList}>
                            {filteredTasks.length === 0 ? (
                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>{t('noResults')}</Text>
                            ) : (
                                filteredTasks.map(task => (
                                    <TouchableOpacity key={task.id} style={[styles.resultCard, { backgroundColor: isDark ? colors.cardBackground : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
                                        <TouchableOpacity
                                            style={[styles.checkbox, { borderColor: isDark ? '#64748B' : '#CBD5E1', backgroundColor: task.isCompleted ? colors.tint : 'transparent', borderWidth: task.isCompleted ? 0 : 2, justifyContent: 'center', alignItems: 'center' }]}
                                        >
                                            {task.isCompleted && <MaterialIcons name="check" size={14} color="#FFF" />}
                                        </TouchableOpacity>
                                        <View style={styles.resultContent}>
                                            <View style={styles.resultHeader}>
                                                <Text style={[styles.resultTitle, { color: isDark ? '#FFF' : '#1E293B', textDecorationLine: task.isCompleted ? 'line-through' : 'none' }]}>{task.title}</Text>
                                                {task.priority === 'high' && <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />}
                                            </View>
                                            <View style={styles.resultMeta}>
                                                <View style={styles.metaItem}>
                                                    <MaterialIcons name="schedule" size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                                                    <Text style={[styles.metaText, { color: '#94a3b8' }]}>{task.time || 'No time'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                ) : (
                    // Default State (Recent & Suggested)
                    <View>
                        {/* Recent Searches (Mock UI for now) */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentSearches')}</Text>
                            </View>
                        </View>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        overflow: 'hidden',
    },
    profileImg: {
        width: '100%',
        height: '100%',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    searchBarContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        zIndex: 10,
    },
    searchBarWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    searchInput: {
        height: 56,
        borderRadius: 16,
        paddingLeft: 48,
        paddingRight: 40,
        fontSize: 16,
        borderWidth: 1,
    },
    clearBtn: {
        position: 'absolute',
        right: 16,
        padding: 2,
        borderRadius: 10,
    },
    content: {
        paddingBottom: 24,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        gap: 4,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    recentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    historyIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recentText: {
        fontSize: 16,
        fontWeight: '500',
    },
    removeRecentBtn: {
        padding: 8,
    },
    resultList: {
        gap: 12,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 16,
    },
    resultContent: {
        flex: 1,
        marginRight: 8,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    metaDivider: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    avatarMini: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22C55E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    avatarText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#FFF',
    },
});
