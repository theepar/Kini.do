import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
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
import { useColorScheme } from '@/hooks/useColorScheme';

import { useLanguage } from '@/context/LanguageContext';
import { Category, useTasks } from '@/context/TaskContext';

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const { t } = useLanguage();
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [reminder, setReminder] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('personal');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const { tasks, addTask, updateTask, deleteTask, categories, addCategory } = useTasks();

  // Color options for new categories
  const colorOptions = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899', '#14B8A6', '#6366F1', '#EF4444', '#6B7280'];

  // Edit mode: check if we have an id param
  const isEditMode = !!id;
  const existingTask = isEditMode ? tasks.find(task => task.id === id) : null;

  // Load task data when in edit mode
  useEffect(() => {
    if (isEditMode && existingTask) {
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setPriority(existingTask.priority || 'medium');
      setSelectedCategory(existingTask.category || 'personal');
      if (existingTask.date) {
        const taskDate = new Date(existingTask.date);
        if (existingTask.time) {
          const [hours, minutes] = existingTask.time.split(':').map(Number);
          taskDate.setHours(hours, minutes, 0, 0);
          setTimeEnabled(true);
        }
        setDate(taskDate);
      }
    }
  }, [isEditMode, existingTask]);

  // Date change handler
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Time change handler
  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDate(newDate);
    }
  };

  // Delete task handler
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
              router.back();
            }
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return t('today');
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return 'Besok';
    } else {
      return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    }
  };

  // Format time for display
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const selectedCat = categories.find(c => c.id === selectedCategory);

    if (isEditMode && existingTask) {
      // Update existing task
      updateTask(existingTask.id, {
        title,
        description,
        priority,
        category: selectedCategory,
        tag: selectedCat?.isDefault ? t(selectedCat.name as any) : selectedCat?.name,
        tagColor: selectedCat?.color,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      // Add new task
      addTask({
        id: Date.now().toString(),
        title,
        description,
        priority,
        category: selectedCategory,
        tag: selectedCat?.isDefault ? t(selectedCat.name as any) : selectedCat?.name,
        tagColor: selectedCat?.color,
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCompleted: false,
      });
    }
    router.back();
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: `custom_${Date.now()}`,
      name: newCategoryName.trim(),
      color: newCategoryColor,
      isDefault: false,
    };

    addCategory(newCategory);
    setSelectedCategory(newCategory.id);
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
    setShowAddCategoryModal(false);
    setShowCategoryModal(false);
  };

  // Helper to get category display name
  const getCategoryDisplayName = (cat: Category) => {
    return cat.isDefault ? t(cat.name as any) : cat.name;
  };

  const selectedCat = categories.find(c => c.id === selectedCategory);

  return (
    <ThemedView style={styles.container} darkColor="#000000">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>
          {isEditMode ? t('editTask') : t('newTask')}
        </Text>
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
              placeholder={t('title')}
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              value={title}
              onChangeText={setTitle}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
          <View style={styles.inputRowNoBorder}>
            <TextInput
              style={[styles.inputDesc, { color: isDark ? '#FFF' : '#000' }]}
              placeholder={t('notes')}
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
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                <MaterialIcons name="calendar-today" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('date')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{formatDate(date)}</Text>
              <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </View>
          </TouchableOpacity>

          {/* Time */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}
            onPress={() => timeEnabled && setShowTimePicker(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                <MaterialIcons name="schedule" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('time')}</Text>
              {timeEnabled && (
                <Text style={[styles.timeValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{formatTime(date)}</Text>
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

          {/* Reminder */}
          <TouchableOpacity style={styles.menuItemNoBorder}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#6366F1' }]}>
                <MaterialIcons name="notifications" size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('remindMe')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: '#8E8E93' }]}>{t('none')}</Text>
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
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('priority')}</Text>
            </View>
            <View style={[styles.prioritySelector, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
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
                    style={[styles.priorityText, { color: isDark ? '#FFF' : '#000', opacity: priority === p ? 1 : 0.5 }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {p === 'low' ? t('low') : p === 'medium' ? t('medium') : t('high')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}
            onPress={() => setShowCategoryModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: selectedCat?.color || '#3B82F6' }]}>
                <MaterialIcons name={(selectedCat?.icon as any) || 'folder'} size={18} color="#FFF" />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('category')}</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={[styles.menuValue, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {selectedCat ? getCategoryDisplayName(selectedCat) : t('categoryPersonal')}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={isDark ? '#4B5563' : '#D1D5DB'} />
            </View>
          </TouchableOpacity>

          {/* List / Google Tasks */}
          <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF', borderWidth: 1, borderColor: isDark ? 'transparent' : '#E5E7EB' }]}>
                {/* Google Icon Original */}
                <Image
                  source={{ uri: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png' }}
                  style={{ width: 18, height: 18 }}
                />
              </View>
              <Text style={[styles.menuLabel, { color: isDark ? '#FFF' : '#000' }]}>{t('googleTasks')}</Text>
            </View>
            <View style={[styles.switchTrackActive, { backgroundColor: '#34C759' }]}>
              <View style={[styles.switchThumb, { transform: [{ translateX: 20 }] }]} />
            </View>
          </View>
        </View>

        {/* Delete Button - Only show in edit mode */}
        {isEditMode && (
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteText}>{t('deleteTask')}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footerText}>Kini.do — {t('lastEdited')} 24 Okt 2023, 10:45</Text>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          is24Hour={true}
        />
      )}

      {/* Category Selection Modal */}
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
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('selectCategory')}</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
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
                      <Text style={[styles.categoryLabel, { color: isDark ? '#FFF' : '#000' }]}>
                        {getCategoryDisplayName(cat)}
                      </Text>
                    </View>
                    {selectedCategory === cat.id && (
                      <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                  {index < categories.length - 1 && (
                    <View style={[styles.categoryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]} />
                  )}
                </React.Fragment>
              ))}

              {/* Add Custom Category Button */}
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

      {/* Add New Category Modal */}
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
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('newCategory')}</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.categoryInput, {
                backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                color: isDark ? '#FFF' : '#000'
              }]}
              placeholder={t('enterCategoryName')}
              placeholderTextColor={isDark ? '#8E8E93' : '#9CA3AF'}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <Text style={[styles.colorLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>Color</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color) => (
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
  timeValue: {
    fontSize: 14,
    marginLeft: 8,
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
    minHeight: 32,
  },
  priorityOption: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    minWidth: 40,
  },
  priorityText: {
    fontSize: 12,
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
  },
  categoryInput: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
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
  },
});
