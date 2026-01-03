import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const AdminMapScreen = ({ navigation }) => {
    const [selectedObject, setSelectedObject] = useState(null);
    const [viewMode, setViewMode] = useState('All'); // Workers, Zones, All

    const zones = [
        { id: 'z1', name: 'Sector 5 Central', level: 'Hazardous', color: '#EF4444', top: height * 0.2, left: width * 0.2, radius: 100, cleaners: 4, reports: 12 },
        { id: 'z2', name: 'Industrial Belt', level: 'Medium', color: '#F59E0B', top: height * 0.5, left: width * 0.6, radius: 140, cleaners: 2, reports: 8 },
        { id: 'z3', name: 'Park Lane Residential', level: 'Low', color: '#10B981', top: height * 0.35, left: width * 0.45, radius: 80, cleaners: 1, reports: 3 },
    ];

    const workers = [
        { id: 'w1', name: 'Raj Kumar', status: 'Working', area: 'Sector 5', top: height * 0.24, left: width * 0.28, battery: '84%', task: 'Plastic Cleanup' },
        { id: 'w2', name: 'Amit Singh', status: 'Traveling', area: 'Main Road', top: height * 0.45, left: width * 0.55, battery: '92%', task: 'Going to HQ' },
        { id: 'w3', name: 'Suresh L.', status: 'Working', area: 'Park Lane', top: height * 0.38, left: width * 0.48, battery: '45%', task: 'Bin Emptying' },
        { id: 'w4', name: 'Pankaj V.', status: 'Idle', area: 'Sector 2', top: height * 0.65, left: width * 0.3, battery: '76%', task: 'Break' },
    ];

    const ZoneMarker = ({ zone }) => (
        <TouchableOpacity
            style={[styles.zoneCircle, {
                top: zone.top,
                left: zone.left,
                width: zone.radius,
                height: zone.radius,
                borderRadius: zone.radius / 2,
                backgroundColor: zone.color + '15', // Lighter opacity
                borderColor: zone.color,
            }]}
            onPress={() => setSelectedObject({ type: 'zone', data: zone })}
        >
            <View style={[styles.zoneLabel, { backgroundColor: zone.color }]}>
                <Text style={styles.zoneLabelText}>{zone.reports}</Text>
            </View>
        </TouchableOpacity>
    );

    const WorkerMarker = ({ worker }) => (
        <TouchableOpacity
            style={[styles.workerMarker, { top: worker.top, left: worker.left }]}
            onPress={() => setSelectedObject({ type: 'worker', data: worker })}
        >
            <View style={[styles.workerIconBox, { borderColor: worker.status === 'Idle' ? '#94A3B8' : COLORS.primary }]}>
                <Image
                    source={{ uri: `https://i.pravatar.cc/150?u=${worker.id}` }}
                    style={styles.workerAvatar}
                />
            </View>
            <View style={[styles.statusDot, { backgroundColor: worker.status === 'Working' ? '#10B981' : worker.status === 'Traveling' ? '#F59E0B' : '#94A3B8' }]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Map Area */}
            <View style={styles.mapFrame}>
                {/* Lighter Map Background */}
                <View style={styles.mapBackground} />

                {/* Simulated Roads/Blocks */}
                <View style={[styles.road, { top: height * 0.3, height: 40, width: '100%' }]} />
                <View style={[styles.road, { left: width * 0.5, width: 40, height: '100%' }]} />

                {/* Draw Zones First */}
                {(viewMode === 'All' || viewMode === 'Zones') && zones.map(z => <ZoneMarker key={z.id} zone={z} />)}

                {/* Draw Workers on Top */}
                {(viewMode === 'All' || viewMode === 'Workers') && workers.map(w => <WorkerMarker key={w.id} worker={w} />)}

                {/* Top Control Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.mapTitle}>Live Analytics Map</Text>

                    <View style={styles.modeTabs}>
                        <TouchableOpacity
                            style={[styles.filterBtn, viewMode !== 'All' && styles.filterBtnActive]}
                            onPress={() => setViewMode(viewMode === 'All' ? 'Zones' : 'All')}
                        >
                            <Ionicons name="layers" size={20} color={viewMode !== 'All' ? '#FFF' : '#1E293B'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Floating Status Box */}
                {!selectedObject && (
                    <View style={styles.globalStatus}>
                        <View style={styles.statusItem}>
                            <Text style={styles.statusVal}>12</Text>
                            <Text style={styles.statusLab}>Total Staff</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusVal, { color: '#10B981' }]}>08</Text>
                            <Text style={styles.statusLab}>Active Now</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statusItem}>
                            <Text style={[styles.statusVal, { color: '#EF4444' }]}>03</Text>
                            <Text style={styles.statusLab}>Hotspots</Text>
                        </View>
                    </View>
                )}

                {/* Selection Detail Panel */}
                {selectedObject && (
                    <View style={styles.detailPanel}>
                        <View style={styles.panelHeader}>
                            <View>
                                <Text style={styles.panelSubtitle}>{selectedObject.type === 'worker' ? 'Field Personnel' : 'High Waste Zone'}</Text>
                                <Text style={styles.panelTitle}>{selectedObject.data.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedObject(null)}>
                                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.panelBody}>
                            {selectedObject.type === 'worker' ? (
                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="battery-charging" size={16} color="#64748B" />
                                        <Text style={styles.infoText}> {selectedObject.data.battery}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="location" size={16} color="#64748B" />
                                        <Text style={styles.infoText}> {selectedObject.data.area}</Text>
                                    </View>
                                    <View style={[styles.infoItem, { width: '100%', marginTop: 8 }]}>
                                        <Ionicons name="clipboard" size={16} color="#64748B" />
                                        <Text style={styles.infoText}> {selectedObject.data.task}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="people" size={16} color="#64748B" />
                                        <Text style={styles.infoText}> {selectedObject.data.cleaners} Staff Assigned</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="alert-circle" size={16} color="#64748B" />
                                        <Text style={styles.infoText}> {selectedObject.data.reports} Reports</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity style={[styles.actionBtnPrimary, { backgroundColor: selectedObject.type === 'worker' ? '#2563EB' : selectedObject.data.color }]}>
                            <Text style={styles.actionBtnTextPri}>{selectedObject.type === 'worker' ? 'Contact Staff' : 'Dispatch Squad'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    mapFrame: {
        flex: 1,
        backgroundColor: '#F1F5F9', // Light Map
        overflow: 'hidden',
    },
    mapBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#F8FAFC',
    },
    road: {
        position: 'absolute',
        backgroundColor: '#E2E8F0',
    },
    topBar: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    mapTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    filterBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    filterBtnActive: {
        backgroundColor: '#1E293B',
    },
    zoneCircle: {
        position: 'absolute',
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoneLabel: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    zoneLabelText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    workerMarker: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    workerIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    workerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    globalStatus: {
        position: 'absolute',
        top: 90,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    statusItem: {
        flex: 1,
        alignItems: 'center',
    },
    statusVal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusLab: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    divider: {
        width: 1,
        backgroundColor: '#E2E8F0',
    },
    detailPanel: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    panelSubtitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    panelBody: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    infoItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '600',
        marginLeft: 8,
    },
    actionBtnPrimary: {
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnTextPri: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default AdminMapScreen;
