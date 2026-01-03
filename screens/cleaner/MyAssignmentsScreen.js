import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MyAssignmentsScreen = ({ navigation }) => {
    const [activeFilter, setActiveFilter] = useState('Pending');

    const TaskCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TaskDetails')}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.severity === 'High' ? '#FEE2E2' : '#FEF3C7' }]}>
                    <Ionicons
                        name={item.severity === 'High' ? 'alert-circle' : 'warning'}
                        size={14}
                        color={item.severity === 'High' ? '#EF4444' : '#F59E0B'}
                    />
                    <Text style={[styles.typeText, { color: item.severity === 'High' ? '#EF4444' : '#F59E0B' }]}>
                        {item.severity} Priority
                    </Text>
                </View>
                {item.isOverdue && (
                    <View style={styles.overdueBadge}>
                        <Text style={styles.overdueText}>OVERDUE</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoCol}>
                    <Text style={styles.taskTitle}>{item.type}</Text>
                    <View style={styles.locRow}>
                        <Ionicons name="location" size={16} color="#64748B" />
                        <Text style={styles.locText}>{item.address}</Text>
                    </View>
                </View>
                <View style={styles.rewardContainer}>
                    <Text style={styles.rewardLabel}>Credits</Text>
                    <Text style={styles.rewardValue}>+₹{item.credits}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View style={styles.timeInfo}>
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text style={styles.timeText}>Due: {item.date}</Text>
                </View>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('Map')}
                >
                    <Ionicons name="navigate-circle" size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>Start Routing</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const assignments = [
        { id: '1', type: 'Plastic Waste', address: 'MG Road, Sector 5', date: 'Today, 2:00 PM', severity: 'Medium', isOverdue: true, credits: '150' },
        { id: '2', type: 'Chemical Leakage', address: 'Industrial Area, Gate 3', date: 'Today, 4:30 PM', severity: 'High', isOverdue: false, credits: '450' },
        { id: '3', type: 'General Litter', address: 'Central Park North', date: 'Tomorrow, 9:00 AM', severity: 'Medium', isOverdue: false, credits: '100' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Elegant Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Manage your work</Text>
                    <Text style={styles.headerTitle}>My Assignments</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn}>
                    <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                    <View style={styles.dot} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
                {['Pending', 'In Progress', 'Completed'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeFilter === tab && styles.activeTab]}
                        onPress={() => setActiveFilter(tab)}
                    >
                        <Text style={[styles.tabText, activeFilter === tab && styles.activeTabText]}>{tab}</Text>
                        {activeFilter === tab && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
                {activeFilter === 'Pending' ? (
                    assignments.map(item => <TaskCard key={item.id} item={item} />)
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="clipboard-outline" size={60} color="#CBD5E1" />
                        </View>
                        <Text style={styles.emptyTitle}>No {activeFilter} tasks</Text>
                        <Text style={styles.emptySub}>You're all caught up for now!</Text>
                    </View>
                )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    notificationBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        marginRight: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        // No extra bg change
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#94A3B8',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    scrollArea: {
        padding: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    overdueBadge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    overdueText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#EF4444',
        letterSpacing: 0.5,
    },
    cardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoCol: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    locRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 6,
    },
    rewardContainer: {
        alignItems: 'flex-end',
        paddingLeft: 16,
    },
    rewardLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    rewardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 6,
        fontWeight: '500',
    },
    actionBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    }
});

export default MyAssignmentsScreen;
