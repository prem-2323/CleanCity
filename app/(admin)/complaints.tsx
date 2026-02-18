import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useReports, ReportPriority } from '@/contexts/ReportsContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

const PRIORITY_FILTERS: { key: ReportPriority | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

export default function ComplaintManagementScreen() {
  const insets = useSafeAreaInsets();
  const { reports } = useReports();
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | 'all'>('all');

  const filtered = priorityFilter === 'all' ? reports : reports.filter(r => r.priority === priorityFilter);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>Complaints</Text>
        <Text style={styles.countLabel}>{filtered.length} complaints</Text>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={PRIORITY_FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setPriorityFilter(item.key); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.filterChip, priorityFilter === item.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, priorityFilter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>No complaints</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push({ pathname: '/report-detail', params: { id: item.id } })}>
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.reportMeta}>
                  <Ionicons name="location-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.reportAddress} numberOfLines={1}>{item.address}</Text>
                </View>
              </View>
              <PriorityBadge priority={item.priority} />
            </View>
            <View style={styles.reportFooter}>
              <StatusBadge status={item.status} />
              {!item.assignedTo && item.status === 'pending' && (
                <Pressable
                  onPress={() => router.push({ pathname: '/assign-staff', params: { reportId: item.id } })}
                  style={({ pressed }) => [styles.assignBtn, pressed && { opacity: 0.8 }]}
                >
                  <Ionicons name="person-add" size={14} color={Colors.white} />
                  <Text style={styles.assignText}>Assign</Text>
                </Pressable>
              )}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  filterRow: { paddingVertical: 12, backgroundColor: Colors.white },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray100 },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray600 },
  filterTextActive: { color: Colors.white },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reportInfo: { flex: 1, marginRight: 8 },
  reportTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  reportAddress: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, flex: 1 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  assignText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
});
