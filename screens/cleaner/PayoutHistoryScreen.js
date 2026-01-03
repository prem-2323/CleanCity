import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const PayoutHistoryScreen = ({ navigation }) => {
    const transactions = [
        { id: '1', date: 'Oct 24, 2023', amount: '₹1,250', status: 'Completed', type: 'Payout' },
        { id: '2', date: 'Oct 17, 2023', amount: '₹980', status: 'Completed', type: 'Payout' },
        { id: '3', date: 'Oct 10, 2023', amount: '₹1,500', status: 'Completed', type: 'Payout' },
        { id: '4', date: 'Oct 03, 2023', amount: '₹1,100', status: 'Completed', type: 'Payout' },
        { id: '5', date: 'Sep 26, 2023', amount: '₹850', status: 'Completed', type: 'Payout' },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.transactionCard}>
            <View style={styles.iconBox}>
                <Ionicons name="arrow-up" size={20} color="#EF4444" />
            </View>
            <View style={styles.transInfo}>
                <Text style={styles.transType}>{item.type}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
            </View>
            <View style={styles.transRight}>
                <Text style={styles.transAmount}>-{item.amount}</Text>
                <Text style={styles.transStatus}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payout History</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <FlatList
                    data={transactions}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
    content: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 20,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transInfo: {
        flex: 1,
    },
    transType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    transDate: {
        fontSize: 13,
        color: '#64748B',
    },
    transRight: {
        alignItems: 'flex-end',
    },
    transAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EF4444', // Red for outflow
        marginBottom: 2,
    },
    transStatus: {
        fontSize: 12,
        color: '#10B981', // Green for success status
        fontWeight: '600',
    }
});

export default PayoutHistoryScreen;
