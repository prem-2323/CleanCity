import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

const EARN_ITEMS = [
  { icon: 'camera' as const, title: 'Report Waste', credits: '15-50', desc: 'Earn credits per verified report' },
  { icon: 'star' as const, title: 'Daily Check-in', credits: '5', desc: 'Log in daily for bonus credits' },
  { icon: 'people' as const, title: 'Refer a Friend', credits: '100', desc: 'Invite friends to join CleanMap' },
  { icon: 'trophy' as const, title: 'Streak Bonus', credits: '25', desc: '7-day reporting streak reward' },
];

const REDEEM_ITEMS = [
  { icon: 'cart' as const, title: 'Shopping Voucher', credits: 200, desc: 'Online shopping discount' },
  { icon: 'bus' as const, title: 'Transit Pass', credits: 150, desc: 'Monthly bus/metro credit' },
  { icon: 'restaurant' as const, title: 'Meal Voucher', credits: 100, desc: 'Restaurant dining credit' },
  { icon: 'leaf' as const, title: 'Plant a Tree', credits: 50, desc: 'Sponsor a tree planting' },
];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { userCredits } = useAuth();
  const [activeTab, setActiveTab] = useState<'earn' | 'redeem'>('earn');

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.topTitle}>Rewards</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.creditsHeader}>
        <View style={styles.creditsBox}>
          <Ionicons name="diamond" size={24} color={Colors.warning} />
          <View>
            <Text style={styles.creditsValue}>{userCredits}</Text>
            <Text style={styles.creditsLabel}>Available Credits</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {(['earn', 'redeem'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => { setActiveTab(tab); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'earn' ? 'Earn' : 'Redeem'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
        {activeTab === 'earn' ? (
          EARN_ITEMS.map((item, i) => (
            <Card key={i} style={styles.rewardCard}>
              <View style={styles.rewardRow}>
                <View style={[styles.rewardIcon, { backgroundColor: Colors.success + '15' }]}>
                  <Ionicons name={item.icon} size={22} color={Colors.success} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{item.title}</Text>
                  <Text style={styles.rewardDesc}>{item.desc}</Text>
                </View>
                <View style={styles.creditsBadge}>
                  <Text style={styles.creditsText}>+{item.credits}</Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          REDEEM_ITEMS.map((item, i) => (
            <Card key={i} style={styles.rewardCard}>
              <View style={styles.rewardRow}>
                <View style={[styles.rewardIcon, { backgroundColor: Colors.primary + '15' }]}>
                  <Ionicons name={item.icon} size={22} color={Colors.primary} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{item.title}</Text>
                  <Text style={styles.rewardDesc}>{item.desc}</Text>
                </View>
                <Pressable
                  style={[styles.redeemBtn, userCredits < item.credits && styles.redeemBtnDisabled]}
                  disabled={userCredits < item.credits}
                >
                  <Text style={[styles.redeemText, userCredits < item.credits && { color: Colors.gray400 }]}>{item.credits}</Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  creditsHeader: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.white },
  creditsBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.warning + '10', padding: 16, borderRadius: 16 },
  creditsValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  creditsLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.gray100 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
  tabTextActive: { color: Colors.white },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },
  rewardCard: { marginBottom: 10 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  rewardDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  creditsBadge: { backgroundColor: Colors.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  creditsText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: Colors.success },
  redeemBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  redeemBtnDisabled: { backgroundColor: Colors.gray200 },
  redeemText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.white },
});
