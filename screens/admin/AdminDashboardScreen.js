import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

            {/* Top Bar */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.subHeader}>Welcome back,</Text>
                    <Text style={styles.headerTitle}>Administrator</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-circle" size={40} color="#CBD5E1" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Card: City Health */}
                <View style={styles.heroCard}>
                    <View>
                        <Text style={styles.heroLabel}>City Cleanliness Score</Text>
                        <Text style={styles.heroValue}>84%</Text>
                        <Text style={styles.heroSub}>+2.4% from last week</Text>
                    </View>
                    <View style={styles.heroCircle}>
                        <Ionicons name="shield-checkmark" size={40} color="#FFF" />
                    </View>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}
                        onPress={() => navigation.navigate('ManageReports')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#BAE6FD' }]}>
                            <Ionicons name="alert-circle" size={24} color="#0284C7" />
                        </View>
                        <Text style={[styles.statValue, { color: '#0284C7' }]}>12</Text>
                        <Text style={[styles.statLabel, { color: '#0369A1' }]}>Critical</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}
                        onPress={() => navigation.navigate('CleanerManagement')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#BBF7D0' }]}>
                            <Ionicons name="people" size={24} color="#16A34A" />
                        </View>
                        <Text style={[styles.statValue, { color: '#16A34A' }]}>08</Text>
                        <Text style={[styles.statLabel, { color: '#15803D' }]}>Active Staff</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}
                        onPress={() => navigation.navigate('ManageReports')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#FDE68A' }]}>
                            <Ionicons name="time" size={24} color="#D97706" />
                        </View>
                        <Text style={[styles.statValue, { color: '#D97706' }]}>24</Text>
                        <Text style={[styles.statLabel, { color: '#B45309' }]}>Pending</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Grid */}
                <Text style={styles.sectionTitle}>Management Console</Text>
                <View style={styles.menuGrid}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ManageReports')}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
                            <Ionicons name="folder-open" size={28} color="#9333EA" />
                        </View>
                        <Text style={styles.menuText}>Reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Map')}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
                            <Ionicons name="map" size={28} color="#0284C7" />
                        </View>
                        <Text style={styles.menuText}>Live Map</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#FCE7F3' }]}>
                            <Ionicons name="bar-chart" size={28} color="#DB2777" />
                        </View>
                        <Text style={styles.menuText}>Analytics</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('CleanerManagement')}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#FFEDD5' }]}>
                            <Ionicons name="people-circle" size={28} color="#EA580C" />
                        </View>
                        <Text style={styles.menuText}>Users</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Alert Banner */}
                <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('ManageReports')}>
                    <View style={styles.alertLeft}>
                        <Ionicons name="notifications" size={24} color="#FFF" />
                    </View>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>New High Priority Report</Text>
                        <Text style={styles.alertSub}>Chemical waste reported in Sector 9...</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#F3F4F6',
    },
    subHeader: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    heroLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    heroValue: {
        color: '#FFF',
        fontSize: 36,
        fontWeight: 'bold',
    },
    heroSub: {
        color: '#A7F3D0',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    heroCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        width: '31%',
        borderRadius: 20,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    menuItem: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuIconBox: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#334155',
    },
    alertBanner: {
        backgroundColor: '#EF4444',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    alertLeft: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    alertSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    }
});

export default AdminDashboardScreen;
