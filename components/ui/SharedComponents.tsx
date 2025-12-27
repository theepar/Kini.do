import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    DimensionValue,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

import { useThemeColors } from '@/hooks/useThemeColors';

// ============================================================
// ICON BOX COMPONENT
// ============================================================
interface IconBoxProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    size?: number;
    style?: ViewStyle;
}

/**
 * Colored icon container used in menu items.
 * Provides consistent circular icon display.
 */
export const IconBox: React.FC<IconBoxProps> = ({
    icon,
    color,
    size = 18,
    style,
}) => (
    <View style={[styles.iconBox, { backgroundColor: color }, style]}>
        <MaterialIcons name={icon} size={size} color="#FFF" />
    </View>
);

// ============================================================
// MENU ITEM COMPONENT
// ============================================================

interface MenuItemProps {
    /** MaterialIcons icon name */
    icon: keyof typeof MaterialIcons.glyphMap;
    /** Icon background color */
    iconColor: string;
    /** Label text */
    label: string;
    /** Optional value to display on the right */
    value?: string;
    /** Show chevron indicator (default: true for onPress items) */
    showChevron?: boolean;
    /** Show border at bottom (default: true) */
    showBorder?: boolean;
    /** Touch handler - if provided, row is touchable */
    onPress?: () => void;
    /** Render switch instead of chevron */
    switchValue?: boolean;
    /** Switch change handler */
    onSwitchChange?: (value: boolean) => void;
    /** Render custom right component */
    rightComponent?: React.ReactNode;
    /** Custom style overrides */
    style?: ViewStyle;
}

/**
 * Reusable menu/settings row with icon, label, and action.
 * Supports touchable, switch, or custom right components.
 * 
 * @example
 * <MenuItem
 *   icon="calendar-today"
 *   iconColor="#EF4444"
 *   label="Date"
 *   value="Today"
 *   onPress={() => setShowDatePicker(true)}
 * />
 */
export const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    iconColor,
    label,
    value,
    showChevron = true,
    showBorder = true,
    onPress,
    switchValue,
    onSwitchChange,
    rightComponent,
    style,
}) => {
    const { colors, isDark } = useThemeColors();
    
    const borderColor = isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6';
    
    const content = (
        <View style={[
            styles.menuItem,
            showBorder && { borderBottomWidth: 1, borderBottomColor: borderColor },
            style,
        ]}>
            <View style={styles.menuLeft}>
                <IconBox icon={icon} color={iconColor} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
            </View>
            
            {rightComponent ? (
                rightComponent
            ) : onSwitchChange !== undefined ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ 
                        false: isDark ? '#3A3A3C' : '#E5E7EB', 
                        true: '#34C759' 
                    }}
                    thumbColor="#FFF"
                />
            ) : (
                <View style={styles.menuRight}>
                    {value && (
                        <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                            {value}
                        </Text>
                    )}
                    {showChevron && onPress && (
                        <MaterialIcons 
                            name="chevron-right" 
                            size={20} 
                            color={isDark ? '#4B5563' : '#D1D5DB'} 
                        />
                    )}
                </View>
            )}
        </View>
    );
    
    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }
    
    return content;
};

// ============================================================
// BOTTOM MODAL COMPONENT
// ============================================================

interface BottomModalProps {
    /** Control modal visibility */
    visible: boolean;
    /** Close handler */
    onClose: () => void;
    /** Modal title */
    title: string;
    /** Modal content */
    children: React.ReactNode;
    /** Maximum height as percentage or number (default: '60%') */
    maxHeight?: DimensionValue;
}

/**
 * Standard bottom sheet modal container.
 * Provides consistent modal styling across the app.
 * 
 * @example
 * <BottomModal
 *   visible={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Select Category"
 * >
 *   {content}
 * </BottomModal>
 */
