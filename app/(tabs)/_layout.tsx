import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

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
          borderTopRightRadius: 24,
          borderTopLeftRadius: 24,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
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
          title: 'Tugas',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="check-circle-outline" size={26} color={color} />
          ),
        }}
      />

      {/* 2. Calendar / Kalender */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="calendar-today" size={24} color={color} />
          ),
        }}
      />

      {/* 3. Search / Cari */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cari',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="search" size={28} color={color} />
          ),
        }}
      />

      {/* 4. Settings / Pengaturan */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Pengaturan',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="settings" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
