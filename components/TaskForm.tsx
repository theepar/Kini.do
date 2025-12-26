import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Task } from '@/types';

interface TaskFormProps {
    initialTask?: Partial<Task>;
    onSubmit: (task: Partial<Task>) => void;
    onCancel: () => void;
}

export function TaskForm({ initialTask, onSubmit, onCancel }: TaskFormProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [title, setTitle] = useState(initialTask?.title || '');
    const [description, setDescription] = useState(initialTask?.description || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(
        initialTask?.priority || 'medium'
    );
    const [dueDate, setDueDate] = useState<Date | undefined>(
        initialTask?.dueDate ? new Date(initialTask.dueDate) : undefined
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            dueDate,
            reminderTime: dueDate,
        });
    };

    const priorityOptions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const priorityLabels = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' };
    const priorityColors = {
        low: colors.priorityLow,
        medium: colors.priorityMedium,
        high: colors.priorityHigh,
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={[styles.form, { borderColor: colors.border }]}>
                <View style={styles.field}>
                    <ThemedText style={styles.label}>Judul Task</ThemedText>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Masukkan judul task..."
                        placeholderTextColor={colors.textSecondary}
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }
                        ]}
                    />
                </View>

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Deskripsi (opsional)</ThemedText>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tambahkan deskripsi..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }
                        ]}
                    />
                </View>

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Prioritas</ThemedText>
                    <View style={styles.priorityRow}>
                        {priorityOptions.map((p) => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setPriority(p)}
                                style={[
                                    styles.priorityBtn,
                                    {
                                        borderColor: priorityColors[p],
                                        backgroundColor: priority === p ? priorityColors[p] + '20' : 'transparent',
                                    }
                                ]}
                            >
                                <View style={[styles.priorityDot, { backgroundColor: priorityColors[p] }]} />
                                <ThemedText style={[styles.priorityText, priority === p && { color: priorityColors[p] }]}>
                                    {priorityLabels[p]}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.field}>
                    <ThemedText style={styles.label}>Tanggal & Waktu</ThemedText>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.dateBtn, { borderColor: colors.border }]}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.tint} />
                        <ThemedText style={{ flex: 1, marginLeft: 8 }}>
                            {dueDate
                                ? dueDate.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : 'Pilih tanggal & waktu'
                            }
                        </ThemedText>
                        {dueDate && (
                            <TouchableOpacity onPress={() => setDueDate(undefined)}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) {
                                setDueDate(date);
                                setShowTimePicker(true);
                            }
                        }}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowTimePicker(false);
                            if (date) setDueDate(date);
                        }}
                    />
                )}

                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={onCancel}
                        style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                    >
                        <ThemedText>Batal</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.btn, styles.submitBtn, { backgroundColor: colors.tint }]}
                    >
                        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
                            {initialTask?.id ? 'Update' : 'Simpan'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 20,
        margin: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 10,
    },
    priorityBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 6,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 13,
        fontWeight: '500',
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    btn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelBtn: {
        borderWidth: 1,
    },
    submitBtn: {},
});
