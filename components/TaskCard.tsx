import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Task } from '@/types';

interface TaskCardProps {
    task: Task;
    onPress: () => void;
    onToggle: () => void;
    onDelete: () => void;
}

export function TaskCard({ task, onPress, onToggle, onDelete }: TaskCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const priorityColor = {
        low: colors.priorityLow,
        medium: colors.priorityMedium,
        high: colors.priorityHigh,
    }[task.priority];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <ThemedView style={[styles.card, { borderColor: colors.border }]}>
                <TouchableOpacity
                    onPress={onToggle}
                    style={[styles.checkbox, { borderColor: priorityColor }]}
                >
                    {task.completed && (
                        <Ionicons name="checkmark" size={16} color={priorityColor} />
                    )}
                </TouchableOpacity>

                <View style={styles.content}>
                    <ThemedText
                        style={[
                            styles.title,
                            task.completed && styles.completedText
                        ]}
                    >
                        {task.title}
                    </ThemedText>

                    {task.description && (
                        <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
                            {task.description}
                        </ThemedText>
                    )}

                    {task.dueDate && (
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                            <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
                                {format(new Date(task.dueDate), 'dd MMM yyyy, HH:mm', { locale: id })}
                            </ThemedText>
                        </View>
                    )}
                </View>

                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                </View>

                <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
            </ThemedView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    description: {
        fontSize: 14,
        marginTop: 4,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    dateText: {
        fontSize: 12,
    },
    priorityBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    deleteBtn: {
        padding: 8,
        marginLeft: 4,
    },
});
