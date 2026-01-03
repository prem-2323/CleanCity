import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const CleanerHomeScreen = ({ navigation }) => {
    const TaskCard = ({ location, due, distance, severity }) => (
        <TouchableOpacity
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetails')}
        >
            <View style={styles.taskInfo}>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color="#1E293B" style={{ marginRight: 8 }} />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
                <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginRight: 8 }} />
                    <Text style={styles.timeText}>Due in {due} • {distance}</Text>
                </View>
            </View>
            <View style={[styles.severityBadge, severity === 'Hazardous' ? styles.hazardousBadge : styles.mediumBadge]}>
                <Text style={[styles.severityText, severity === 'Hazardous' ? styles.hazardousText : styles.mediumText]}>● {severity}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Good morning,</Text>
                        <Text style={styles.usernameText}>Raj Kumar</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarCircle} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Credits Card */}
                <View style={[styles.creditsCard, { backgroundColor: '#F59E0B' }]}>
                    <View>
                        <View style={styles.creditsRow}>
                            <Ionicons name="wallet-outline" size={16} color="rgba(0,0,0,0.6)" />
                            <Text style={[styles.creditsLabel, { color: 'rgba(0,0,0,0.7)' }]}> Total Credits</Text>
                        </View>
                        <Text style={[styles.creditsValue, { color: '#1E293B' }]}>₹1,250</Text>
                        <Text style={[styles.creditsSub, { color: '#065F46' }]}>📈 +₹350 this week</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.payoutBtn}
                        onPress={() => Alert.alert("Payout", "Payout request has been sent successfully!")}
                    >
                        <Text style={styles.payoutText}>Payout</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Section */}
                <Text style={styles.sectionTitle}>Daily Overview</Text>
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={styles.statBox}
                        onPress={() => navigation.navigate('Tasks')}
                    >
                        <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
                            <Ionicons name="briefcase" size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.statCount}>02</Text>
                        <Text style={styles.statLabel}>Assigned</Text>
                    </TouchableOpacity>
                    <View style={[styles.statBox, { backgroundColor: '#10B981' }]}>
                        <View style={[styles.statIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
                        </View>
                        <Text style={[styles.statCount, { color: '#FFF' }]}>03</Text>
                        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.9)' }]}>Completed</Text>
                    </View>
                </View>

                {/* Pending Tasks List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Pending Tasks</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <TaskCard
                    location="MG Road, Sector 5"
                    due="2 hours"
                    distance="1.2 km away"
                    severity="Medium"
                />
                <TaskCard
                    location="Park Avenue, Block A"
                    due="4 hours"
                    distance="2.5 km away"
                    severity="Hazardous"
                />
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
        marginBottom: 32,
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
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    creditsCard: {
        backgroundColor: '#0F172A',
        borderRadius: 28,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    creditsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    creditsLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '600',
    },
    creditsValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
    },
    creditsSub: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 4,
    },
    payoutBtn: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    payoutText: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 14,
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statBox: {
        width: '48%',
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    statCount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    taskCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    taskInfo: {
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    locationText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    severityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    mediumBadge: {
        backgroundColor: '#FFFBEB',
    },
    hazardousBadge: {
        backgroundColor: '#FEF2F2',
    },
    severityText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    mediumText: {
        color: '#D97706',
    },
    hazardousText: {
        color: '#EF4444',
    }
});

export default CleanerHomeScreen;
