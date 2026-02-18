import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface AchievementBadgeProps {
  title: string;
  tier: BadgeTier;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
}

const TIER_COLORS: Record<BadgeTier, { bg: string; border: string; icon: string }> = {
  bronze: { bg: '#FEF3C7', border: '#D97706', icon: '#B45309' },
  silver: { bg: '#F1F5F9', border: '#94A3B8', icon: '#64748B' },
  gold: { bg: '#FEF9C3', border: '#EAB308', icon: '#CA8A04' },
  platinum: { bg: '#EDE9FE', border: '#8B5CF6', icon: '#7C3AED' },
};

export function AchievementBadge({ title, tier, icon, unlocked }: AchievementBadgeProps) {
  const colors = TIER_COLORS[tier];

  return (
    <View style={[styles.badge, { backgroundColor: unlocked ? colors.bg : Colors.gray100, borderColor: unlocked ? colors.border : Colors.gray300 }]}>
      <View style={[styles.iconCircle, { backgroundColor: unlocked ? colors.border + '20' : Colors.gray200 }]}>
        <Ionicons name={unlocked ? icon : 'lock-closed'} size={20} color={unlocked ? colors.icon : Colors.gray400} />
      </View>
      <Text style={[styles.title, { color: unlocked ? Colors.gray800 : Colors.gray400 }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.tier, { color: unlocked ? colors.border : Colors.gray400 }]}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { width: 100, alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1.5, gap: 6 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 11, fontWeight: '600' as const, textAlign: 'center' },
  tier: { fontSize: 10, fontWeight: '500' as const },
});
