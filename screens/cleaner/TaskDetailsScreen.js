import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TaskDetailsScreen = ({ navigation }) => {
    const [taskStatus, setTaskStatus] = useState('Pending'); // Pending, InProgress, Completed

    const handleAction = () => {
        if (taskStatus === 'Pending') {
            setTaskStatus('InProgress');
        } else if (taskStatus === 'InProgress') {
            console.log("Upload photo");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Details</Text>
                <View style={[styles.severityBadge, styles.mediumBadge]}>
                    <Text style={styles.mediumText}>● Medium</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <View style={styles.placeholderImage}>
                        <Ionicons name="trash-outline" size={60} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
                    </View>
                    <View style={[
                        styles.statusBadge,
                        taskStatus === 'Pending' ? styles.pendingBadge : styles.progressBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            taskStatus === 'Pending' ? styles.pendingText : styles.progressText
                        ]}>
                            {taskStatus === 'Pending' ? '⚠️ Pending' : '🕒 In Progress'}
                        </Text>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.taskTitle}>Plastic Waste</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                        <Text style={styles.locationText}>MG Road, Sector 5, Gurugram</Text>
                    </View>
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={18} color={COLORS.warning} style={{ marginRight: 10 }} />
                        <Text style={styles.overdueText}>Overdue</Text>
                    </View>

                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>
                            Large pile of plastic bottles and packaging materials near the main road.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.navigateOutlineBtn}>
                        <Ionicons name="navigate-outline" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                        <Text style={styles.navigateOutlineText}>Navigate to Location</Text>
                    </TouchableOpacity>

                    {taskStatus === 'InProgress' && (
                        <View style={styles.verificationSection}>
                            <Text style={styles.sectionTitle}>Photo Verification</Text>
                            <View style={styles.photoRow}>
                                <View style={styles.photoBox}>
                                    <Text style={styles.photoLabel}>Before</Text>
                                    <View style={styles.photoPlaceholder}>
                                        <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.photoBox}>
                                    <Text style={styles.photoLabel}>After</Text>
                                    <View style={styles.uploadPlaceholder}>
                                        <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                                        <Text style={styles.uploadText}>Upload After</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Sticky Action Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.mainActionBtn,
                        taskStatus === 'InProgress' && { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.primary }
                    ]}
                    onPress={handleAction}
                >
                    <Text style={[
                        styles.mainActionText,
                        taskStatus === 'InProgress' && { color: COLORS.primary }
                    ]}>
                        {taskStatus === 'Pending' ? 'Start Task' : 'Mark as Completed'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    mediumBadge: { backgroundColor: '#FEF3C7' },
    mediumText: { fontSize: 12, fontWeight: 'bold', color: '#D97706' },
    scrollContent: { paddingBottom: 100 },
    imageContainer: { width: '100%', height: 250, backgroundColor: '#F3F4F6' },
    placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    statusBadge: { position: 'absolute', bottom: 20, left: 20, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    pendingBadge: { backgroundColor: '#DCFCE7' },
    progressBadge: { backgroundColor: '#F59E0B' },
    statusText: { fontSize: 14, fontWeight: 'bold' },
    pendingText: { color: '#166534' },
    progressText: { color: '#FFF' },
    infoSection: { padding: 20 },
    taskTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    locationText: { fontSize: 14, color: COLORS.textSecondary },
    overdueText: { fontSize: 14, color: COLORS.warning, fontWeight: '600' },
    descriptionBox: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, marginBottom: 20 },
    descriptionText: { fontSize: 14, color: '#166534', lineHeight: 20 },
    navigateOutlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: COLORS.primary, marginBottom: 30 },
    navigateOutlineText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
    verificationSection: { marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 15 },
    photoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    photoBox: { width: '48%' },
    photoLabel: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
    photoPlaceholder: { height: 140, backgroundColor: '#F3F4F6', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    uploadPlaceholder: { height: 140, backgroundColor: '#F0FDF4', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed' },
    uploadText: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold', marginTop: 8 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    mainActionBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    mainActionText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default TaskDetailsScreen;
