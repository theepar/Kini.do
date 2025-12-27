import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import { MaterialIcons } from '@expo/vector-icons';
import { uuid } from 'expo-modules-core';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCalendarSync } from '@/context/CalendarSyncContext';
import { useLanguage } from '@/context/LanguageContext';
import { Category, useTasks } from '@/context/TaskContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const COLOR_OPTIONS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#14B8A6', '#6366F1', '#EF4444', '#6B7280'];

const REMINDER_OPTIONS = [
  { label: 'none', value: null },
  { label: 'At time of event', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 }
];

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const { t } = useLanguage();
  const { syncTask } = useCalendarSync();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [selectedCategory, setSelectedCategory] = useState<string>('personal');
  const [reminderOffset, setReminderOffset] = useState<number | null>(null);
  const [syncToGoogle, setSyncToGoogle] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const { tasks, addTask, updateTask, deleteTask, categories, addCategory } = useTasks();

  const isEditMode = !!id;
  const existingTask = isEditMode ? tasks.find(task => task.id === id) : null;
  const selectedCat = categories.find(c => c.id === selectedCategory);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (isEditMode && existingTask && !initialized.current) {
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setPriority(existingTask.priority || 'medium');
      setSelectedCategory(existingTask.category || 'personal');
      setSyncToGoogle(existingTask.syncToGoogle !== false);
      setReminderOffset(existingTask.reminderOffset ?? null);

      if (existingTask.date) {
        const taskDate = new Date(existingTask.date);
        if (existingTask.time) {
          const [hours, minutes] = existingTask.time.split(':').map(Number);
          taskDate.setHours(hours, minutes, 0, 0);
          setTimeEnabled(true);
        }
        setDate(taskDate);
      }
      initialized.current = true;
    }
  }, [isEditMode, existingTask]);



  const formatDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return t('today');
    if (d.toDateString() === tomorrow.toDateString()) return 'Besok';
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (d: Date) => {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getCategoryDisplayName = (cat: Category) => {
    return cat.isDefault ? t(cat.name as any) : cat.name;
  };

  const getReminderLabel = () => {
    if (reminderOffset === null) return t('none');
    if (reminderOffset === 0) return 'At time of event';
    if (reminderOffset === 60) return '1 hour before';
    if (reminderOffset === 1440) return '1 day before';
    return `${reminderOffset} minutes before`;
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    // Use local date formatting to prevent timezone shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const timeString = timeEnabled ? formatTime(date) : undefined;
    const taskId = isEditMode && existingTask ? existingTask.id : uuid.v4();
    const taskData = {
      title,
      description,
      priority,
      category: selectedCategory,
      tag: selectedCat?.isDefault ? t(selectedCat.name as any) : selectedCat?.name,
      tagColor: selectedCat?.color,
      date: dateStr,
      time: timeString,
      syncToGoogle,
      reminderOffset,
    };

    if (isEditMode && existingTask) {
      updateTask(existingTask.id, taskData);
    } else {
      addTask({
        id: taskId,
        ...taskData,
        isCompleted: false,
      });
    }

    // Push to Google Calendar if syncToGoogle is enabled
    if (syncToGoogle) {
      try {
        const action = isEditMode && existingTask?.googleCalendarEventId ? 'update' : 'create';
        await syncTask(taskId, action, {
          ...taskData,
          googleCalendarEventId: existingTask?.googleCalendarEventId,
        });
        console.log('Task synced to Google Calendar');
      } catch (error) {
        console.error('Failed to sync to Google Calendar:', error);
      }
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      t('deleteTask'),
      'Apakah Anda yakin ingin menghapus tugas ini?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete' as any) || 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (existingTask) {
              deleteTask(existingTask.id);
              router.replace('/(tabs)');
            }
          },
        },
      ]
    );
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    addCategory({
      id: `custom_${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      isDefault: false,
    });

    setSelectedCategory(`custom_${Date.now()}`);
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    setShowAddCategoryModal(false);
    setShowCategoryModal(false);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? t('editTask') : t('newTask')}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
          <MaterialIcons name="check" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
            <TextInput
              style={[styles.inputTitle, { color: colors.text }]}
              placeholder={t('title')}
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
          <View style={styles.inputRowNoBorder}>
            <TextInput
              style={[styles.inputDesc, { color: colors.text }]}
              placeholder={t('notes')}
              placeholderTextColor={colors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => {
              console.log('Date picker button pressed, current date:', date);
              setShowDatePicker(true);
            }}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                <MaterialIcons name="calendar-today" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('date')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{formatDate(date)}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => timeEnabled && setShowTimePicker(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                <MaterialIcons name="schedule" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('time')}</Text>
              {timeEnabled && (
                <Text style={[styles.timeValue, { color: colors.textSecondary }]}>{formatTime(date)}</Text>
              )}
            </View>
            <Switch
              value={timeEnabled}
              onValueChange={(val) => {
                setTimeEnabled(val);
                if (val) setShowTimePicker(true);
              }}
              trackColor={{ false: isDark ? '#3A3A3C' : '#E5E7EB', true: '#34C759' }}
              thumbColor="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItemNoBorder}
            onPress={() => setShowReminderModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#6366F1' }]}>
                <MaterialIcons name="notifications" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('remindMe')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: '#8E8E93' }]}>{getReminderLabel()}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F97316' }]}>
                <MaterialIcons name="priority-high" size={20} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('priority')}</Text>
            </View>
            <View style={[styles.prioritySelector, { backgroundColor: colors.surfaceSecondary }]}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p as 'low' | 'medium' | 'high')}
                  style={[
                    styles.priorityOption,
                    priority === p && { backgroundColor: isDark ? '#636366' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                  ]}
                >
                  <Text
                    style={[styles.priorityText, { color: colors.text, opacity: priority === p ? 1 : 0.5 }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {p === 'low' ? t('low') : p === 'medium' ? t('medium') : t('high')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: selectedCat?.color || '#3B82F6' }]}>
                <MaterialIcons name={(selectedCat?.icon as any) || 'folder'} size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('category')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                {selectedCat ? getCategoryDisplayName(selectedCat) : t('categoryPersonal')}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.menuItemNoBorder}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF', borderWidth: 1, borderColor: isDark ? 'transparent' : '#E5E7EB' }]}>
                <Image
                  source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png' }}
                  style={{ width: 18, height: 18 }}
                />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{t('googleTasks')}</Text>
            </View>
            <Switch
              value={syncToGoogle}
              onValueChange={setSyncToGoogle}
              trackColor={{ false: isDark ? '#3A3A3C' : '#E5E7EB', true: '#34C759' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {isEditMode && (
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: colors.cardBackground }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>{t('deleteTask')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>Kini.do — {t('lastEdited')} {formatDate(date)}</Text>
      </ScrollView>

      {/* Date Picker */}
      <CustomDateTimePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onChange={(val) => setDate(val)}
        value={date instanceof Date && !isNaN(date.getTime()) ? date : new Date()}
        mode="date"
      />

      {/* Time Picker */}
      <CustomDateTimePicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onChange={(val) => {
          const newDate = new Date(date);
          newDate.setHours(val.getHours());
          newDate.setMinutes(val.getMinutes());
          setDate(newDate);
        }}
        value={date instanceof Date && !isNaN(date.getTime()) ? date : new Date()}
        mode="time"
      />

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectCategory')}</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <React.Fragment key={cat.id}>
                  <TouchableOpacity
                    style={[
                      styles.categoryOption,
                      selectedCategory === cat.id && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryModal(false);
                    }}
                  >
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]}>
                        {cat.icon && <MaterialIcons name={cat.icon as any} size={14} color="#FFF" />}
                      </View>
                      <Text style={[styles.categoryLabel, { color: colors.text }]}>
                        {getCategoryDisplayName(cat)}
                      </Text>
                    </View>
                    {selectedCategory === cat.id && (
                      <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                  {index < categories.length - 1 && (
                    <View style={[styles.categoryDivider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}

              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => {
                  setShowCategoryModal(false);
                  setShowAddCategoryModal(true);
                }}
              >
                <MaterialIcons name="add-circle-outline" size={24} color="#3B82F6" />
                <Text style={styles.addCategoryText}>{t('addCategory')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showAddCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddCategoryModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('newCategory')}</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.categoryInput, { backgroundColor: colors.surfaceSecondary, color: colors.text }]}
              placeholder={t('enterCategoryName')}
              placeholderTextColor={colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newCategoryColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setNewCategoryColor(color)}
                >
                  {newCategoryColor === color && (
                    <MaterialIcons name="check" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, { opacity: newCategoryName.trim() ? 1 : 0.5 }]}
              onPress={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.addBtnText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showReminderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReminderModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('remindMe')}</Text>
              <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {REMINDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[
                    styles.categoryOption,
                    { borderBottomColor: colors.border, borderBottomWidth: 1 }
                  ]}
                  onPress={() => {
                    setReminderOffset(opt.value);
                    setShowReminderModal(false);
                  }}
                >
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>
                    {opt.label === 'none' ? t('none') : opt.label}
                  </Text>
                  {reminderOffset === opt.value && (
                    <MaterialIcons name="check" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  inputDesc: {
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  timeValue: {
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Inter',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 16,
    fontFamily: 'Inter',
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
    gap: 2,
  },
  priorityOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    minWidth: 45,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter',
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
    fontFamily: 'Inter',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 24,
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  categoryDivider: {
    height: 1,
    marginVertical: 2,
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Inter',
  },
  categoryInput: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalContent: {
    width: '85%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});
