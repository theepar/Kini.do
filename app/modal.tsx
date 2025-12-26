import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { useColorScheme } from '@/hooks/useColorScheme';

import { useTasks } from '@/context/TaskContext';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [reminder, setReminder] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());

  const { addTask } = useTasks();

  const handleSave = () => {
    if (!title.trim()) return;

    addTask({
      id: Date.now().toString(),
      title,
      description,
      priority,
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tag: 'Pribadi', // Default tag
      tagColor: 'blue',
      isCompleted: false,
    });
    router.back();
  };

  return (
    <ThemedView style={styles.container} darkColor="#000000">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Tugas Baru</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <MaterialIcons name="check" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title & Desc Input */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={[styles.inputRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <TextInput
              style={[styles.inputTitle, { color: isDark ? '#FFF' : '#000' }]}
              placeholder="Judul"
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={styles.inputRowNoBorder}>
            <TextInput
              style={[styles.inputDesc, { color: isDark ? '#FFF' : '#000' }]}
              placeholder="Catatan..."
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Date & Time Options */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          {/* Date */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                <MaterialIcons name="calendar-today" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>Tanggal</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Hari Ini</Text>
              <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </View>
          </TouchableOpacity>

          {/* Time */}
          <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                <MaterialIcons name="schedule" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>Waktu</Text>
            </View>
            <View style={styles.switchContainer}>
              {/* Native switch would go here, simulated for now */}
              <View style={[styles.switchTrack, { backgroundColor: isDark ? '#3A3A3C' : '#E5E7EB' }]}>
                <View style={styles.switchThumb} />
              </View>
            </View>
          </View>

          {/* Reminder */}
          <TouchableOpacity style={styles.menuItemNoBorder}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#6366F1' }]}>
                <MaterialIcons name="notifications" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>Ingatkan Saya</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: '#8E8E93' }]}>Tidak ada</Text>
              <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Priority & List */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          {/* Priority */}
          <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F97316' }]}>
                <MaterialIcons name="priority-high" size={20} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>Prioritas</Text>
            </View>
            <View style={[styles.prioritySelector, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityOption,
                    priority === p && { backgroundColor: isDark ? '#636366' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }
                  ]}
                >
                  <Text style={[styles.priorityText, { color: isDark ? '#FFF' : '#000', opacity: priority === p ? 1 : 0.5 }]}>
                    {p === 'low' ? 'Low' : p === 'medium' ? 'Med' : 'High'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* List / Google Tasks */}
          <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF', borderWidth: 1, borderColor: isDark ? 'transparent' : '#E5E7EB' }]}>
                {/* Google Icon SVG sim */}
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#4285F4' }}>G</Text>
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>Google Tasks</Text>
            </View>
            <View style={[styles.switchTrackActive, { backgroundColor: '#34C759' }]}>
              <View style={[styles.switchThumb, { transform: [{ translateX: 20 }] }]} />
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={styles.deleteText}>Hapus Tugas</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>Kini.do — Terakhir diedit 24 Okt 2023, 10:45</Text>
      </ScrollView>
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
    paddingTop: 16,
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
    padding: 16,
    gap: 24,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputRow: {
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  inputRowNoBorder: {
    paddingLeft: 20,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
    paddingRight: 16,
  },
  inputDesc: {
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  menuItemNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 16,
  },
  switchContainer: {

  },
  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  switchTrackActive: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  prioritySelector: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
    height: 32,
  },
  priorityOption: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  deleteBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  deleteText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FF3B30',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 24,
  }
});
