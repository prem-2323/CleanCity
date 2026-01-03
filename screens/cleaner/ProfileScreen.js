import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const CleanerProfileScreen = ({ navigation }) => {
    const MenuItem = ({ icon, label, rightText, isDanger, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, isDanger && { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name={icon} size={22} color={isDanger ? COLORS.error : '#64748B'} />
                </View>
                <Text style={[styles.menuLabel, isDanger && { color: COLORS.error }]}>{label}</Text>
            </View>
            <View style={styles.menuRight}>
                {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info Section */}
                <View style={styles.userSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('EditProfile')}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={40} color="#CBD5E1" />
                        </View>
                        <View style={styles.camIconBox}>
                            <Ionicons name="camera" size={14} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>Raj Kumar</Text>
                        <Text style={styles.userEmail}>raj.cleaner@example.com</Text>
                        <View style={styles.roleBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#2563EB" style={{ marginRight: 4 }} />
                            <Text style={styles.roleText}>Verified Staff</Text>
                        </View>
                    </View>
                </View>

                {/* Earnings Card Section (Redeem Points) */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsLeft}>
                        <View style={styles.walletCircle}>
                            <Ionicons name="wallet" size={24} color="#F59E0B" />
                        </View>
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.earningsLabel}>Withdrawable Credits</Text>
                            <Text style={styles.earningsValue}>₹1,250</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.redeemButton}
                        onPress={() => alert('Payout request sent! Expect arrival in 24-48 hours.')}
                    >
                        <Text style={styles.redeemText}>Redeem</Text>
                    </TouchableOpacity>
                </View>

                {/* Fast Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>124</Text>
                        <Text style={styles.statLab}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>4.8 ★</Text>
                        <Text style={styles.statLab}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statVal}>98%</Text>
                        <Text style={styles.statLab}>Ontime</Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuCard}>
                    <MenuItem
                        icon="person-outline"
                        label="Edit Profile"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="bar-chart-outline"
                        label="Performance Analysis"
                        rightText="Level 4"
                        onPress={() => navigation.navigate('PerformanceAnalysis')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="time-outline"
                        label="Payout History"
                        onPress={() => navigation.navigate('PayoutHistory')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Support Center"
                        onPress={() => navigation.navigate('HelpSupport')}
                    />
                </View>

                {/* Log Out Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>End Session</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>CleanCity AI Staff • V2.4.0</Text>
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
        paddingBottom: 40,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        marginRight: 20,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    camIconBox: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2563EB',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        color: '#0284C7',
        fontWeight: '600',
    },
    earningsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    earningsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    walletCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earningsLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    earningsValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    redeemButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    redeemText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        alignItems: 'center',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statLab: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
    },
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightText: {
        fontSize: 14,
        color: '#64748B',
        marginRight: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 12,
    },
    logoutButton: {
        backgroundColor: '#1E293B',
        height: 56,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#94A3B8',
        fontSize: 12,
    }
});

export default CleanerProfileScreen;
