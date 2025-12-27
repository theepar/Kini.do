import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/useColorScheme';

type Mode = 'date' | 'time' | 'datetime';

interface CustomDateTimePickerProps {
    visible: boolean;
    onClose: () => void;
    onChange: (date: Date) => void;
    value: Date;
    mode?: Mode;
    minimumDate?: Date;
}

export default function CustomDateTimePicker({
    visible,
    onClose,
    onChange,
    value,
    mode = 'date',
    minimumDate,
}: CustomDateTimePickerProps) {
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme];
    const { t, language } = useLanguage();

    const [internalDate, setInternalDate] = useState(value || new Date());
    const [viewMode, setViewMode] = useState<'date' | 'time'>(mode === 'time' ? 'time' : 'date');

    // Reset state when modal opens
    React.useEffect(() => {
        if (visible) {
            setInternalDate(new Date(value.getTime()));
            setViewMode(mode === 'time' ? 'time' : 'date');
        }
    }, [visible, value, mode]);

    const handleConfirm = () => {
        onChange(internalDate);
        onClose();
    };

    const renderHeader = () => {
        return (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                    <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {viewMode === 'date' ? t('date') : t('time')}
                </Text>
                <TouchableOpacity onPress={handleConfirm} style={styles.headerBtn}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('save' as any)}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // --- CALENDAR LOGIC ---
    const [displayMonth, setDisplayMonth] = useState(new Date(internalDate));

    React.useEffect(() => {
        setDisplayMonth(new Date(internalDate));
    }, [visible]); // Reset display month when opened

    const monthNamesId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNames = language === 'id' ? monthNamesId : monthNamesEn;

    const changeMonth = (increment: number) => {
        const newDate = new Date(displayMonth);
        newDate.setMonth(newDate.getMonth() + increment);
        setDisplayMonth(newDate);
    };

    const calendarGrid = useMemo(() => {
        const year = displayMonth.getFullYear();
        const month = displayMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun

        // Adjust for Monday start if needed (assuming user pref logic is external, stuck with Sun=0 for standard UI now)
        // Let's stick to standard Sun-Sat for simplicity or match app logic.
        // App uses `weekStartIndex`. For simplicity here, let's use Sun start.

        const offset = firstDayOfMonth;
        const totalSlots = daysInMonth + offset;
        const rows = Math.ceil(totalSlots / 7);

        const grid = [];
        let dayCounter = 1;

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < 7; j++) {
                const index = i * 7 + j;
                if (index < offset || dayCounter > daysInMonth) {
                    row.push(null);
                } else {
                    row.push(new Date(year, month, dayCounter));
                    dayCounter++;
                }
            }
            grid.push(row);
        }
        return grid;
    }, [displayMonth]);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const renderCalendar = () => {
        const weekDays = language === 'id'
            ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <View style={styles.calendarContainer}>
                {/* Month Nav */}
                <View style={styles.monthNav}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                        <MaterialIcons name="chevron-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>
                        {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Days Header */}
                <View style={styles.weekHeader}>
                    {weekDays.map(day => (
                        <Text key={day} style={[styles.weekDayText, { color: colors.textSecondary }]}>{day}</Text>
                    ))}
                </View>

                {/* Grid */}
                <View>
                    {calendarGrid.map((row, rIdx) => (
                        <View key={rIdx} style={styles.weekRow}>
                            {row.map((day, cIdx) => {
                                if (!day) return <View key={cIdx} style={styles.dayCell} />;
                                const selected = isSameDay(day, internalDate);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <TouchableOpacity
                                        key={cIdx}
                                        style={[
                                            styles.dayCell,
                                            selected && { backgroundColor: colors.primary, borderRadius: 50 },
                                            !selected && isToday && { borderWidth: 1, borderColor: colors.primary, borderRadius: 50 }
                                        ]}
                                        onPress={() => {
                                            const newDate = new Date(day);
                                            newDate.setHours(internalDate.getHours(), internalDate.getMinutes());
                                            setInternalDate(newDate);
                                            if (mode === 'datetime') {
                                                // Optional: switch to time view automatically?
                                                // setViewMode('time');
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            { color: selected ? '#FFF' : colors.text },
                                            !selected && isToday && { color: colors.primary, fontWeight: 'bold' }
                                        ]}>
                                            {day.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    // --- TIME LOGIC ---
    const renderTimePicker = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10...

        const currentHour = internalDate.getHours();
        const currentMinute = internalDate.getMinutes();

        // Round minute to nearest 5 for easier UI, or allow precise?
        // Let's stick to precise display but 5-min steps for quick selection, 
        // or just list all 60? 60 is too many for grid.
        // Let's do columns.

        return (
            <View style={styles.timeContainer}>
                <View style={styles.timeDisplay}>
                    <Text style={[styles.timeDisplayText, { color: colors.text }]}>
                        {internalDate.getHours().toString().padStart(2, '0')}
                        :
                        {internalDate.getMinutes().toString().padStart(2, '0')}
                    </Text>
                </View>

                <View style={styles.columnsContainer}>
                    {/* Hours */}
                    <View style={styles.column}>
                        <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>{t('hour' as any) || 'Hour'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {hours.map(h => (
                                <TouchableOpacity
                                    key={h}
                                    style={[
                                        styles.timeCell,
                                        h === currentHour && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => {
                                        const newDate = new Date(internalDate);
                                        newDate.setHours(h);
                                        setInternalDate(newDate);
                                    }}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        { color: h === currentHour ? '#FFF' : colors.text }
                                    ]}>
                                        {h.toString().padStart(2, '0')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Minutes */}
                    <View style={styles.column}>
                        <Text style={[styles.columnLabel, { color: colors.textSecondary }]}>{t('minute' as any) || 'Minute'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {Array.from({ length: 60 }, (_, i) => i).map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[
                                        styles.timeCell,
                                        m === currentMinute && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => {
                                        const newDate = new Date(internalDate);
                                        newDate.setMinutes(m);
                                        setInternalDate(newDate);
                                    }}
                                >
                                    <Text style={[
                                        styles.timeText,
                                        { color: m === currentMinute ? '#FFF' : colors.text }
                                    ]}>
                                        {m.toString().padStart(2, '0')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={[
                        styles.contentContainer,
                        { backgroundColor: isDark ? colors.cardBackground : '#FFF' }
                    ]}
                    onStartShouldSetResponder={() => true} // Catch touch
                >
                    {renderHeader()}

                    {/* Tabs for Datetime mode */}
                    {mode === 'datetime' && (
                        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.tab, viewMode === 'date' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                                onPress={() => setViewMode('date')}
                            >
                                <Text style={[styles.tabText, { color: viewMode === 'date' ? colors.primary : colors.textSecondary }]}>{t('date')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, viewMode === 'time' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                                onPress={() => setViewMode('time')}
                            >
                                <Text style={[styles.tabText, { color: viewMode === 'time' ? colors.primary : colors.textSecondary }]}>{t('time')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {viewMode === 'date' ? renderCalendar() : renderTimePicker()}
                    </ScrollView>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    contentContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    calendarContainer: {
        padding: 16,
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navBtn: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    weekHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    timeContainer: {
        padding: 20,
        height: 300,
    },
    timeDisplay: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timeDisplayText: {
        fontSize: 32,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    columnsContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 20,
    },
    column: {
        flex: 1,
    },
    columnLabel: {
        textAlign: 'center',
        marginBottom: 8,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    timeCell: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
