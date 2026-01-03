import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const MyReportsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');

    const reports = [
        {
            id: '1',
            title: 'Plastic Waste Pile',
            location: 'MG Road, Sector 5',
            status: 'Verified',
            time: '2 hours ago',
            points: '+20 pts',
            severity: 'Medium',
        },
        {
            id: '2',
            title: 'Overflowing Bin',
            location: 'Park Street',
            status: 'Pending',
            time: 'Yesterday',
            points: '—',
            severity: 'Hazardous',
        },
        {
            id: '3',
            title: 'Construction Debris',
            location: 'Old Town Square',
            status: 'Completed',
            time: '2 days ago',
            points: '+50 pts',
            severity: 'Low',
        },
    ];

    const StatusBadge = ({ status }) => {
        let bgColor = '#F1F5F9';
        let textColor = '#64748B';
        let icon = 'time-outline';

        if (status === 'Verified') {
            bgColor = '#DBEAFE';
            textColor = '#1D4ED8';
            icon = 'checkmark-circle-outline';
        } else if (status === 'Completed') {
            bgColor = '#DCFCE7';
            textColor = '#15803D';
            icon = 'star-outline';
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Ionicons name={icon} size={12} color={textColor} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
            </View>
        );
    };

    const ReportItem = ({ item }) => (
        <TouchableOpacity style={styles.reportCard}>
            <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{item.title}</Text>
                <Text style={styles.reportPoints}>{item.points}</Text>
            </View>

            <View style={styles.reportDetailRow}>
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text style={styles.reportDetailText}>{item.location}</Text>
            </View>

            <View style={styles.reportDetailRow}>
                <Ionicons name="calendar-outline" size={14} color="#64748B" />
                <Text style={styles.reportDetailText}>{item.time}</Text>
            </View>

            <View style={styles.reportFooter}>
                <StatusBadge status={item.status} />
                <View style={[styles.severityBadge,
                item.severity === 'Hazardous' ? styles.hazardousBg :
                    item.severity === 'Medium' ? styles.mediumBg : styles.lowBg
                ]}>
                    <Text style={[styles.severityText,
                    item.severity === 'Hazardous' ? styles.hazardousText :
                        item.severity === 'Medium' ? styles.mediumText : styles.lowText
                    ]}>● {item.severity}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Reports</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('NewReport')}>
                    <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {['All', 'Pending', 'Verified', 'Completed'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={reports.filter(r => activeTab === 'All' || r.status === activeTab)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ReportItem item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#E2E8F0" />
                        <Text style={styles.emptyText}>No reports found</Text>
                    </View>
                }
            />
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
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        marginRight: 20,
        paddingVertical: 6,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    listContent: {
        padding: 20,
    },
    reportCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    reportTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
    },
    reportPoints: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#10B981',
    },
    reportDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    reportDetailText: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 8,
    },
    reportFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    hazardousBg: { backgroundColor: '#FEF2F2' },
    hazardousText: { color: '#EF4444' },
    mediumBg: { backgroundColor: '#FFFBEB' },
    mediumText: { color: '#D97706' },
    lowBg: { backgroundColor: '#F0FDF4' },
    lowText: { color: '#10B981' },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#94A3B8',
        marginTop: 16,
    }
});

export default MyReportsScreen;
