import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const SettingsScreen = ({ navigation }) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(true);

    const SettingRow = ({ icon, label, subLabel, type, value, onValueChange }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
                <View style={styles.iconBox}>
                    <Ionicons name={icon} size={22} color="#64748B" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {subLabel && <Text style={styles.settingSubLabel}>{subLabel}</Text>}
                </View>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#E2E8F0', true: COLORS.primary + '80' }}
                    thumbColor={value ? COLORS.primary : '#F8FAFC'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionHeader}>Notifications</Text>
                <View style={styles.sectionCard}>
                    <SettingRow
                        icon="notifications-outline"
                        label="Push Notifications"
                        subLabel="Alerts about waste collection & rewards"
                        type="toggle"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon="mail-outline"
                        label="Email Reports"
                        subLabel="Weekly summary of your eco impact"
                        type="toggle"
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                    />
                </View>

                <Text style={styles.sectionHeader}>App Settings</Text>
                <View style={styles.sectionCard}>
                    <SettingRow
                        icon="moon-outline"
                        label="Dark Mode"
                        type="toggle"
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        icon="location-outline"
                        label="Location Services"
                        subLabel="Always allow for precise waste reporting"
                        type="toggle"
                        value={locationEnabled}
                        onValueChange={setLocationEnabled}
                    />
                </View>

                <Text style={styles.sectionHeader}>Security</Text>
                <View style={styles.sectionCard}>
                    <TouchableOpacity>
                        <SettingRow
                            icon="lock-closed-outline"
                            label="Change Password"
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity>
                        <SettingRow
                            icon="shield-outline"
                            label="Privacy Policy"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.white,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    scrollContent: {
        padding: 24,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 8,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    settingLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    settingSubLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    deleteBtn: {
        marginTop: 10,
        padding: 20,
        alignItems: 'center',
    },
    deleteText: {
        color: '#F43F5E',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SettingsScreen;