export const BottomModal: React.FC<BottomModalProps> = ({
    visible,
    onClose,
    title,
    children,
    maxHeight = '60%',
}) => {
    const { colors, isDark } = useThemeColors();
    
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View 
                    style={[
                        styles.modalContent, 
                        { 
                            backgroundColor: colors.cardBackground,
                            maxHeight: maxHeight,
                        }
                    ]}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <MaterialIcons 
                                name="close" 
                                size={24} 
                                color={colors.textSecondary} 
                            />
                        </TouchableOpacity>
                    </View>
                    {children}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

// ============================================================
// SELECTION OPTION COMPONENT
// ============================================================

interface SelectionOptionProps {
    /** Label text */
    label: string;
    /** Whether this option is selected */
    selected: boolean;
    /** Selection handler */
    onSelect: () => void;
    /** Optional left icon or component */
    leftComponent?: React.ReactNode;
    /** Show bottom border (default: true) */
    showBorder?: boolean;
}

/**
 * Selectable option item for lists.
 * Shows checkmark when selected.
 */
export const SelectionOption: React.FC<SelectionOptionProps> = ({
    label,
    selected,
    onSelect,
    leftComponent,
    showBorder = true,
}) => {
    const { colors, isDark } = useThemeColors();
    
    return (
        <TouchableOpacity
            style={[
                styles.selectionOption,
                selected && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' },
                showBorder && { 
                    borderBottomWidth: 1, 
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' 
                },
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            <View style={styles.selectionLeft}>
                {leftComponent}
                <Text style={[styles.selectionLabel, { color: colors.text }]}>
                    {label}
                </Text>
            </View>
            {selected && (
                <MaterialIcons name="check" size={20} color="#3B82F6" />
            )}
        </TouchableOpacity>
    );
};

// ============================================================
// THEMED INPUT COMPONENT
// ============================================================

interface ThemedInputProps {
    /** Input value */
    value: string;
    /** Change handler */
    onChangeText: (text: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Enable multiline (default: false) */
    multiline?: boolean;
    /** Max character length */
    maxLength?: number;
    /** Custom style */
    style?: TextStyle;
    /** Auto focus on mount */
    autoFocus?: boolean;
}

/**
 * Themed text input with consistent styling.
 */
export const ThemedInput: React.FC<ThemedInputProps> = ({
    value,
    onChangeText,
    placeholder,
    multiline = false,
    maxLength,
    style,
    autoFocus = false,
}) => {
    const { colors, isDark } = useThemeColors();
    
    return (
        <TextInput
            style={[
                styles.themedInput,
                {
                    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
                    color: colors.text,
                },
                multiline && { minHeight: 100, textAlignVertical: 'top' as const },
                style,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline={multiline}
            maxLength={maxLength}
            autoFocus={autoFocus}
        />
    );
};

// ============================================================
// COLOR PICKER GRID
// ============================================================

interface ColorPickerProps {
    /** Currently selected color */
    selectedColor: string;
    /** Available colors to choose from */
    colors: readonly string[];
    /** Selection handler */
    onSelectColor: (color: string) => void;
}

/**
 * Grid of selectable color options.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
    selectedColor,
    colors: colorOptions,
    onSelectColor,
}) => (
    <View style={styles.colorGrid}>
        {colorOptions.map((color) => (
            <TouchableOpacity
                key={color}
                style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => onSelectColor(color)}
            >
                {selectedColor === color && (
                    <MaterialIcons name="check" size={16} color="#FFF" />
                )}
            </TouchableOpacity>
        ))}
    </View>
);

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
    // Icon Box
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    // Menu Item
    menuItem: {
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
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    menuValue: {
        fontSize: 15,
    },
    
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 34,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    
    // Selection Option
    selectionOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    selectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    selectionLabel: {
        fontSize: 16,
    },
    
    // Themed Input
    themedInput: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        marginHorizontal: 20,
        marginBottom: 16,
    },
    
    // Color Picker
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 16,
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
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
});
