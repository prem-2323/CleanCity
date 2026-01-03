import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Hello,</Text>
                        <Text style={styles.usernameText}>Priya Sharma</Text>
                    </View>
                    <TouchableOpacity style={styles.profileAvatar} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={24} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Points Card */}
                <View style={styles.pointsCard}>
                    <View style={styles.pointsHeader}>
                        <View>
                            <Text style={styles.pointsLabel}>Your Eco Points</Text>
                            <Text style={styles.pointsValue}>450</Text>
                            <View style={styles.statsRow}>
                                <Ionicons name="trending-up" size={14} color="rgba(255, 255, 255, 0.9)" />
                                <Text style={styles.pointsSubText}> +50 this week</Text>
                            </View>
                        </View>
                        <View style={styles.starCircle}>
                            <Ionicons name="star" size={32} color={COLORS.white} />
                        </View>
                    </View>
                </View>

                {/* Report Waste Button */}
                <TouchableOpacity
                    style={styles.mainActionButton}
                    onPress={() => navigation.navigate('NewReport')}
                >
                    <Ionicons name="add-circle" size={24} color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.mainActionText}>Report Waste</Text>
                </TouchableOpacity>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Map')}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="map-outline" size={24} color="#059669" />
                        </View>
                        <Text style={styles.actionLabel}>Waste Map</Text>
                        <Text style={styles.actionSubLabel}>View nearby</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Tasks')}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#F0F9FF' }]}>
                            <Ionicons name="document-text-outline" size={24} color="#0284C7" />
                        </View>
                        <Text style={styles.actionLabel}>My Reports</Text>
                        <Text style={styles.actionSubLabel}>12 total</Text>
                    </TouchableOpacity>
                </View>

                {/* Banner/Impact Card */}
                <View style={styles.impactCard}>
                    <View style={styles.impactIconBox}>
                        <Ionicons name="leaf-outline" size={24} color="#10B981" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.impactTitle}>Cleaning Impact</Text>
                        <Text style={styles.impactSubtitle}>You've helped resolve 9 waste issues this month!</Text>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.activityCard}>
                    <View style={styles.activityIconBox}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.activityTitle}>Report Verified</Text>
                        <Text style={styles.activityTime}>2 hours ago • Sector 5</Text>
                    </View>
                    <Text style={styles.activityPoints}>+20 pts</Text>
                </View>

                <View style={styles.activityCard}>
                    <View style={[styles.activityIconBox, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="time-outline" size={20} color="#D97706" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.activityTitle}>Report Submitted</Text>
                        <Text style={styles.activityTime}>Yesterday • MG Road</Text>
                    </View>
                    <Text style={[styles.activityPoints, { color: '#64748B' }]}>Pending</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    welcomeText: {
        fontSize: 14,
        color: '#64748B',
    },
    usernameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    profileAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    avatarCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pointsCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    pointsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    pointsValue: {
        color: COLORS.white,
        fontSize: 42,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    pointsSubText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    starCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainActionButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    mainActionText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    actionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    actionSubLabel: {
        fontSize: 12,
        color: '#64748B',
    },
    impactCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#DCFCE7',
        alignItems: 'center',
        marginBottom: 32,
    },
    impactIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    impactTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#065F46',
        marginBottom: 2,
    },
    impactSubtitle: {
        fontSize: 12,
        color: '#065F46',
        opacity: 0.8,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activityIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    activityTime: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    activityPoints: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#10B981',
    }
});

export default HomeScreen;
