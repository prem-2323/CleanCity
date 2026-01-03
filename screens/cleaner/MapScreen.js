import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const CleanerMapScreen = ({ navigation }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [activeFilter, setActiveFilter] = useState('My Tasks');

    const tasks = [
        { id: '1', type: 'My Tasks', color: '#2563EB', top: height * 0.3, left: width * 0.4, title: 'MG Road Cleanup', address: 'Sector 5, Gurugram', distance: '1.2 km', time: '5 mins' },
        { id: '2', type: 'Available', color: '#10B981', top: height * 0.5, left: width * 0.2, title: 'Park Avenue Bin', address: 'Block A', distance: '2.5 km', time: '12 mins' },
        { id: '3', type: 'Urgent', color: '#EF4444', top: height * 0.45, left: width * 0.7, title: 'Hazardous Waste', address: 'Market Square', distance: '3.8 km', time: '18 mins' },
    ];

    const TaskMarker = ({ task }) => (
        <TouchableOpacity
            style={[styles.markerContainer, { top: task.top, left: task.left }]}
            onPress={() => setSelectedTask(task)}
        >
            <View style={[styles.markerContent, { backgroundColor: task.color }]}>
                <Ionicons
                    name={task.type === 'My Tasks' ? 'person' : 'trash'}
                    size={16}
                    color="#FFF"
                />
            </View>
            <View style={[styles.markerPointer, { borderTopColor: task.color }]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Map Area */}
            <View style={styles.mapContainer}>
                {/* Simulated Map Background */}
                <View style={styles.mapCanvas}>
                    {/* Simulated Navigation Route Line */}
                    <View style={styles.routePath} />
                    {/* Simulated Grid/Roads */}
                    <View style={styles.roadH} />
                    <View style={styles.roadV} />
                </View>

                {/* Markers */}
                {tasks.map(task => (
                    (activeFilter === 'All' || activeFilter === task.type) && (
                        <TaskMarker key={task.id} task={task} />
                    )
                ))}

                {/* Top Overlay: Filter Tabs & Back */}
                <View style={styles.topOverlay}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#1E293B" />
                        </TouchableOpacity>
                        <View style={styles.searchBox}>
                            <Ionicons name="search" size={18} color="#94A3B8" />
                            <Text style={styles.searchPlaceholder}>Search for locations...</Text>
                        </View>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
                        {['My Tasks', 'Available', 'Urgent', 'All'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterChip, activeFilter === f && styles.activeChip]}
                                onPress={() => {
                                    setActiveFilter(f);
                                    setSelectedTask(null);
                                }}
                            >
                                <Text style={[styles.chipText, activeFilter === f && styles.activeChipText]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Quick Stats Overlay (Floating) */}
                <View style={styles.floatingStats}>
                    <View style={styles.statLine}>
                        <View style={styles.liveDot} />
                        <Text style={styles.statLabel}>Online & Routing</Text>
                    </View>
                </View>

                {/* Bottom Detail Card (When task selected) */}
                {selectedTask && (
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <View style={styles.dragHandle} />
                        </View>

                        <View style={styles.taskInfoRow}>
                            <View style={[styles.taskTypeBadge, { backgroundColor: selectedTask.color + '20' }]}>
                                <Text style={[styles.taskTypeText, { color: selectedTask.color }]}>{selectedTask.type}</Text>
                            </View>
                            <Text style={styles.etaText}>{selectedTask.time} away</Text>
                        </View>

                        <Text style={styles.taskName}>{selectedTask.title}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={16} color="#64748B" />
                            <Text style={styles.addressText}>{selectedTask.address}</Text>
                        </View>

                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={styles.detailsBtn}
                                onPress={() => navigation.navigate('TaskDetails')}
                            >
                                <Text style={styles.detailsBtnText}>View Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.navBtn, { backgroundColor: selectedTask.color }]}>
                                <Ionicons name="navigate" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.navBtnText}>Navigate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Re-center Button */}
                <TouchableOpacity style={styles.locateBtn}>
                    <Ionicons name="locate" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    mapCanvas: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#E5E7EB',
    },
    roadH: {
        position: 'absolute',
        top: height * 0.4,
        width: '100%',
        height: 50,
        backgroundColor: '#CBD5E1',
    },
    roadV: {
        position: 'absolute',
        left: width * 0.45,
        width: 50,
        height: '100%',
        backgroundColor: '#CBD5E1',
    },
    routePath: {
        position: 'absolute',
        top: height * 0.35,
        left: width * 0.45,
        width: width * 0.1,
        height: height * 0.15,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: '#3B82F6',
        borderBottomLeftRadius: 20,
        zIndex: 1,
    },
    topOverlay: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        height: 48,
        borderRadius: 16,
        marginLeft: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchPlaceholder: {
        color: '#94A3B8',
        marginLeft: 10,
        fontSize: 14,
    },
    filterBar: {
        flexDirection: 'row',
    },
    filterChip: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    activeChip: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748B',
    },
    activeChipText: {
        color: '#FFF',
    },
    markerContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    markerContent: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    markerPointer: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -1,
    },
    floatingStats: {
        position: 'absolute',
        top: 140,
        right: 20,
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    statLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 8,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    sheetHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
    },
    taskInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    taskTypeText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    etaText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#10B981',
    },
    taskName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    addressText: {
        fontSize: 15,
        color: '#64748B',
        marginLeft: 6,
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailsBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    detailsBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748B',
    },
    navBtn: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    locateBtn: {
        position: 'absolute',
        right: 20,
        bottom: 240,
        width: 52,
        height: 52,
        backgroundColor: '#FFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
    }
});

export default CleanerMapScreen;
