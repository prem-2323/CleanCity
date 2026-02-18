import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card } from '@/components/Card';
import { MiniTrendChart } from '@/components/MiniTrendChart';
import Colors from '@/constants/colors';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { userName } = useAuth();
  const { reports } = useReports();

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const assignedCount = reports.filter(r => r.status === 'assigned').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const criticalCount = reports.filter(r => r.priority === 'critical').length;

  const kpis = [
    { label: 'Total Reports', value: reports.length.toString(), icon: 'document-text' as const, color: Colors.primary, trend: [12, 18, 15, 22, 25, 20, reports.length] },
    { label: 'Pending', value: pendingCount.toString(), icon: 'time' as const, color: Colors.warning, trend: [5, 8, 6, 9, 7, 4, pendingCount] },
    { label: 'Resolved', value: resolvedCount.toString(), icon: 'checkmark-circle' as const, color: Colors.success, trend: [3, 5, 7, 8, 10, 12, resolvedCount] },
    { label: 'Critical', value: criticalCount.toString(), icon: 'warning' as const, color: Colors.danger, trend: [2, 4, 3, 5, 3, 2, criticalCount] },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#1E40AF']} style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Admin Panel</Text>
            <Text style={styles.userName}>{userName || 'Administrator'}</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.kpiGrid}>
          {kpis.map((kpi, i) => (
            <Card key={i} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '15' }]}>
                  <Ionicons name={kpi.icon} size={18} color={kpi.color} />
                </View>
                <MiniTrendChart data={kpi.trend} width={50} height={24} color={kpi.color} />
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={styles.heatmapCard}>
            <Text style={styles.cardTitle}>Complaint Heatmap</Text>
            <View style={styles.heatmapGrid}>
              {Array.from({ length: 35 }).map((_, i) => {
                const intensity = Math.random();
                return (
                  <View
                    key={i}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor:
                          intensity > 0.7 ? Colors.danger + '80'
                          : intensity > 0.4 ? Colors.warning + '60'
                          : intensity > 0.2 ? Colors.success + '40'
                          : Colors.gray200,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={styles.heatmapLegend}>
              <Text style={styles.legendText}>Low</Text>
              <View style={styles.legendBar}>
                {[Colors.gray200, Colors.success + '40', Colors.warning + '60', Colors.danger + '80'].map((c, i) => (
                  <View key={i} style={[styles.legendSegment, { backgroundColor: c }]} />
                ))}
              </View>
              <Text style={styles.legendText}>High</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Complaints</Text>
            <Pressable onPress={() => router.push('/(admin)/complaints' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {reports.slice(0, 3).map((report) => (
            <Card key={report.id} style={styles.complaintCard} onPress={() => router.push({ pathname: '/report-detail', params: { id: report.id } })}>
              <View style={styles.complaintRow}>
                <View style={[styles.priorityIndicator, { backgroundColor: report.priority === 'critical' ? Colors.danger : report.priority === 'high' ? Colors.warning : Colors.secondary }]} />
                <View style={styles.complaintInfo}>
                  <Text style={styles.complaintTitle} numberOfLines={1}>{report.title}</Text>
                  <Text style={styles.complaintMeta}>{report.wasteType} - {report.status.replace('_', ' ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
              </View>
            </Card>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular' },
  userName: { fontSize: 22, color: Colors.white, fontFamily: 'Inter_700Bold' },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  kpiCard: { width: '47%' as any, padding: 14 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  kpiLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  heatmapCard: { marginBottom: 20 },
  cardTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 14 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatmapCell: { width: 36, height: 36, borderRadius: 6 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  legendText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  legendBar: { flexDirection: 'row', flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  legendSegment: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  seeAll: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.secondary },
  complaintCard: { marginBottom: 10 },
  complaintRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priorityIndicator: { width: 4, height: 40, borderRadius: 2 },
  complaintInfo: { flex: 1 },
  complaintTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  complaintMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2, textTransform: 'capitalize' },
});
