import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const WalletScreen = ({ navigation }) => {
    const RewardCard = ({ icon, title, cost, color }) => (
        <View style={[styles.rewardCard, { backgroundColor: color }]}>
            <View style={styles.rewardIconCircle}>
                <Ionicons name={icon} size={28} color="#1E293B" />
            </View>
            <Text style={styles.rewardTitle} numberOfLines={2}>{title}</Text>
            <TouchableOpacity style={styles.redeemSmallBtn}>
                <Text style={styles.redeemSmallBtnText}>{cost} Pts</Text>
            </TouchableOpacity>
        </View>
    );

    const ActivityItem = ({ icon, title, time, amount, type }) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityIconBox, { backgroundColor: type === 'plus' ? '#F0FDF4' : '#FFF1F2' }]}>
                <Ionicons name={icon} size={20} color={type === 'plus' ? '#10B981' : '#F43F5E'} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.activityTitle}>{title}</Text>
                <Text style={styles.activityTime}>{time}</Text>
            </View>
            <Text style={[styles.activityAmount, { color: type === 'plus' ? '#10B981' : '#F43F5E' }]}>
                {type === 'plus' ? '+' : '-'}{amount}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Rewards</Text>
                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="help-circle-outline" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceTop}>
                        <View>
                            <Text style={styles.balanceLabel}>Available Points</Text>
                            <Text style={styles.balanceAmount}>2,450</Text>
                        </View>
                        <View style={styles.badgeContainer}>
                            <View style={styles.silverBadge}>
                                <Ionicons name="medal" size={14} color="#64748B" />
                                <Text style={styles.badgeText}> Silver Tier</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressText}>350 pts from Gold</Text>
                            <Text style={styles.progressPercent}>70%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '70%' }]} />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.actionText}>How to earn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.actionText}>Redeem Guide</Text>
                    </TouchableOpacity>
                </View>

                {/* Featured Rewards */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Featured Rewards</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsList}>
                    <RewardCard
                        icon="bus"
                        title="City Bus Pass (1 Day)"
                        cost="500"
                        color="#F0F9FF"
                    />
                    <RewardCard
                        icon="cafe"
                        title="Local Coffee Voucher"
                        cost="250"
                        color="#FDF2F8"
                    />
                    <RewardCard
                        icon="leaf"
                        title="Plant a Tree"
                        cost="1000"
                        color="#F0FDF4"
                    />
                </ScrollView>

                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityList}>
                    <ActivityItem
                        icon="checkmark-done-circle"
                        title="Report Verified"
                        time="Today, 2:30 PM"
                        amount="50"
                        type="plus"
                    />
                    <ActivityItem
                        icon="trash"
                        title="Waste Collection Guide"
                        time="Yesterday"
                        amount="10"
                        type="plus"
                    />
                    <ActivityItem
                        icon="cart"
                        title="Redeemed Coffee"
                        time="Oct 12"
                        amount="250"
                        type="minus"
                    />
                </View>

                <View style={{ height: 40 }} />
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
    headerAction: {
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
    scrollContent: {
        padding: 24,
    },
    balanceCard: {
        backgroundColor: '#0F172A',
        borderRadius: 32,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    balanceTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: 'bold',
        marginTop: 4,
    },
    silverBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressSection: {
        marginTop: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },
    progressPercent: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionBtn: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    actionText: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
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
    rewardsList: {
        marginBottom: 32,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    rewardCard: {
        width: 160,
        borderRadius: 24,
        padding: 20,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    rewardIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 16,
        height: 40,
    },
    redeemSmallBtn: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    redeemSmallBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    activityList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    activityIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    activityTime: {
        fontSize: 12,
        color: '#64748B',
    },
    activityAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default WalletScreen;
