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
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '@/context/LanguageContext';
import { getWeekStartIndex, usePreferences } from '@/context/PreferencesContext';
import { useTasks } from '@/context/TaskContext';

export default function CalendarScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const { tasks, toggleTask } = useTasks();
    const { t, language } = useLanguage();
    const { startWeekOn } = usePreferences();
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const weekStartIndex = getWeekStartIndex(startWeekOn);

    const handleCompleteTask = (taskId: string) => {
        setCompletingTaskId(taskId);
        setTimeout(() => {
            toggleTask(taskId);
            setCompletingTaskId(null);
        }, 300);
    };

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const adjustedFirstDay = (firstDayOfMonth - weekStartIndex + 7) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const getWeekDays = () => {
        const result: Date[] = [];
        const currentDay = selectedDate.getDay();
        const diff = (currentDay - weekStartIndex + 7) % 7;
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - diff);

        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            result.push(day);
        }
        return result;
    };

    const weekDays = getWeekDays();

    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const activeTasks = tasks.filter(t => t.date === selectedDateString && !t.isCompleted);

    const monthNamesId = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const monthNamesEn = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthNames = language === 'id' ? monthNamesId : monthNamesEn;

    const baseDayNamesId = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const baseDayNamesEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const baseDayNames = language === 'id' ? baseDayNamesId : baseDayNamesEn;

    const dayNames = [
        ...baseDayNames.slice(weekStartIndex),
        ...baseDayNames.slice(0, weekStartIndex)
    ];

    const changeMonth = (increment: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setSelectedDate(newDate);
    };

    const changeWeek = (increment: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (increment * 7));
        setSelectedDate(newDate);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.pageTitle, { color: colors.text }]}>{t('calendar')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.segmentContainer}>
                    <View style={[styles.segment, { backgroundColor: isDark ? colors.cardBackground : '#E5E7EB' }]}>
                        <TouchableOpacity
                            style={[styles.segmentBtn, viewMode === 'month' && { backgroundColor: isDark ? '#2C3A42' : '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                            onPress={() => setViewMode('month')}
                        >
                            <Text style={[styles.segmentText, { color: viewMode === 'month' ? colors.tint : colors.textSecondary }]}>{t('month')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.segmentBtn, viewMode === 'week' && { backgroundColor: isDark ? '#2C3A42' : '#FFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                            onPress={() => setViewMode('week')}
                        >
                            <Text style={[styles.segmentText, { color: viewMode === 'week' ? colors.tint : colors.textSecondary }]}>{t('week')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.calendarSection, { borderBottomColor: colors.border }]}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity
                            onPress={() => viewMode === 'week' ? changeWeek(-1) : changeMonth(-1)}
                            style={styles.arrowBtn}
                        >
                            <MaterialIcons name="chevron-left" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[styles.monthTitle, { color: colors.text }]}>{monthNames[month]} {year}</Text>
                        <TouchableOpacity
                            onPress={() => viewMode === 'week' ? changeWeek(1) : changeMonth(1)}
                            style={styles.arrowBtn}
                        >
                            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.daysHeader}>
                        {dayNames.map((day) => (
                            <Text key={day} style={styles.dayLabel}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {(viewMode === 'week' ? weekDays : days).map((day, i) => {
                            if (!day) return <View key={i} style={styles.dayCell} />;

                            const dayStr = day.toISOString().split('T')[0];
                            const isSelected = dayStr === selectedDateString;
                            const hasTasks = tasks.some(t => t.date === dayStr && !t.isCompleted);

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.dayCell,
                                        isSelected && styles.selectedDay,
                                        isSelected && { backgroundColor: colors.tint }
                                    ]}
                                    onPress={() => setSelectedDate(day)}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        { color: isSelected ? '#FFF' : colors.textSecondary }
                                    ]}>
                                        {day.getDate()}
                                    </Text>
                                    {!isSelected && hasTasks && (
                                        <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={[styles.dragHandle, { backgroundColor: isDark ? colors.cardBackground : '#E5E7EB' }]} />
                </View>

                {/* Task List */}
                <View style={styles.taskList}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {selectedDate.getDate()} {monthNames[month]}
                        </Text>
                    </View>

                    {activeTasks.length === 0 ? (
                        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>{t('noTasksForDate')}</Text>
                    ) : (
                        activeTasks.map((task) => {
                            const isCompleting = completingTaskId === task.id;
                            return (
                                <View
                                    key={task.id}
                                    style={[
                                        styles.taskCardNew,
                                        {
                                            backgroundColor: isDark ? colors.cardBackground : '#FFF',
                                            borderLeftColor: task.tagColor ?? '#3B82F6',
                                            opacity: isCompleting ? 0.5 : 1,
                                        }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.checkboxNew,
                                            {
                                                borderColor: isCompleting ? '#007AFF' : (isDark ? '#6B7280' : '#D1D5DB'),
                                                backgroundColor: isCompleting ? '#007AFF' : 'transparent',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }
                                        ]}
                                        onPress={() => handleCompleteTask(task.id)}
                                        disabled={isCompleting}
                                    >
                                        {isCompleting && <MaterialIcons name="check" size={16} color="#FFF" />}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.taskContentNew}
                                        onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
                                    >
                                        <Text style={[
                                            styles.taskTitleNew,
                                            {
                                                color: colors.text,
                                                textDecorationLine: isCompleting ? 'line-through' : 'none',
                                            }
                                        ]}>{task.title}</Text>
                                        <View style={styles.metaRowNew}>
                                            {task.tag && (
                                                <View style={[styles.tagNew, { backgroundColor: colors.surfaceSecondary, marginRight: 8 }]}>
                                                    <Text style={[styles.tagTextNew, { color: colors.text }]}>{task.tag}</Text>
                                                </View>
                                            )}
                                            <Text style={[styles.metaTextNew, { color: colors.textSecondary }]}>{task.time || t('allDay')}</Text>
                                        </View>
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
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    profileImg: {
        width: '100%',
        height: '100%',
    },
    actionBtns: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
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
    segmentContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    segment: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 8,
        height: 40,
    },
    segmentBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    segmentText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
    calendarSection: {
        paddingHorizontal: 12,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    arrowBtn: {
        padding: 8,
    },
    daysHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        fontFamily: 'Inter',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderRadius: 999,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    selectedDay: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 5,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    dragHandle: {
        width: 48,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
    },
    taskList: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        fontFamily: 'Inter',
    },
    todayTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 16,
    },
    taskContent: {
        flex: 1,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    priorityTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    priorityTagText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Inter',
    },
    taskTime: {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: 'Inter',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        fontFamily: 'Inter',
    },
    taskSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        fontFamily: 'Inter',
    },
    taskIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        fontFamily: 'Inter',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24, // above bottom tabs
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 100,
    },
    taskCardNew: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderLeftWidth: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    checkboxNew: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        marginRight: 16,
    },
    taskContentNew: {
        flex: 1,
    },
    taskTitleNew: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
        fontFamily: 'Inter',
    },
    metaRowNew: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaTextNew: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'Inter',
    },
    dotSeparator: {
        marginHorizontal: 6,
        color: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Inter',
    },
    tagNew: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagTextNew: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'Inter',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarNew: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
    },
    addCollabBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#60A5FA', // blue-400
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#60A5FA',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
    },
});
