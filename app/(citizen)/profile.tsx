import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import { CircularProgress } from '@/components/CircularProgress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName, userRole, userCredits, logout } = useAuth();
  const { reports } = useReports();
  const profileComplete = 75;

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const badges = [
    { title: 'First Report', tier: 'bronze' as const, icon: 'flag' as const, unlocked: true },
    { title: 'Eco Warrior', tier: 'silver' as const, icon: 'leaf' as const, unlocked: true },
    { title: 'City Hero', tier: 'gold' as const, icon: 'trophy' as const, unlocked: false },
    { title: 'Legend', tier: 'platinum' as const, icon: 'star' as const, unlocked: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12, paddingBottom: 120 }]}>
      <View style={styles.profileHeader}>
        <CircularProgress size={100} strokeWidth={5} progress={profileComplete}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={Colors.primary} />
          </View>
        </CircularProgress>
        <Text style={styles.nameText}>{userName || 'User'}</Text>
        <Text style={styles.roleText}>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ''}</Text>
        <View style={styles.levelBadge}>
          <Ionicons name="diamond" size={14} color={Colors.warning} />
          <Text style={styles.levelText}>Level 3</Text>
        </View>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          {[
            { value: reports.length.toString(), label: 'Reports', icon: 'document-text' as const },
            { value: userCredits.toString(), label: 'Credits', icon: 'star' as const },
            { value: '2', label: 'Badges', icon: 'medal' as const },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Ionicons name={stat.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingBottom: 4 }}>
        {badges.map((badge, i) => (
          <AchievementBadge key={i} {...badge} />
        ))}
      </ScrollView>

      <View style={styles.menuSection}>
        {[
          { icon: 'gift-outline' as const, label: 'Rewards', route: '/rewards' },
          { icon: 'settings-outline' as const, label: 'Settings', route: null },
          { icon: 'help-circle-outline' as const, label: 'Help & Support', route: null },
        ].map((item, i) => (
          <Pressable key={i} style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.8 }]} onPress={() => item.route && router.push(item.route as any)}>
            <View style={styles.menuIconBg}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  nameText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginTop: 12 },
  roleText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.warning + '15', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  levelText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.warning },
  statsCard: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 12 },
  menuSection: { marginTop: 24, gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 14, gap: 12, ...Colors.cardShadow },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.gray800 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.danger + '30', backgroundColor: Colors.danger + '08' },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.danger },
});
