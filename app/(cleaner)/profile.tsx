import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress } from '@/components/CircularProgress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

export default function CleanerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName, userCredits, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12, paddingBottom: 120 }]}>
      <View style={styles.profileHeader}>
        <CircularProgress size={100} strokeWidth={5} progress={88}>
          <View style={styles.avatarCircle}>
            <Ionicons name="construct" size={36} color={Colors.primary} />
          </View>
        </CircularProgress>
        <Text style={styles.nameText}>{userName || 'Cleaner'}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color={Colors.warning} />
          <Text style={styles.ratingText}>4.8 Rating</Text>
        </View>
      </View>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          {[
            { value: '142', label: 'Tasks Done' },
            { value: userCredits.toString(), label: 'Credits' },
            { value: '3', label: 'Active' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
        <AchievementBadge title="Speed Star" tier="gold" icon="flash" unlocked={true} />
        <AchievementBadge title="Top Cleaner" tier="silver" icon="ribbon" unlocked={true} />
        <AchievementBadge title="Eco Master" tier="platinum" icon="earth" unlocked={false} />
      </ScrollView>

      <View style={styles.menuSection}>
        <Pressable style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.8 }]} onPress={() => router.push('/rewards' as any)}>
          <Ionicons name="gift-outline" size={20} color={Colors.primary} />
          <Text style={styles.menuLabel}>Rewards</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
        </Pressable>
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
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray600 },
  statsCard: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.primary },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 12 },
  menuSection: { marginTop: 24, gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, ...Colors.cardShadow },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.gray800 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.danger + '30', backgroundColor: Colors.danger + '08' },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.danger },
});
