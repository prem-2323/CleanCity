import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image, StatusBar, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const CleanerManagementScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const staffData = [
        {
            id: '1',
            name: 'Raj Kumar',
            status: 'Active',
            tasksCompleted: 42,
            rating: 4.8,
            currentLocation: 'Sector 5',
            avatar: 'https://i.pravatar.cc/150?u=raj'
        },
        {
            id: '2',
            name: 'Amit Singh',
            status: 'Idle',
            tasksCompleted: 38,
            rating: 4.5,
            currentLocation: 'HQ',
            avatar: 'https://i.pravatar.cc/150?u=amit'
        },
        {
            id: '3',
            name: 'Priya Sharma',
            status: 'On Leave',
            tasksCompleted: 120,
            rating: 4.9,
            currentLocation: 'N/A',
            avatar: 'https://i.pravatar.cc/150?u=priya'
        },
        {
            id: '4',
            name: 'Suresh L.',
            status: 'Active',
            tasksCompleted: 15,
            rating: 4.2,
            currentLocation: 'Market Rd',
            avatar: 'https://i.pravatar.cc/150?u=suresh'
        },
    ];

    const StaffCard = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate('Map')}>
            <View style={styles.cardLeft}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={[styles.statusIndicator,
                { backgroundColor: item.status === 'Active' ? '#10B981' : item.status === 'Idle' ? '#F59E0B' : '#94A3B8' }
                ]} />
            </View>

            <View style={styles.cardCenter}>
                <Text style={styles.nameText}>{item.name}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.locText}>{item.currentLocation}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statText}>⭐ {item.rating}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.statText}>{item.tasksCompleted} Tasks</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Management</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="person-add" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                    style={styles.input}
                    placeholder="Search staff..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.statsOverview}>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>15</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#10B981' }]}>08</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: '#F59E0B' }]}>04</Text>
                    <Text style={styles.statLabel}>Idle</Text>
                </View>
            </View>

            <FlatList
                data={staffData}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <StaffCard item={item} />}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        margin: 20,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    statsOverview: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    cardLeft: {
        marginRight: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    cardCenter: {
        flex: 1,
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    locText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    dot: {
        marginHorizontal: 8,
        color: '#CBD5E1',
    },
    actionBtn: {
        padding: 8,
    }
});

export default CleanerManagementScreen;
