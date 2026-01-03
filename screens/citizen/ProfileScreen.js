import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const ProfileScreen = ({ navigation }) => {
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
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
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
                        <Text style={styles.userName}>Priya Sharma</Text>
                        <Text style={styles.userEmail}>priya@example.com</Text>
                        <View style={styles.roleBadge}>
                            <Ionicons name="shield-checkmark" size={14} color="#10B981" style={{ marginRight: 4 }} />
                            <Text style={styles.roleText}>Citizen</Text>
                        </View>
                    </View>
                </View>

                {/* Points Card Section */}
                <View style={styles.pointsCard}>
                    <View style={styles.pointsLeft}>
                        <View style={styles.starCircle}>
                            <Ionicons name="star" size={24} color="#F59E0B" />
                        </View>
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.pointsLabel}>Total Points</Text>
                            <Text style={styles.pointsValue}>450</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.redeemButton} onPress={() => navigation.navigate('Wallet')}>
                        <Text style={styles.redeemText}>Redeem</Text>
                    </TouchableOpacity>
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
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="globe-outline"
                        label="Language"
                        rightText="English"
                        onPress={() => navigation.navigate('Language')}
                    />
                    <View style={styles.divider} />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => navigation.navigate('HelpSupport')}
                    />
                </View>

                {/* Log Out Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('Login')}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.white} style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
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
        color: COLORS.text,
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
        backgroundColor: COLORS.primary,
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
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    pointsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    pointsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFBEB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointsLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    pointsValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    redeemButton: {
        borderWidth: 1,
        borderColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    redeemText: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 14,
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
        backgroundColor: '#F34B4B',
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
    }
});

export default ProfileScreen;
