import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  // Specific colors from design
  const bgLight = '#f6f7f8';
  const bgDark = '#000000';
  const surfaceLight = '#ffffff';
  const surfaceDark = '#1C1C1E';
  const primary = '#13a4ec';
  const textDark = '#ffffff';
  const textLight = '#0f172a'; // slate-900
  const textGrayDark = '#9db0b9';
  const textGrayLight = '#64748b'; // slate-500

  // State for toggles
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deadlinesEnabled, setDeadlinesEnabled] = useState(true);
  const [dailyDigestEnabled, setDailyDigestEnabled] = useState(false);

  const backgroundColor = isDark ? bgDark : bgLight;
  const surfaceColor = isDark ? surfaceDark : surfaceLight;
  const textColor = isDark ? textDark : textLight;
  const subtextColor = isDark ? textGrayDark : textGrayLight;
  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: subtextColor }]}>
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
      style={[styles.menuItem, { backgroundColor: surfaceColor }]}
      onPress={isToggle ? () => onToggle(!toggleValue) : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.menuTitle, { color: textColor }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: subtextColor }]}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.menuItemRight}>
        {value && <Text style={[styles.valueText, { color: subtextColor }]}>{value}</Text>}
        {isToggle ? (
          <Switch
            trackColor={{ false: isDark ? '#283339' : '#cbd5e1', true: primary }}
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
    <ThemedView style={[styles.container, { backgroundColor }]} darkColor={bgDark} lightColor={bgLight}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top App Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(246, 247, 248, 0.95)', borderBottomColor: borderColor }]}>
        <Text style={[styles.pageTitle, { color: textColor }]}>Pengaturan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPEMCAC4u3w2aVJap5clT0f7Erv724Y_DTsTjghul7rXCcdKZoNweBW1qd_8_GmodJMQm1RwHw6DnfZPO7jj_tPzz1R8P54q79IluNRSLJXGerD_M--PxTxEoi_aqiK6ZQO2e_TSaw6THmlTll46hiK_CK3w1wvy2Dmh1HHYSjkmpXjgzFh66hKwusyJ2NXDjXVztBoDru8c9vUWdCIrceGwCIb7arpkKPtOZofii2XxqDlIy3OWy9L05nC3pnQTYPTAk3f6hyHSE" }}
                style={styles.avatar}
              />
              <View style={[styles.verifiedBadge, { backgroundColor: primary, borderColor: surfaceColor }]}>
                <MaterialIcons name="check" size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: textColor }]}>Deva Gundhala</Text>
              <Text style={[styles.profileEmail, { color: subtextColor }]}>devaunow@gmail.com</Text>
              <View style={styles.syncStatus}>
                <MaterialIcons name="sync" size={14} color={primary} />
                <Text style={[styles.syncText, { color: subtextColor }]}>Sinkron: Baru saja</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Akun & Sinkronisasi */}
        <View style={styles.section}>
          {renderSectionHeader('AKUN & SINKRONISASI')}
          <View style={[styles.menuGroup, { backgroundColor: surfaceColor, borderColor }]}>
            {renderMenuItem({
              icon: 'account-circle',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Akun Google',
              subtitle: 'Terhubung sebagai Deva',
              value: 'Kelola',
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'cloud-sync',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Sinkronisasi Otomatis',
              isToggle: true,
              toggleValue: syncEnabled,
              onToggle: setSyncEnabled
            })}
          </View>
        </View>

        {/* Notifikasi */}
        <View style={styles.section}>
          {renderSectionHeader('NOTIFIKASI')}
          <View style={[styles.menuGroup, { backgroundColor: surfaceColor, borderColor }]}>
            {renderMenuItem({
              icon: 'notifications',
              iconColor: '#FFF',
              iconBg: '#EF4444',
              title: 'Izinkan Notifikasi',
              isToggle: true,
              toggleValue: notificationsEnabled,
              onToggle: setNotificationsEnabled
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'timer',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Tenggat Waktu',
              isToggle: true,
              toggleValue: deadlinesEnabled,
              onToggle: setDeadlinesEnabled
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'forward-to-inbox', // Note: MaterialIcons might call this differently or not exist, using 'inbox' fallback or similar if needed. 'move-to-inbox' is close. Using 'forward-to-inbox' usually works in React Native Vector Icons if updated.
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Ringkasan Harian',
              isToggle: true,
              toggleValue: dailyDigestEnabled,
              onToggle: setDailyDigestEnabled
            })}
          </View>
        </View>

        {/* Umum */}
        <View style={styles.section}>
          {renderSectionHeader('UMUM')}
          <View style={[styles.menuGroup, { backgroundColor: surfaceColor, borderColor }]}>

            {renderMenuItem({
              icon: 'dark-mode',
              iconColor: '#FFF',
              iconBg: '#334155',
              title: 'Mode Gelap',
              isToggle: true,
              toggleValue: theme === 'dark',
              onToggle: () => toggleTheme(),
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'language',
              iconColor: '#FFF',
              iconBg: '#3B82F6',
              title: 'Bahasa',
              value: 'Indonesia',
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'calendar-today',
              iconColor: '#FFF',
              iconBg: '#22C55E',
              title: 'Mulai Minggu Pada',
              value: 'Senin',
            })}
          </View>
        </View>

        {/* Dukungan */}
        <View style={styles.section}>
          {renderSectionHeader('DUKUNGAN')}
          <View style={[styles.menuGroup, { backgroundColor: surfaceColor, borderColor }]}>
            {renderMenuItem({
              icon: 'help',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Bantuan & FAQ',
            })}
            <View style={[styles.separator, { backgroundColor: borderColor }]} />
            {renderMenuItem({
              icon: 'security',
              iconColor: isDark ? '#FFF' : '#334155',
              iconBg: isDark ? '#283339' : '#F1F5F9',
              title: 'Kebijakan Privasi',
            })}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>

          <View style={styles.versionInfo}>
            <Text style={[styles.versionText, { color: subtextColor }]}>Kini.do Versi 1.0.0</Text>
          </View>
        </View>

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
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 11,
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
  },
  menuSubtitle: {
    fontSize: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 13,
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
  },
  versionInfo: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
