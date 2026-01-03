import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, StatusBar, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ManageReportsScreen = ({ navigation }) => {
    const [filter, setFilter] = useState('All');

    const reports = [
        {
            id: '1',
            img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=300&auto=format&fit=crop', // Trash image
            title: 'Overflowing Bin',
            location: 'Sector 5 Market',
            status: 'Pending',
            risk: 'Medium',
            time: '10m ago'
        },
        {
            id: '2',
            img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=300&auto=format&fit=crop', // Biohazard
            title: 'Medical Waste',
            location: 'City Hospital Zone',
            status: 'New',
            risk: 'Critical',
            time: '25m ago'
        },
        {
            id: '3',
            img: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=300&auto=format&fit=crop', // Litter
            title: 'Park Litter',
            location: 'Central Park',
            status: 'Resolved',
            risk: 'Low',
            time: '1h ago'
        }
    ];

    const FeedItem = ({ item }) => (
        <View style={styles.card}>
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.img }} style={styles.cardImage} resizeMode="cover" />
                <View style={[styles.riskBadge, { backgroundColor: item.risk === 'Critical' ? '#EF4444' : '#F59E0B' }]}>
                    <Text style={styles.riskText}>{item.risk}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.locRow}>
                    <Ionicons name="location-sharp" size={16} color="#94A3B8" />
                    <Text style={styles.locText}>{item.location}</Text>
                </View>

                {/* Status Bar */}
                <View style={styles.statusBar}>
                    <View style={[styles.statusDot,
                    { backgroundColor: item.status === 'Resolved' ? '#10B981' : item.status === 'New' ? '#EF4444' : '#F59E0B' }
                    ]} />
                    <Text style={styles.statusText}>Status: {item.status}</Text>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.actionBtn, item.status === 'Resolved' ? styles.btnResolved : styles.btnActive]}
                    onPress={() => item.status === 'Resolved' ? null : navigation.navigate('Map')}
                >
                    <Text style={[styles.btnText, item.status === 'Resolved' && { color: '#10B981' }]}>
                        {item.status === 'Resolved' ? 'View Archive' : 'Dispatch Team'}
                    </Text>
                    {item.status !== 'Resolved' && <Ionicons name="arrow-forward" size={16} color="#FFF" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Issue Feed</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={reports}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <FeedItem item={item} />}
                contentContainerStyle={styles.feed}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    feed: {
        padding: 24,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
    },
    imageContainer: {
        height: 180,
        backgroundColor: '#E2E8F0',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    riskBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    riskText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    cardContent: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    timeText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    locRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    locText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 6,
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 12,
        marginBottom: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    statusText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: 'bold',
    },
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
    },
    btnActive: {
        backgroundColor: '#1E293B',
    },
    btnResolved: {
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 8,
    }
});

export default ManageReportsScreen;
