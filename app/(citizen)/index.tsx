import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card } from '@/components/Card';
import { CircularProgress } from '@/components/CircularProgress';
import { MiniTrendChart } from '@/components/MiniTrendChart';
import Colors from '@/constants/colors';

export default function CitizenDashboard() {
  const insets = useSafeAreaInsets();
  const { userName, userCredits } = useAuth();
  const { reports } = useReports();
  const myReports = reports.filter(r => r.creditsEarned > 0);
  const progress = Math.min((userCredits / 500) * 100, 100);

  const quickActions = [
    { icon: 'camera' as const, label: 'Report', color: Colors.primary, route: '/(citizen)/report' },
    { icon: 'list' as const, label: 'My Reports', color: Colors.secondary, route: '/(citizen)/reports' },
    { icon: 'map' as const, label: 'Map', color: Colors.success, route: '/(citizen)/map' },
    { icon: 'gift' as const, label: 'Rewards', color: Colors.warning, route: '/rewards' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#2563EB']} style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{userName || 'Citizen'}</Text>
          </View>
          <Pressable style={styles.notifButton} onPress={() => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.creditsCard}>
          <View style={styles.creditsLeft}>
            <Text style={styles.creditsLabel}>Your Credits</Text>
            <Text style={styles.creditsValue}>{userCredits}</Text>
            <MiniTrendChart data={[20, 45, 35, 80, 95, 120, 150]} width={70} height={28} color={Colors.success} label="+12%" trending="up" />
          </View>
          <CircularProgress size={80} strokeWidth={6} progress={progress}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            <Text style={styles.progressLabel}>to reward</Text>
          </CircularProgress>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as any);
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {myReports.slice(0, 3).map((report, i) => (
            <Card key={report.id} style={styles.activityCard} onPress={() => router.push({ pathname: '/report-detail', params: { id: report.id } })}>
              <View style={styles.activityRow}>
                <View style={[styles.wasteIcon, { backgroundColor: Colors.lightBlue }]}>
                  <Ionicons name="trash" size={18} color={Colors.primary} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle} numberOfLines={1}>{report.title}</Text>
                  <Text style={styles.activityAddress} numberOfLines={1}>{report.address}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: report.status === 'resolved' ? Colors.success : report.status === 'pending' ? Colors.warning : Colors.secondary }]} />
              </View>
            </Card>
          ))}
          {myReports.length === 0 && (
            <Card style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={32} color={Colors.gray300} />
              <Text style={styles.emptyText}>No reports yet. Start by reporting waste!</Text>
            </Card>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Impact</Text>
            <View style={styles.statsRow}>
              {[
                { value: myReports.length.toString(), label: 'Reports' },
                { value: `${userCredits}`, label: 'Credits' },
                { value: '2', label: 'Badges' },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.92 }] }]}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(citizen)/report' as any);
        }}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular' },
  userName: { fontSize: 22, color: Colors.white, fontFamily: 'Inter_700Bold' },
  notifButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  creditsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20 },
  creditsLeft: { gap: 4 },
  creditsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium' },
  creditsValue: { fontSize: 36, color: Colors.white, fontFamily: 'Inter_700Bold' },
  progressText: { fontSize: 16, color: Colors.white, fontFamily: 'Inter_700Bold' },
  progressLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400Regular' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionCard: { width: '47%' as any, backgroundColor: Colors.white, borderRadius: 16, padding: 16, ...Colors.cardShadow },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  activityCard: { marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wasteIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  activityAddress: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray400, textAlign: 'center' },
  statsCard: { marginTop: 14, marginBottom: 8 },
  statsTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.primary },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Colors.cardShadow, shadowOpacity: 0.2 },
});
