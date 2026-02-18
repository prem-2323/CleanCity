import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReports, StaffMember } from '@/contexts/ReportsContext';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

function WorkloadBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min((current / max) * 100, 100);
  const color = pct > 75 ? Colors.danger : pct > 50 ? Colors.warning : Colors.success;
  return (
    <View style={wlStyles.container}>
      <View style={wlStyles.track}>
        <View style={[wlStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[wlStyles.pct, { color }]}>{Math.round(pct)}%</Text>
    </View>
  );
}

const wlStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  track: { flex: 1, height: 6, backgroundColor: Colors.gray200, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 11, fontFamily: 'Inter_600SemiBold', minWidth: 32, textAlign: 'right' },
});

export default function StaffManagementScreen() {
  const insets = useSafeAreaInsets();
  const { staff } = useReports();

  const activeCount = staff.filter(s => s.active).length;
  const totalCompleted = staff.reduce((sum, s) => sum + s.tasksCompleted, 0);
  const avgRating = staff.length > 0 ? (staff.reduce((sum, s) => sum + s.rating, 0) / staff.length).toFixed(1) : '0';

  const sortedStaff = useMemo(() => [...staff].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    return b.rating - a.rating;
  }), [staff]);

  const renderStaffItem = ({ item, index }: { item: StaffMember; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
      <Card style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={[styles.avatar, !item.active && styles.avatarInactive]}>
            <Ionicons name="person" size={24} color={item.active ? Colors.primary : Colors.gray400} />
            <View style={[styles.statusDot, { backgroundColor: item.active ? Colors.success : Colors.gray400 }]} />
          </View>
          <View style={styles.staffInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.staffName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.active ? Colors.success + '15' : Colors.gray200 }]}>
                <Text style={[styles.statusText, { color: item.active ? Colors.success : Colors.gray500 }]}>
                  {item.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Text style={styles.staffZone}>{item.zone}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.ratingValue}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.activeTasks}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.maxTasks - item.activeTasks}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.workloadSection}>
          <Text style={styles.workloadLabel}>Workload Capacity</Text>
          <WorkloadBar current={item.activeTasks} max={item.maxTasks} />
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>Staff Management</Text>
        <Text style={styles.countLabel}>{staff.length} staff members</Text>
      </View>

      <FlatList
        data={sortedStaff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Ionicons name="people" size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{activeCount}/{staff.length}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Ionicons name="checkmark-done" size={20} color={Colors.success} />
              <Text style={styles.summaryValue}>{totalCompleted}</Text>
              <Text style={styles.summaryLabel}>Total Done</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Ionicons name="star" size={20} color={Colors.warning} />
              <Text style={styles.summaryValue}>{avgRating}</Text>
              <Text style={styles.summaryLabel}>Avg Rating</Text>
            </Card>
          </Animated.View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderStaffItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  summaryCard: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  summaryValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  summaryLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  staffCard: { marginHorizontal: 16 },
  staffHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  avatarInactive: { backgroundColor: Colors.gray100 },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.white },
  staffInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  staffName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  staffZone: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warning + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingValue: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.warning },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.gray200 },
  workloadSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  workloadLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
});
