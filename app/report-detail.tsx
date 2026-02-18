import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/contexts/ReportsContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

export default function ReportDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { reports } = useReports();
  const report = reports.find(r => r.id === id);

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.gray300} />
          <Text style={styles.emptyText}>Report not found</Text>
        </View>
      </View>
    );
  }

  const wasteIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    plastic: 'water', organic: 'leaf', hazardous: 'warning', electronic: 'hardware-chip', mixed: 'layers',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.topTitle}>Report Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={[styles.wasteIconBg, { backgroundColor: Colors.lightBlue }]}>
              <Ionicons name={wasteIcons[report.wasteType] || 'trash'} size={24} color={Colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportType}>{report.wasteType.charAt(0).toUpperCase() + report.wasteType.slice(1)} Waste</Text>
            </View>
          </View>
          <View style={styles.badgesRow}>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </View>
        </Card>

        {report.description ? (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{report.description}</Text>
          </Card>
        ) : null}

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={Colors.primary} />
            <Text style={styles.address}>{report.address}</Text>
          </View>
          <View style={styles.mapPreview}>
            <Ionicons name="map-outline" size={32} color={Colors.gray300} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <View style={styles.analysisRow}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{report.aiConfidence}%</Text>
              <Text style={styles.analysisLabel}>Confidence</Text>
            </View>
            <View style={styles.analysisDivider} />
            <View style={styles.analysisItem}>
              <Text style={[styles.analysisValue, { color: Colors.success }]}>{report.creditsEarned}</Text>
              <Text style={styles.analysisLabel}>Credits Earned</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.success }]} />
            <View>
              <Text style={styles.timelineLabel}>Created</Text>
              <Text style={styles.timelineDate}>{new Date(report.createdAt).toLocaleString()}</Text>
            </View>
          </View>
          {report.assignedTo && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: Colors.secondary }]} />
              <View>
                <Text style={styles.timelineLabel}>Assigned</Text>
                <Text style={styles.timelineDate}>Staff member assigned</Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerCard: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  wasteIconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, justifyContent: 'center' },
  reportTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  reportType: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray600, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  address: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray700, flex: 1 },
  mapPreview: { height: 100, borderRadius: 12, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  analysisRow: { flexDirection: 'row', alignItems: 'center' },
  analysisItem: { flex: 1, alignItems: 'center', gap: 2 },
  analysisValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.primary },
  analysisLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  analysisDivider: { width: 1, height: 40, backgroundColor: Colors.gray200 },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  timelineDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
});
