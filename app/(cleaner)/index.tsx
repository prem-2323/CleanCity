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
import { CircularProgress } from '@/components/CircularProgress';
import Colors from '@/constants/colors';

export default function CleanerDashboard() {
  const insets = useSafeAreaInsets();
  const { userName, userCredits } = useAuth();
  const { reports } = useReports();
  const assignedTasks = reports.filter(r => r.status === 'assigned' || r.status === 'in_progress');
  const completedTasks = reports.filter(r => r.status === 'resolved');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#1D4ED8']} style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.userName}>{userName || 'Cleaner'}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="star" size={16} color={Colors.warning} />
            <Text style={styles.headerBadgeText}>4.8</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsGrid}>
          {[
            { value: assignedTasks.length.toString(), label: 'Active Tasks', icon: 'construct' as const, color: Colors.secondary },
            { value: completedTasks.length.toString(), label: 'Completed', icon: 'checkmark-circle' as const, color: Colors.success },
            { value: userCredits.toString(), label: 'Credits', icon: 'star' as const, color: Colors.warning },
            { value: '4.8', label: 'Rating', icon: 'heart' as const, color: Colors.danger },
          ].map((stat, i) => (
            <Card key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={styles.performanceCard}>
            <Text style={styles.perfTitle}>Weekly Performance</Text>
            <View style={styles.perfRow}>
              <CircularProgress size={70} strokeWidth={5} progress={82}>
                <Text style={styles.perfPercent}>82%</Text>
              </CircularProgress>
              <View style={styles.perfStats}>
                <View style={styles.perfStatRow}>
                  <View style={[styles.perfDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.perfStatText}>On-time: 14 tasks</Text>
                </View>
                <View style={styles.perfStatRow}>
                  <View style={[styles.perfDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.perfStatText}>Delayed: 3 tasks</Text>
                </View>
                <View style={styles.perfStatRow}>
                  <View style={[styles.perfDot, { backgroundColor: Colors.gray300 }]} />
                  <Text style={styles.perfStatText}>Pending: {assignedTasks.length} tasks</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assigned Tasks</Text>
            <Pressable onPress={() => router.push('/(cleaner)/tasks' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {assignedTasks.slice(0, 3).map((task) => (
            <Card key={task.id} style={styles.taskCard} onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id } })}>
              <View style={styles.taskRow}>
                <View style={[styles.priorityBar, { backgroundColor: task.priority === 'critical' ? Colors.danger : task.priority === 'high' ? Colors.warning : Colors.secondary }]} />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.taskAddress} numberOfLines={1}>{task.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
              </View>
            </Card>
          ))}
          {assignedTasks.length === 0 && (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkmark-done-outline" size={32} color={Colors.gray300} />
              <Text style={styles.emptyText}>No pending tasks</Text>
            </Card>
          )}
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
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  headerBadgeText: { fontSize: 14, color: Colors.white, fontFamily: 'Inter_600SemiBold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%' as any, alignItems: 'center', paddingVertical: 18 },
  statIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  performanceCard: { marginBottom: 20 },
  perfTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 16 },
  perfRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  perfPercent: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.primary },
  perfStats: { flex: 1, gap: 8 },
  perfStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perfDot: { width: 8, height: 8, borderRadius: 4 },
  perfStatText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray600 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  seeAll: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.secondary },
  taskCard: { marginBottom: 10 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priorityBar: { width: 4, height: 40, borderRadius: 2 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  taskAddress: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  emptyCard: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
});
