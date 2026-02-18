import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
      <Text style={[wlStyles.label, { color }]}>{current}/{max}</Text>
    </View>
  );
}

const wlStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  track: { flex: 1, height: 6, backgroundColor: Colors.gray200, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', minWidth: 28, textAlign: 'right' },
});

export default function AssignStaffScreen() {
  const insets = useSafeAreaInsets();
  const { reportId } = useLocalSearchParams();
  const { staff, updateReport, getBestAvailableStaff } = useReports();
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedStaff || !reportId) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateReport(reportId as string, { status: 'assigned', assignedTo: selectedStaff });
    router.back();
  };

  const handleAutoAssign = async () => {
    const best = getBestAvailableStaff();
    if (!best || !reportId) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedStaff(best.id);
    await updateReport(reportId as string, { status: 'assigned', assignedTo: best.id });
    router.back();
  };

  const renderStaffItem = ({ item }: { item: StaffMember }) => (
    <Card
      onPress={() => { setSelectedStaff(item.id); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      style={selectedStaff === item.id ? styles.selectedCard : undefined}
    >
      <View style={styles.staffRow}>
        <View style={[styles.avatar, !item.active && { opacity: 0.5 }]}>
          <Ionicons name="person" size={22} color={Colors.primary} />
          {item.active && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.staffInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.staffName}>{item.name}</Text>
            {!item.active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Offline</Text>
              </View>
            )}
          </View>
          <Text style={styles.staffMeta}>{item.zone} - {item.tasksCompleted} completed</Text>
          <WorkloadBar current={item.activeTasks} max={item.maxTasks} />
        </View>
        <View style={styles.staffStats}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={Colors.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        {selectedStaff === item.id && (
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.topTitle}>Assign Staff</Text>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.autoAssignRow}>
        <Pressable onPress={handleAutoAssign} style={({ pressed }) => [styles.autoAssignBtn, pressed && { opacity: 0.9 }]}>
          <Ionicons name="flash" size={18} color={Colors.white} />
          <Text style={styles.autoAssignText}>Auto Assign Best Available</Text>
        </Pressable>
        <Text style={styles.autoAssignHint}>Picks lowest workload + highest rated staff</Text>
      </Animated.View>

      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderStaffItem}
      />

      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 12 }]}>
        <Pressable
          onPress={handleAssign}
          disabled={!selectedStaff}
          style={({ pressed }) => [styles.assignBtn, !selectedStaff && styles.assignBtnDisabled, pressed && !!selectedStaff && { opacity: 0.9 }]}
        >
          <Text style={[styles.assignBtnText, !selectedStaff && { color: Colors.gray400 }]}>Confirm Assignment</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  autoAssignRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  autoAssignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, height: 48, borderRadius: 14 },
  autoAssignText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  autoAssignHint: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray400, textAlign: 'center', marginTop: 6 },
  selectedCard: { borderWidth: 2, borderColor: Colors.primary },
  staffRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  staffInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  staffName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  inactiveBadge: { backgroundColor: Colors.gray200, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  inactiveText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
  staffMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  staffStats: { alignItems: 'flex-end', gap: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.gray700 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  assignBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  assignBtnDisabled: { backgroundColor: Colors.gray200 },
  assignBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
