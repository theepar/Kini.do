import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useCalendarSync } from '@/context/CalendarSyncContext';
import { Language, languageNames, supportedLanguages, useLanguage } from '@/context/LanguageContext';
import { StartWeekDay, getStartWeekDayName, usePreferences } from '@/context/PreferencesContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { language, setLanguage, t, languageName, isTranslating } = useLanguage();

  const { signOut, user } = useAuth();
  const { autoSyncEnabled, setAutoSyncEnabled, lastSyncTime, isSyncing, syncNow } = useCalendarSync();
  const {
    startWeekOn, setStartWeekOn,
    notificationsEnabled, setNotificationsEnabled,
    deadlineReminders, setDeadlineReminders,
    dailyDigest, setDailyDigest,
    dailyDigestTime, setDailyDigestTime,
    themeMode, setThemeMode
  } = usePreferences();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showWeekStartModal, setShowWeekStartModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDigestTimePicker, setShowDigestPicker] = useState(false);


  const formatLastSync = () => {
    if (!lastSyncTime) return 'Belum pernah sync';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return lastSyncTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectLanguage = async (lang: Language) => {
    if (lang === language) {
      setShowLanguageModal(false);
      return;
    }
    await setLanguage(lang);
    setShowLanguageModal(false);
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );

  const renderMenuItem = ({
    icon,
    iconColor,
    iconBg,
    title,
    subtitle,
    value,
    hasArrow = true,
    isToggle = false,
    toggleValue = false,
    onToggle = () => { },
    onPress = () => { },
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle?: string;
    value?: string;
    hasArrow?: boolean;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: (val: boolean) => void;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.cardBackground }]}
      onPress={isToggle ? () => onToggle(!toggleValue) : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.menuItemRight}>
        {value && <Text style={[styles.valueText, { color: colors.textSecondary }]}>{value}</Text>}
        {isToggle ? (
          <Switch
            trackColor={{ false: isDark ? '#283339' : '#cbd5e1', true: colors.primary }}
            thumbColor={'#FFFFFF'}
            ios_backgroundColor={isDark ? '#283339' : '#cbd5e1'}
            onValueChange={onToggle}
            value={toggleValue}
          />
        ) : (
          hasArrow && <MaterialIcons name="arrow-forward-ios" size={16} color={isDark ? '#4B5563' : '#CBD5E1'} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>{t('settings')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.user_metadata?.display_name || user?.email || 'User') + "&background=007AFF&color=fff" }}
                style={styles.avatar}
              />
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.cardBackground }]}>
                <MaterialIcons name="check" size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'User'}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
              <TouchableOpacity
                style={styles.syncStatus}
                onPress={syncNow}
                disabled={isSyncing || !autoSyncEnabled}
              >
                <MaterialIcons
                  name={isSyncing ? 'sync' : 'sync'}
                  size={14}
                  color={autoSyncEnabled ? colors.primary : colors.textSecondary}
                  style={isSyncing ? { transform: [{ rotate: '45deg' }] } : undefined}
                />
                <Text style={[styles.syncText, { color: colors.textSecondary }]}>
                  {autoSyncEnabled ? (isSyncing ? 'Menyinkronkan...' : `Sinkron: ${formatLastSync()}`) : 'Sync nonaktif'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader(t('accountSync'))}
          <View style={[styles.menuGroup, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {renderMenuItem({
              icon: 'account-circle',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('googleAccount'),
              subtitle: `${t('connectedAs')} Deva`,
              value: t('manage'),
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'cloud-sync',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('autoSync'),
              subtitle: autoSyncEnabled ? `Terakhir sync: ${formatLastSync()}` : 'Sync tidak aktif',
              isToggle: true,
              toggleValue: autoSyncEnabled,
              onToggle: setAutoSyncEnabled
            })}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader(t('notifications'))}
          <View style={[styles.menuGroup, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {renderMenuItem({
              icon: 'notifications',
              iconColor: '#FFF',
              iconBg: '#EF4444',
              title: t('allowNotifications'),
              isToggle: true,
              toggleValue: notificationsEnabled,
              onToggle: setNotificationsEnabled
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'timer',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('deadlines'),
              isToggle: true,
              toggleValue: deadlineReminders,
              onToggle: setDeadlineReminders
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'forward-to-inbox',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('dailyDigest'),
              subtitle: dailyDigest ? `Setiap pagi jam ${dailyDigestTime}` : undefined,
              isToggle: true,
              toggleValue: dailyDigest,
              onToggle: (enabled) => {
                if (enabled) {
                  setShowDigestPicker(true);
                } else {
                  setDailyDigest(false);
                }
              },
              onPress: () => setShowDigestPicker(true)
            })}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader(t('general'))}
          <View style={[styles.menuGroup, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>

            {renderMenuItem({
              icon: 'brightness-6',
              iconColor: '#FFF',
              iconBg: '#334155',
              title: 'Appearance',
              value: themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light',
              onPress: () => setShowThemeModal(true),
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'language',
              iconColor: '#FFF',
              iconBg: '#3B82F6',
              title: t('language'),
              value: languageName,
              onPress: () => setShowLanguageModal(true),
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'calendar-today',
              iconColor: '#FFF',
              iconBg: '#22C55E',
              title: t('startWeekOn'),
              value: getStartWeekDayName(startWeekOn, t),
              onPress: () => setShowWeekStartModal(true),
            })}
          </View>
        </View>

        <View style={styles.section}>
          {renderSectionHeader(t('support'))}
          <View style={[styles.menuGroup, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {renderMenuItem({
              icon: 'help',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('helpFaq'),
            })}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            {renderMenuItem({
              icon: 'security',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: t('privacyPolicy'),
            })}
          </View>
        </View>



        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={() => {
              Alert.alert(
                t('logout'),
                'Apakah Anda yakin ingin keluar?',
                [
                  { text: t('cancel'), style: 'cancel' },
                  {
                    text: t('logout'),
                    style: 'destructive',
                    onPress: async () => {
                      await signOut();
                      router.replace('/login');
                    }
                  },
                ]
              );
            }}
          >
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>

          <View style={styles.versionInfo}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>{t('version')} 1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isTranslating && setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !isTranslating && setShowLanguageModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectLanguage')}</Text>
              {!isTranslating && (
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {isTranslating ? (
              <View style={styles.translatingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={[styles.translatingText, { color: colors.text, marginTop: 12 }]}>{t('translating')}</Text>
                <Text style={[styles.translatingSubText, { color: colors.textSecondary }]}>Please wait...</Text>
              </View>
            ) : (
              <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
                {supportedLanguages.map((lang, index) => {
                  const langInfo = languageNames[lang];
                  return (
                    <React.Fragment key={lang}>
                      <TouchableOpacity
                        style={[
                          styles.languageOption,
                          language === lang && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }
                        ]}
                        onPress={() => handleSelectLanguage(lang)}
                      >
                        <View style={styles.languageInfo}>
                          <View style={[styles.languageIcon, { backgroundColor: language === lang ? colors.primary : (isDark ? colors.surface : colors.surfaceSecondary) }]}>
                            <MaterialIcons name="language" size={20} color={language === lang ? '#FFF' : colors.textSecondary} />
                          </View>
                          <View>
                            <Text style={[styles.languageLabel, { color: colors.text }]}>{langInfo.nativeName}</Text>
                            <Text style={[styles.languageSub, { color: colors.textSecondary }]}>{langInfo.englishName}</Text>
                          </View>
                        </View>
                        {language === lang && (
                          <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                        )}
                      </TouchableOpacity>
                      {index < supportedLanguages.length - 1 && (
                        <View style={[styles.modalSeparator, { backgroundColor: colors.border }]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showWeekStartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWeekStartModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWeekStartModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('startWeekOn')}</Text>
              <TouchableOpacity onPress={() => setShowWeekStartModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {(['sunday', 'monday', 'saturday'] as StartWeekDay[]).map((day, index) => (
              <React.Fragment key={day}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    startWeekOn === day && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }
                  ]}
                  onPress={() => {
                    setStartWeekOn(day);
                    setShowWeekStartModal(false);
                  }}
                >
                  <View style={styles.languageInfo}>
                    <View style={[styles.languageIcon, { backgroundColor: startWeekOn === day ? '#22C55E' : (isDark ? colors.surface : colors.surfaceSecondary) }]}>
                      <MaterialIcons name="calendar-today" size={20} color={startWeekOn === day ? '#FFF' : colors.textSecondary} />
                    </View>
                    <Text style={[styles.languageLabel, { color: colors.text }]}>{t(day as any)}</Text>
                  </View>
                  {startWeekOn === day && (
                    <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                  )}
                </TouchableOpacity>
                {index < 2 && (
                  <View style={[styles.modalSeparator, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {(['system', 'light', 'dark'] as const).map((mode, index) => (
              <React.Fragment key={mode}>
                <TouchableOpacity
                  style={[
                    styles.languageOption,
                    themeMode === mode && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }
                  ]}
                  onPress={() => {
                    setThemeMode(mode);
                    setShowThemeModal(false);
                  }}
                >
                  <View style={styles.languageInfo}>
                    <View style={[styles.languageIcon, { backgroundColor: themeMode === mode ? '#3B82F6' : (isDark ? '#2C2C2E' : '#E5E7EB') }]}>
                      <MaterialIcons
                        name={mode === 'system' ? 'settings' : mode === 'dark' ? 'dark-mode' : 'light-mode'}
                        size={20}
                        color={themeMode === mode ? '#FFF' : '#6B7280'}
                      />
                    </View>
                    <Text style={[styles.languageLabel, { color: colors.text }]}>
                      {mode === 'system' ? 'System Default' : mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                  </View>
                  {themeMode === mode && (
                    <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                  )}
                </TouchableOpacity>
                {index < 2 && (
                  <View style={[styles.modalSeparator, { backgroundColor: colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    fontFamily: 'Inter',
  },
  content: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
    fontFamily: 'Inter',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginTop: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(19, 164, 236, 0.2)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: 'Inter',
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 11,
    fontFamily: 'Inter',
  },
  menuGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'Inter',
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 13,
    fontFamily: 'Inter',
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  languageIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  languageSub: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  modalSeparator: {
    height: 1,
    marginVertical: 4,
  },
  translatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  translatingText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  translatingSubText: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  languageList: {
    maxHeight: 400,
  },
});
