import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const AdminProfileScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const MenuOption = ({ icon, label, subLabel, isDestructive, hasToggle, toggleValue, onToggle }) => (
        <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={hasToggle ? 1 : 0.7}
            onPress={hasToggle ? onToggle : null}
        >
            <View style={[styles.menuIconBox, isDestructive && styles.destructiveIconBox]}>
                <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : '#64748B'} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.menuLabel, isDestructive && styles.destructiveLabel]}>{label}</Text>
                {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
            </View>
            {hasToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
                    thumbColor={'#FFF'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Admin Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Administrator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Header Card */}
                <View style={styles.adminCard}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={36} color="#FFF" />
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark" size={10} color="#FFF" />
                            </View>
                        </View>
                        <View style={styles.adminInfo}>
                            <Text style={styles.adminName}>Sanjay Kumar</Text>
                            <Text style={styles.adminRole}>System Administrator</Text>
                            <View style={styles.idBadge}>
                                <Text style={styles.idText}>ID: ADM-001</Text>
                            </View>
                        </View>
                    </View>
                </View>



                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                            <Ionicons name="person-add" size={24} color="#2563EB" />
                        </View>
                        <Text style={styles.actionText}>Add Staff</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Ionicons name="megaphone" size={24} color="#D97706" />
                        </View>
                        <Text style={styles.actionText}>Broadcast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#E0E7FF' }]}>
                            <Ionicons name="document-text" size={24} color="#4F46E5" />
                        </View>
                        <Text style={styles.actionText}>Export Data</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings Menu */}
                <Text style={styles.sectionTitle}>Administration</Text>
                <View style={styles.menuContainer}>
                    <MenuOption
                        icon="people-outline"
                        label="User Management"
                        subLabel="Manage citizens and cleaning staff"
                    />
                    <View style={styles.menuDivider} />
                    <MenuOption
                        icon="notifications-outline"
                        label="System Alerts"
                        subLabel="Push notifications for critical issues"
                        hasToggle={true}
                        toggleValue={notifications}
                        onToggle={() => setNotifications(!notifications)}
                    />
                    <View style={styles.menuDivider} />
                    <MenuOption
                        icon="hammer-outline"
                        label="Maintenance Mode"
                        subLabel="Suspend all non-admin access"
                        hasToggle={true}
                        toggleValue={maintenanceMode}
                        onToggle={() => setMaintenanceMode(!maintenanceMode)}
                    />
                    <View style={styles.menuDivider} />
                    <MenuOption
                        icon="settings-outline"
                        label="Platform Settings"
                        subLabel="App configuration and versions"
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Text style={styles.logoutText}>Safe Logout</Text>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>

                <Text style={styles.versionText}>Admin Console v2.1.0 • Build 2401</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    adminCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 20,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    adminInfo: {
        flex: 1,
    },
    adminName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    adminRole: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 8,
    },
    idBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    idText: {
        fontSize: 11,
        color: '#CBD5E1',
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    statusWidget: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    uptimeText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricItem: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionCard: {
        width: '31%',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    menuContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    destructiveIconBox: {
        backgroundColor: '#FEF2F2',
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    destructiveLabel: {
        color: '#EF4444',
    },
    menuSubLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 24,
    }
});

export default AdminProfileScreen;
