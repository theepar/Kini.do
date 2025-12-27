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
import { Colors } from '@/constants/Colors'; // Fix: Import Colors
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
  const { tasks, getCategoryById } = useTasks();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { autoSyncEnabled, lastSyncTime, isSyncing } = useCalendarSync();

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    return lastSyncTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Get category display name
  const getCategoryDisplay = (categoryId?: string) => {
    if (!categoryId) return null;
    const category = getCategoryById(categoryId);
    if (!category) return null;
    // Default categories use translation keys
    const displayName = category.isDefault ? t(category.name as any) : category.name;
    return { name: displayName, color: category.color };
  };

  // Filter tasks
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.isCompleted);
  const otherTasks = tasks.filter(t => t.priority !== 'high' && !t.isCompleted);

  const tabs = [
    { key: 'today', label: t('today') },
    { key: 'upcoming', label: t('upcoming') },
    { key: 'completed', label: t('completedFilter') },
  ];


  const renderTag = (text?: string, color?: string) => {
    if (!text || !color) return null;
    let bg, textCol;
    if (color === 'purple') {
      bg = isDark ? 'rgba(168, 85, 247, 0.2)' : '#F3E8FF';
      textCol = isDark ? '#D8B4FE' : '#7E22CE';
    } else if (color === 'blue') {
      bg = isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE';
      textCol = isDark ? '#93C5FD' : '#1D4ED8';
    } else if (color === 'green') {
      bg = isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7';
      textCol = isDark ? '#4ADE80' : '#15803D';
    } else {
      bg = isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3';
      textCol = isDark ? '#FACC15' : '#CA8A04';
    }

    return (
      <View style={[styles.tag, { backgroundColor: bg }]}>
        <Text style={[styles.tagText, { color: textCol }]}>{text}</Text>
      </View>
    );
  };

  // Render category badge with hex color
  const renderCategory = (categoryId?: string) => {
    const category = getCategoryDisplay(categoryId);
    if (!category) return null;

    // Convert hex to rgba for background
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const bg = hexToRgba(category.color, isDark ? 0.2 : 0.15);

    return (
      <View style={[styles.tag, { backgroundColor: bg }]}>
        <Text style={[styles.tagText, { color: category.color }]}>{category.name}</Text>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container} darkColor={isDark ? '#000000' : colors.background}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.95)'
              : 'rgba(242, 242, 247, 0.95)',
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerLabel, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
              {t('taskList')}
            </Text>
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>
                Kini.do
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{
                uri: user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.display_name || user?.email || 'User')}&background=007AFF&color=fff`,
              }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerMetadata}>
          {autoSyncEnabled ? (
            <View style={[styles.syncBadge, { backgroundColor: isDark ? '#1C1C1E' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <MaterialIcons name={isSyncing ? "sync" : "cloud-done"} size={16} color="#22C55E" />
              <Text style={[styles.syncText, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>{t('googleSyncActive')}</Text>
            </View>
          ) : (
            <View style={[styles.syncBadge, { backgroundColor: isDark ? '#1C1C1E' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <MaterialIcons name="cloud-off" size={16} color="#9CA3AF" />
              <Text style={[styles.syncText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Sync Off</Text>
            </View>
          )}
          {autoSyncEnabled && lastSyncTime && (
            <Text style={[styles.lastUpdated, { color: isDark ? '#9CA3AF' : '#9CA3AF' }]}>{t('lastUpdated')}: {formatLastSync()}</Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            // Light mode: Active is Black bg, White text.
            // Dark mode: Active is White bg, Black text.
            const activeBg = isDark ? '#FFFFFF' : '#000000';
            const activeText = isDark ? '#000000' : '#FFFFFF';
            const inactiveBg = isDark ? '#1C1C1E' : '#FFFFFF';
            const inactiveText = isDark ? '#D1D5DB' : '#4B5563';

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? activeBg : inactiveBg,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? activeText : inactiveText }
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.key === 'today' && isActive && (
                  <View style={[styles.tabBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.tabBadgeText, { color: isActive ? activeText : inactiveText }]}>4</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* High Priority Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('highPriority')}</Text>
          <TouchableOpacity style={[styles.moreBtn, { backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }]}>
            <MaterialIcons name="more-horiz" size={20} color="#9CA3AF" />
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
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { borderColor: isDark ? '#6B7280' : '#D1D5DB' },
                ]}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isDark ? '#FFF' : '#000' },
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
                    { color: isDark ? '#9CA3AF' : '#6B7280' },
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
                              borderColor: isDark ? '#1C1C1E' : '#FFFFFF',
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
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('later')}</Text>
        </View>

        <View style={styles.cardList}>
          {otherTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              activeOpacity={0.9}
              style={[
                styles.smallCard,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  { borderColor: isDark ? '#6B7280' : '#D1D5DB' },
                ]}
              />
              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? '#FFF' : '#000', fontSize: 16 },
                  ]}
                >
                  {task.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.metaText,
                      { color: isDark ? '#9CA3AF' : '#6B7280' },
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
              </View>
              {task.flagged && (
                <TouchableOpacity style={styles.flagBtn}>
                  <MaterialIcons
                    name="flag"
                    size={20}
                    color={isDark ? '#4B5563' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: isDark ? '#007AFF' : '#000000' }]}
        activeOpacity={0.8}
        onPress={() => router.push('/modal')}
      >
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
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
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
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
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '500',
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
  },
  cardDesc: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
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
