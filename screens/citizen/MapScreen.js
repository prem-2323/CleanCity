import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedPin, setSelectedPin] = useState(null);

    const hotspots = [
        { id: '1', level: 'Hazardous', color: '#EF4444', top: height * 0.25, left: width * 0.3, title: 'Medical Waste', location: 'MG Road' },
        { id: '2', level: 'Medium', color: '#F59E0B', top: height * 0.4, left: width * 0.6, title: 'Plastic Overflow', location: 'Sector 5' },
        { id: '3', level: 'Low', color: '#10B981', top: height * 0.55, left: width * 0.2, title: 'Littering', location: 'Park Lane' },
        { id: '4', level: 'Hazardous', color: '#EF4444', top: height * 0.45, left: width * 0.8, title: 'Chemical Leak', location: 'Industrial Area' },
        { id: '5', level: 'Medium', color: '#F59E0B', top: height * 0.7, left: width * 0.45, title: 'Uncollected Trash', location: 'Market Sq' },
    ];

    const MapMarker = ({ pin }) => (
        <TouchableOpacity
            style={[styles.markerContainer, { top: pin.top, left: pin.left }]}
            onPress={() => setSelectedPin(pin)}
        >
            <View style={[styles.markerPin, { backgroundColor: pin.color }]}>
                <Ionicons
                    name={pin.level === 'Hazardous' ? 'warning' : pin.level === 'Medium' ? 'alert' : 'leaf'}
                    size={14}
                    color="#FFF"
                />
            </View>
            <View style={[styles.markerTail, { borderTopColor: pin.color }]} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Map Area */}
            <View style={styles.mapArea}>
                {/* Visual Map Background Pattern */}
                <View style={styles.mapGrid}>
                    {[...Array(10)].map((_, i) => (
                        <View key={i} style={styles.gridLineH} />
                    ))}
                    {[...Array(8)].map((_, i) => (
                        <View key={i} style={styles.gridLineV} />
                    ))}
                    {/* Simulated Roads */}
                    <View style={styles.mainRoadH} />
                    <View style={styles.mainRoadV} />
                </View>

                {/* Hotspot Markers */}
                {hotspots.map(pin => (
                    (activeFilter === 'All' || activeFilter === pin.level) && (
                        <MapMarker key={pin.id} pin={pin} />
                    )
                ))}

                {/* Top Overlay: Search Bar */}
                <View style={styles.topOverlay}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Search waste hotspots..."
                            style={styles.searchInput}
                            placeholderTextColor="#94A3B8"
                        />
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {['All', 'Hazardous', 'Medium', 'Low'].map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterChip, activeFilter === f && styles.activeChip]}
                                onPress={() => {
                                    setActiveFilter(f);
                                    setSelectedPin(null);
                                }}
                            >
                                <View style={[styles.chipIndicator, {
                                    backgroundColor: f === 'Hazardous' ? '#EF4444' : f === 'Medium' ? '#F59E0B' : f === 'Low' ? '#10B981' : '#CBD5E1'
                                }]} />
                                <Text style={[styles.chipText, activeFilter === f && styles.activeChipText]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Map Controls (Floating) */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlBtn}>
                        <Ionicons name="add" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}>
                        <Ionicons name="remove" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlBtn, { marginTop: 16, backgroundColor: COLORS.primary }]}>
                        <Ionicons name="locate" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Selected Pin Details (Bottom Card) */}
                {selectedPin && (
                    <View style={styles.detailCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTitle}>{selectedPin.title}</Text>
                                <Text style={styles.cardLocation}>{selectedPin.location}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedPin(null)}>
                                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardInfoSec}>
                            <View style={styles.infoPill}>
                                <Ionicons name="pulse" size={14} color={selectedPin.color} />
                                <Text style={[styles.infoPillText, { color: selectedPin.color }]}> {selectedPin.level} Risk</Text>
                            </View>
                            <View style={[styles.infoPill, { backgroundColor: '#F1F5F9' }]}>
                                <Ionicons name="people-outline" size={14} color="#64748B" />
                                <Text style={[styles.infoPillText, { color: '#64748B' }]}> 12 reports</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.reportHereBtn, { backgroundColor: selectedPin.color }]}
                            onPress={() => navigation.navigate('NewReport')}
                        >
                            <Text style={styles.reportHereText}>Add to this report</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Floating "Report from Here" for New Spot */}
                {!selectedPin && (
                    <TouchableOpacity
                        style={styles.floatingReportBtn}
                        onPress={() => navigation.navigate('NewReport')}
                    >
                        <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.floatingReportText}>Report New Spot</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mapArea: {
        flex: 1,
        backgroundColor: '#E2E8F0', // Map background color
        overflow: 'hidden',
    },
    mapGrid: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    gridLineH: {
        width: '100%',
        height: 1,
        backgroundColor: '#64748B',
        marginTop: height * 0.1,
    },
    gridLineV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#64748B',
        left: width * 0.125,
    },
    mainRoadH: {
        position: 'absolute',
        top: height * 0.4,
        width: '100%',
        height: 60,
        backgroundColor: '#CBD5E1',
    },
    mainRoadV: {
        position: 'absolute',
        left: width * 0.4,
        width: 60,
        height: '100%',
        backgroundColor: '#CBD5E1',
    },
    topOverlay: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    filterBtn: {
        padding: 5,
    },
    filterScroll: {
        marginTop: 12,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
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
    chipIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    chipText: {
        fontSize: 14,
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
    markerPin: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        zIndex: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    markerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -2,
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: height * 0.3,
    },
    controlBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#FFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    detailCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 28,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    cardLocation: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    cardInfoSec: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: '#F8FAFC',
    },
    infoPillText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    reportHereBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportHereText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    floatingReportBtn: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    floatingReportText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default MapScreen;
