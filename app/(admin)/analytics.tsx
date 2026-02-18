import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReports } from '@/contexts/ReportsContext';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <View style={barStyles.container}>
      {data.map((val, i) => (
        <View key={i} style={barStyles.barColumn}>
          <View style={barStyles.barWrapper}>
            <View style={[barStyles.bar, { height: `${(val / max) * 100}%` as any, backgroundColor: i % 2 === 0 ? Colors.primary : Colors.secondary }]} />
          </View>
          <Text style={barStyles.label}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 8, paddingTop: 8 },
  barColumn: { flex: 1, alignItems: 'center' },
  barWrapper: { width: '100%', height: 120, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, minHeight: 8 },
  label: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.gray500, marginTop: 6 },
});

function PieChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  return (
    <View style={pieStyles.container}>
      <View style={pieStyles.pieVisual}>
        {segments.map((seg, i) => (
          <View key={i} style={[pieStyles.segment, { flex: seg.value, backgroundColor: seg.color }]} />
        ))}
      </View>
      <View style={pieStyles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={pieStyles.legendItem}>
            <View style={[pieStyles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={pieStyles.legendLabel}>{seg.label}</Text>
            <Text style={pieStyles.legendValue}>{Math.round((seg.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pieStyles = StyleSheet.create({
  container: { gap: 14 },
  pieVisual: { flexDirection: 'row', height: 24, borderRadius: 12, overflow: 'hidden' },
  segment: { minWidth: 4 },
  legend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray600 },
  legendValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
});

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { reports, staff } = useReports();

  const byType = ['plastic', 'organic', 'hazardous', 'electronic', 'mixed'].map(type => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: reports.filter(r => r.wasteType === type).length,
    color: type === 'plastic' ? '#3B82F6' : type === 'organic' ? '#10B981' : type === 'hazardous' ? '#EF4444' : type === 'electronic' ? '#8B5CF6' : '#F59E0B',
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12, paddingBottom: 120 }]}>
      <Text style={styles.pageTitle}>Analytics</Text>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Reports</Text>
            <Ionicons name="bar-chart" size={18} color={Colors.gray400} />
          </View>
          <BarChart data={[8, 12, 6, 15, 10, 18, 14]} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Waste Distribution</Text>
            <Ionicons name="pie-chart" size={18} color={Colors.gray400} />
          </View>
          <PieChart segments={byType} />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Staff Rankings</Text>
            <Ionicons name="trophy" size={18} color={Colors.gray400} />
          </View>
          {staff.sort((a, b) => b.tasksCompleted - a.tasksCompleted).map((member, i) => (
            <View key={member.id} style={styles.staffRow}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#EAB308' : i === 1 ? '#94A3B8' : i === 2 ? '#D97706' : Colors.gray200 }]}>
                <Text style={styles.rankText}>{i + 1}</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffMeta}>{member.zone} - {member.tasksCompleted} tasks</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color={Colors.warning} />
                <Text style={styles.ratingText}>{member.rating}</Text>
              </View>
            </View>
          ))}
        </Card>
      </Animated.View>

      <Pressable style={({ pressed }) => [styles.exportBtn, pressed && { opacity: 0.9 }]}>
        <Ionicons name="download-outline" size={20} color={Colors.primary} />
        <Text style={styles.exportText}>Export Report</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 16 },
  chartCard: { marginBottom: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.white },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  staffMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 1 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.warning },
  exportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.primary, marginTop: 8 },
  exportText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
});
