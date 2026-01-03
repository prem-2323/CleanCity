import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const PerformanceAnalysisScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Performance Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Level Card */}
                <View style={styles.levelCard}>
                    <View style={styles.levelHeader}>
                        <Text style={styles.levelTitle}>Current Level</Text>
                        <Text style={styles.levelBadge}>Level 4</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '80%' }]} />
                    </View>
                    <Text style={styles.levelSub}>20 points to reach Level 5</Text>
                </View>

                {/* Stats Grid */}
                <Text style={styles.sectionTitle}>Key Metrics</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="checkmark-done-circle" size={32} color="#10B981" />
                        <Text style={styles.statValue}>124</Text>
                        <Text style={styles.statLabel}>Tasks Done</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="star" size={32} color="#F59E0B" />
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Avg Rating</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="time" size={32} color="#3B82F6" />
                        <Text style={styles.statValue}>98%</Text>
                        <Text style={styles.statLabel}>On Time</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="trophy" size={32} color="#8B5CF6" />
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Badges</Text>
                    </View>
                </View>

                {/* Recent Feedback */}
                <Text style={styles.sectionTitle}>Recent Feedback</Text>
                {[
                    { id: 1, user: 'Priya S.', comment: 'Very quick and thorough!', rating: 5, time: '2 days ago' },
                    { id: 2, user: 'Amit K.', comment: 'Good job cleaning the park.', rating: 4, time: '4 days ago' },
                    { id: 3, user: 'Rahul M.', comment: 'Excellent work.', rating: 5, time: '1 week ago' },
                ].map(item => (
                    <View key={item.id} style={styles.feedbackCard}>
                        <View style={styles.feedbackHeader}>
                            <Text style={styles.feedbackUser}>{item.user}</Text>
                            <View style={styles.ratingBox}>
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text style={styles.ratingText}>{item.rating}</Text>
                            </View>
                        </View>
                        <Text style={styles.feedbackComment}>{item.comment}</Text>
                        <Text style={styles.feedbackTime}>{item.time}</Text>
                    </View>
                ))}
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
    levelCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
    },
    levelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    levelTitle: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '600',
    },
    levelBadge: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        marginBottom: 12,
    },
    progressBarFill: {
        height: 8,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    levelSub: {
        fontSize: 13,
        color: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    feedbackCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    feedbackUser: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#B45309',
    },
    feedbackComment: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8,
    },
    feedbackTime: {
        fontSize: 12,
        color: '#94A3B8',
    }
});

export default PerformanceAnalysisScreen;
