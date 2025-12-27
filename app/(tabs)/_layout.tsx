import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: isDark ? '#999999' : '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderTopWidth: 1,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>

      {/* 1. Home / Tugas */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="check-circle-outline" size={26} color={color} />
          ),
        }}
      />

      {/* 2. Calendar / Kalender */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('calendar'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="calendar-today" size={24} color={color} />
          ),
        }}
      />

      {/* 3. Search / Cari */}
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="search" size={28} color={color} />
          ),
        }}
      />

      {/* 4. Settings / Pengaturan */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="settings" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
