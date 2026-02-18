import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useReports, ReportStatus } from '@/contexts/ReportsContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

const FILTERS: { key: ReportStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

export default function MyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { reports } = useReports();
  const [filter, setFilter] = useState<ReportStatus | 'all'>('all');

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>My Reports</Text>
        <Text style={styles.countLabel}>{filtered.length} reports</Text>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setFilter(item.key); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
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
            <Ionicons name="document-text-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptySubtext}>Reports matching this filter will appear here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push({ pathname: '/report-detail', params: { id: item.id } })}>
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.reportAddress} numberOfLines={1}>{item.address}</Text>
              </View>
              <PriorityBadge priority={item.priority} />
            </View>
            <View style={styles.reportFooter}>
              <StatusBadge status={item.status} />
              <Text style={styles.reportDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
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
  reportAddress: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
});
