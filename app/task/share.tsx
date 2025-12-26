import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShareScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'dark';
    const isDark = colorScheme === 'dark';

    return (
        <ThemedView style={styles.container} darkColor="#000000">
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)' }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.headerBtnText}>Batal</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : '#000' }]}>Bagikan Tugas</Text>
                <TouchableOpacity onPress={() => console.log('Kirim')}>
                    <Text style={[styles.headerBtnText, styles.headerBtnBold]}>Kirim</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Shared Item */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>ITEM YANG DIBAGIKAN</Text>
                    <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                        <View style={[styles.sharedItemHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                            <View style={styles.sharedIcon}>
                                <MaterialIcons name="assignment" size={26} color="#FFF" />
                            </View>
                            <View style={styles.sharedInfo}>
                                <Text style={[styles.sharedTitle, { color: isDark ? '#FFF' : '#000' }]}>Laporan Keuangan Q3</Text>
                                <Text style={styles.sharedSubtitle}>Daftar Tugas • 5 Item</Text>
                            </View>
                            <TouchableOpacity style={[styles.editBtn, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                <Text style={[styles.editBtnText, { color: isDark ? '#FFF' : '#000' }]}>Ubah</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.accessRow}>
                            <View style={styles.accessLeft}>
                                <View style={[styles.accessIcon, { backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }]}>
                                    <MaterialIcons name="lock-open" size={18} color={isDark ? '#FB923C' : '#C2410C'} />
                                </View>
                                <Text style={[styles.accessLabel, { color: isDark ? '#FFF' : '#000' }]}>Akses Pengguna</Text>
                            </View>
                            <View style={styles.accessRight}>
                                <Text style={styles.accessValue}>Bisa Mengedit</Text>
                                <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { backgroundColor: isDark ? '#2C2C2E' : 'rgba(118, 118, 128, 0.12)', color: isDark ? '#FFF' : '#000' }]}
                        placeholder="Nama, email, atau kontak"
                        placeholderTextColor="#8E8E93"
                    />
                </View>

                {/* Suggested */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>DISARANKAN</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedList}>
                        {/* Suggested Users */}
                        {[
                            { name: 'Deva', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV0_lUD82f22JRZlnzaMucG1MtvwGb6frcszZ_gjOfmPMAmCNoOgwxgU11YvdBEkZQYPRP0909Y_LZBHfDIB9nn3hln0INJSpx_LDvlwSm_BfjZt5vntm-IWZ2MCeFtlZplq45MbzUjI9I-aDvb_dJXrkujs--SvsV31xXxMCUz7ciHPQLcGbkUw1CZETTS11yh0nczIBfR_gwVtl7iyTKz-AzR82TJM_LxkKFTiSXPorQbqbCaaf4-GNUEnypxi1w9qMfk7ZPSSI' },
                            { name: 'Siti', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo_0ye_ffT7Qjph0HIOq-b-D4kZzCRui4u_77EH81YnwjlOV3sbw3B8qMtE0g7bGC5J3Jed_YNGGIBnCGNNpExWnhpyhEceslYi_XA_NQEssOYd_xIj2o9RjEWnx8G0PmbmS8NZTScxec7p5YWIlgRgK3T2NN7koG9mLemnqxGFqDETD_2qxcG2L_8cgTX2FRbfP5rpfgLoLLVHcZrzD7FghAIUhWSTJr5zq7UuwlhE6GnqP-asyprlzeZbBP2rAD9yUZFtP5u7zI', selected: true },
                            { name: 'Andi', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlCSsGESbBotjsDUqhAsUAh59AGRmzahUZdA7ESjJNAz_QVQlmNvY9yXJ2iqri0aOybxheWQsd1g432Plo9fbhZhOELCtzDBDzuU4A7qwhKKg2SLk5VrNV74wB-6GbV1rCDiFBoy056WrQshMVakQMPEzaVddbEpQQqAp-jsI9QL605ZfL-lyQAf7s2OAvnyvbL24chHBH7wFFbQ5bK5hqv5aDytN-eZfl7Bqbaq2cNX5HJtNxLMNmUzr4uMl2nowS-Nu0b0E_mn8' },
                            { name: 'Dewi', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW84ZvrVserk9hmww3BVe6VqameIc0hqDL8-0PnSHOpzsxQOa5tZ-TcnVsbPl261wcPb7NIRCS7-hgVDNgJGDgBTORL7tpUQL5MXg-808QcBFklL6d6h-CveMxDdl1ez9Z3hBvLM_aX-XlJy4hLVYd0VXEBsFVuq-QWwYAN9nKbiH7ho5C3WjLzo1yrN5JA9y50J1HDQYmfy9aBXr4qy-zuMqbxfJ4wMcgw_tLUyLVaIWa_Ml1hnllH9d0ZbW7t8Y-9D_inGVGu3w' },
                        ].map((user, i) => (
                            <TouchableOpacity key={i} style={styles.suggestedUser}>
                                <View style={[styles.avatarContainer, user.selected && { borderColor: '#007AFF', borderWidth: 2 }]}>
                                    <Image source={{ uri: user.img }} style={styles.avatarLarge} />
                                    {user.selected && (
                                        <View style={styles.checkBadge}>
                                            <MaterialIcons name="check" size={10} color="#FFF" />
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.userName, { color: user.selected ? '#007AFF' : (isDark ? '#FFF' : '#000') }]}>{user.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* All Contacts */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#8E8E93' }]}>SEMUA KONTAK</Text>
                    <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                        {/* Copy Link */}
                        <TouchableOpacity style={[styles.contactItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                            <View style={[styles.contactAvatar, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                                <MaterialIcons name="link" size={20} color="#007AFF" />
                            </View>
                            <View style={styles.contactInfo}>
                                <View style={styles.contactRow}>
                                    <View>
                                        <Text style={[styles.contactName, { color: '#007AFF' }]}>Salin Link Undangan</Text>
                                        <Text style={styles.contactEmail}>Siapapun dengan link bisa melihat</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Contacts List */}
                        {[
                            { name: 'Rina Wati', email: 'rina.wati@gmail.com', initials: 'RW', color: '#6366F1' },
                            { name: 'Dimas Prasetyo', email: 'dimas.p@kantor.co.id', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0jMAEma0Tq4krQ5qzl4uKL9XDDAD1KSRic8pABLBkS0n7veY_TkDOzURJ_0zmFf9Ma0H4v4N1-CkXDncc6k_Bd327Z7JM98GKvkFZ20BspBhZH4cgh0sCgITx9JIH8laQYzhyKmOxxD5yiN7fslNINeiPmZh3tgaG0rxMQyLxDFHnyFzj1mxS9gZ9aiq_j1X_bRpuqhywRptTe2rxdwPSc1oAq59FJBToWpZuRRFea5GEnfmFwGZYyaWSz2XWZhagXs7tQqmQDmk' },
                            { name: 'Sarah Johnson', email: 'sarah.j@gmail.com', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG_tmeRkmDDoTsAO-A1nf_40EpivS_7rrStPNk3Cb9vJJGjKTazO_aMVpfpJXChas1o-gLjkmeyNWlkDyuvzM_adYGvR9TB8OqBmNWgRuawar6MugYkG6C-IrBTTA81ByrYKy1RUa2_dvet7lLq5NxmdTG7IWblvwDEeG49KcuimrMhlE_nkMYcaE4slsnYI77xiUUWmvyUdbXO3hKc28ql1W7yj718Bftf458zH_8_pdCCnaTM_7wr77FKggmlOBHXOD104kebvI', selected: true },
                            { name: 'Arif Nugroho', email: 'arif.nugroho@yahoo.com', initials: 'AN', color: '#F97316' },
                        ].map((contact, i) => (
                            <TouchableOpacity key={i} style={[styles.contactItem, { backgroundColor: contact.selected ? 'rgba(0,122,255,0.05)' : 'transparent', borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', borderBottomWidth: i < 3 ? 1 : 0 }]}>
                                {contact.img ? (
                                    <Image source={{ uri: contact.img }} style={styles.contactImage} />
                                ) : (
                                    <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                                        <Text style={styles.initials}>{contact.initials}</Text>
                                    </View>
                                )}

                                <View style={styles.contactInfo}>
                                    <View style={styles.contactRow}>
                                        <View>
                                            <Text style={[styles.contactName, { color: isDark ? '#FFF' : '#000' }]}>{contact.name}</Text>
                                            <Text style={styles.contactEmail}>{contact.email}</Text>
                                        </View>
                                        <View style={[styles.checkbox, contact.selected && styles.checkboxSelected, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}>
                                            {contact.selected && <MaterialIcons name="check" size={14} color="#FFF" />}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <TouchableOpacity style={styles.sendBtn}>
                    <Text style={styles.sendBtnText}>Bagikan ke 1 Kontak</Text>
                    <MaterialIcons name="send" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
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
    headerBtnText: {
        fontSize: 17,
        color: '#007AFF',
    },
    headerBtnBold: {
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        paddingVertical: 24,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 12,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sharedItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
        borderBottomWidth: 1,
    },
    sharedIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sharedInfo: {
        flex: 1,
    },
    sharedTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    sharedSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
    },
    editBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    editBtnText: {
        fontSize: 13,
        fontWeight: '500',
    },
    accessRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    accessLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    accessIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accessLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    accessRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    accessValue: {
        fontSize: 15,
        color: '#8E8E93',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 30,
        top: 12,
        zIndex: 1,
    },
    searchInput: {
        height: 44,
        borderRadius: 12,
        paddingLeft: 44,
        paddingRight: 16,
        fontSize: 17,
    },
    suggestedList: {
        gap: 16,
        paddingHorizontal: 4,
    },
    suggestedUser: {
        alignItems: 'center',
        width: 72,
        gap: 8,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        position: 'relative',
    },
    avatarLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    checkBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#007AFF',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    contactAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    initials: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    contactInfo: {
        flex: 1,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactName: {
        fontSize: 16,
        fontWeight: '500',
    },
    contactEmail: {
        fontSize: 13,
        color: '#8E8E93',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
    },
    sendBtn: {
        backgroundColor: '#007AFF',
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendBtnText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
    },
});
