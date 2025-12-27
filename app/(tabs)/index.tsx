import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { Colors, hexToRgba } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useAuth } from '@/context/AuthContext';
import { useCalendarSync } from '@/context/CalendarSyncContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTasks } from '@/context/TaskContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('today');
  const { tasks, getCategoryDisplay } = useTasks();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { autoSyncEnabled, lastSyncTime, isSyncing } = useCalendarSync();

  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    return lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.isCompleted);
  const otherTasks = tasks.filter(t => t.priority !== 'high' && !t.isCompleted);

  const tabs = [
    { key: 'today', label: t('today') },
    { key: 'upcoming', label: t('upcoming') },
    { key: 'completed', label: t('completedFilter') },
  ];


  const renderTag = (text?: string, color?: string) => {
    if (!text || !color) return null;

    const bg = color === 'purple' ? hexToRgba(Colors.light.tint, 0.15)
      : hexToRgba('#F59E0B', 0.15);

    const colorMap: Record<string, { bg: string, text: string }> = {
      purple: { bg: hexToRgba('#A855F7', isDark ? 0.2 : 0.15), text: isDark ? '#D8B4FE' : '#7E22CE' },
      blue: { bg: hexToRgba('#3B82F6', isDark ? 0.2 : 0.15), text: isDark ? '#93C5FD' : '#1D4ED8' },
      green: { bg: hexToRgba('#22C55E', isDark ? 0.2 : 0.15), text: isDark ? '#4ADE80' : '#15803D' },
      yellow: { bg: hexToRgba('#EAB308', isDark ? 0.2 : 0.15), text: isDark ? '#FACC15' : '#CA8A04' },
    };

    const style = colorMap[color] || colorMap.yellow;

    return (
      <View style={[styles.tag, { backgroundColor: style.bg }]}>
        <Text style={[styles.tagText, { color: style.text }]}>{text}</Text>
      </View>
    );
  };

  const renderCategory = (categoryId?: string) => {
    const category = getCategoryDisplay(categoryId);
    if (!category) return null;

    const bg = hexToRgba(category.color, isDark ? 0.2 : 0.15);

    return (
      <View style={[styles.tag, { backgroundColor: bg }]}>
        <Text style={[styles.tagText, { color: category.color }]}>{category.name}</Text>
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top App Bar */}
      <View style={[styles.header, {
        paddingTop: insets.top + 10,
        backgroundColor: colors.background,
        borderBottomColor: colors.borderLight
      }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>{t('taskList')}</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Kini.do</Text>
              <View style={styles.dot} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Image
              source={{ uri: user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.user_metadata?.display_name || user?.email || 'User') + "&background=007AFF&color=fff" }}
              style={styles.avatarProfile}
            />
          </TouchableOpacity>
        </View>

        {/* Sync Status Bar */}
        <View style={styles.syncContainer}>
          <View
            style={[styles.syncBadge, { backgroundColor: hexToRgba(Colors.light.success, isDark ? 0.1 : 0.05) }]}
          >
            <MaterialIcons name="sync" size={12} color={isDark ? Colors.dark.success : Colors.light.success} />
            <Text style={[styles.syncText, { color: isDark ? Colors.dark.success : Colors.light.success }]}>
              Google Sync Aktif • {formatLastSync()}
            </Text>
          </View>
        </View>

        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              // Use Colors constants for consistent theming
              const activeBg = colors.tabActive;
              const inactiveBg = colors.cardBackground;
              const activeTextColor = isDark ? colors.background : colors.cardBackground;
              const inactiveTextColor = colors.textSecondary;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive ? activeBg : inactiveBg,
                      borderColor: colors.border,
                      borderWidth: (isActive && !isDark) ? 0 : 1,
                    },
                    isActive && {
                      shadowColor: colors.text,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 2
                    }
                  ]}
                >
                  <Text style={[
                    styles.tabText,
                    { color: isActive ? activeTextColor : inactiveTextColor }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* High Priority Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('highPriority')}</Text>
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: colors.cardBackground }]}>
            <MaterialIcons name="more-horiz" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardList}>
          {highPriorityTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { borderColor: colors.textSecondary },
                ]}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.category ? renderCategory(task.category) : renderTag(task.tag, task.tagColor)}
                </View>
                <Text
                  style={[
                    styles.cardDesc,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {task.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.timeBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(239, 68, 68, 0.1)'
                          : '#FEF2F2',
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={isDark ? '#F87171' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.timeText,
                        { color: isDark ? '#F87171' : '#EF4444' },
                      ]}
                    >
                      {task.time}
                    </Text>
                  </View>

                  {task.avatars && (
                    <View style={styles.avatars}>
                      {task.avatars.map((url, i) => (
                        <Image
                          key={i}
                          source={{ uri: url }}
                          style={[
                            styles.avatar,
                            {
                              marginLeft: i > 0 ? -8 : 0,
                              borderColor: colors.cardBackground,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nanti Section */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('later')}</Text>
        </View>

        <View style={styles.cardList}>
          {otherTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
              style={[
                styles.smallCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { borderColor: colors.textSecondary },
                ]}
              />
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: colors.text, fontSize: 16 },
                  ]}
                >
                  {task.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.metaText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {task.time}
                  </Text>
                  {(task.category || task.tag) && (
                    <>
                      <View
                        style={[
                          styles.metaDot,
                          { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' },
                        ]}
                      />
                      {task.category ? (
                        (() => {
                          const cat = getCategoryDisplay(task.category);
                          if (!cat) return null;
                          const hexToRgba = (hex: string, alpha: number) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                          };
                          return (
                            <View style={[styles.miniTag, { backgroundColor: hexToRgba(cat.color, isDark ? 0.1 : 0.15) }]}>
                              <Text style={[styles.miniTagText, { color: cat.color }]}>{cat.name}</Text>
                            </View>
                          );
                        })()
                      ) : (
                        <View
                          style={[
                            styles.miniTag,
                            {
                              backgroundColor:
                                task.tagColor === 'green'
                                  ? isDark
                                    ? 'rgba(34, 197, 94, 0.1)'
                                    : '#DCFCE7'
                                  : isDark
                                    ? 'rgba(234, 179, 8, 0.1)'
                                    : '#FEF9C3',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniTagText,
                              {
                                color:
                                  task.tagColor === 'green'
                                    ? isDark
                                      ? '#4ADE80'
                                      : '#16A34A'
                                    : isDark
                                      ? '#FACC15'
                                      : '#CA8A04',
                              },
                            ]}
                          >
                            {task.tag}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
                {/* Avatars for Other Tasks */}
                {((task.sharedWith && task.sharedWith.length > 0)) && (
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    {(task.sharedWith).slice(0, 3).map((email, i) => (
                      <Image
                        key={i}
                        source={{ uri: `https://ui-avatars.com/api/?name=${email}&background=random&color=fff` }}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          marginLeft: i > 0 ? -6 : 0,
                          borderWidth: 1.5,
                          borderColor: colors.cardBackground,
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>

              {
                task.flagged && (
                  <TouchableOpacity style={styles.flagBtn}>
                    <MaterialIcons
                      name="flag"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )
              }
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push('/modal')}
      >
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#13a4ec',
    letterSpacing: -0.5,
    fontFamily: 'Inter',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    marginTop: 18,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  avatarProfile: {
    width: '100%',
    height: '100%',
  },
  syncContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabsContent: {
    gap: 12,
    paddingRight: 24,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: 'Inter',
  },
  titleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    backgroundColor: '#22C55E',
    borderRadius: 7,
    borderWidth: 2,
  },
  headerMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  tabsScroll: {
    paddingLeft: 24,
  },
  tabsContainer: {
    paddingRight: 24,
    gap: 12,
  },
  tab: {
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
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'Inter',
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardList: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  smallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Inter',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  cardDesc: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  avatars: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Inter',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniTagText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  flagBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 95,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
