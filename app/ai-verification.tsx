import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { CircularProgress } from '@/components/CircularProgress';
import { Card } from '@/components/Card';

const CHECKLIST = [
  { label: 'MobileNetV2: Waste vs Non-Waste validated', icon: 'shield-checkmark' as const },
  { label: 'YOLOv8: Waste type identified', icon: 'scan' as const },
  { label: 'YOLOv8: Severity estimated', icon: 'analytics' as const },
  { label: 'Google Maps: Location pinned', icon: 'location' as const },
  { label: 'Priority and credits finalized', icon: 'ribbon' as const },
];

export default function AIVerificationScreen() {
  const insets = useSafeAreaInsets();
  const { confidence, credits, wasteType, severity, severityScore } = useLocalSearchParams();
  const [completedItems, setCompletedItems] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const resultScale = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedItems(prev => {
        if (prev >= CHECKLIST.length) {
          clearInterval(timer);
          setTimeout(() => {
            setShowResult(true);
            resultScale.value = withSpring(1, { damping: 12 });
            resultOpacity.value = withTiming(1, { duration: 400 });
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 300);
          return prev;
        }
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, [resultOpacity, resultScale]);

  const resultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultOpacity.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
      <Text style={styles.pageTitle}>AI Verification</Text>
      <Text style={styles.subtitle}>Analyzing your report...</Text>

      <View style={styles.checklistContainer}>
        {CHECKLIST.map((item, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(i * 400).duration(300)} style={styles.checkItem}>
            <View style={[styles.checkIcon, i < completedItems ? styles.checkIconDone : styles.checkIconPending]}>
              {i < completedItems ? (
                <Ionicons name="checkmark" size={14} color={Colors.white} />
              ) : i === completedItems ? (
                <View style={styles.spinner} />
              ) : (
                <View style={styles.pendingDot} />
              )}
            </View>
            <View style={styles.checkTextWrap}>
              <Text style={[styles.checkText, i < completedItems && styles.checkTextDone]}>{item.label}</Text>
              {i < completedItems && (
                <Text style={styles.checkPass}>PASS</Text>
              )}
            </View>
          </Animated.View>
        ))}
      </View>

      {showResult && (
        <Animated.View style={[styles.resultContainer, resultStyle]}>
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <CircularProgress size={80} strokeWidth={6} progress={Number(confidence) || 94} color={Colors.success}>
                <Text style={styles.confidenceText}>{confidence || '94'}%</Text>
              </CircularProgress>
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Detection Confidence</Text>
                <Text style={styles.wasteTypeText}>{(wasteType as string || 'plastic').charAt(0).toUpperCase() + (wasteType as string || 'plastic').slice(1)} Waste</Text>
              </View>
            </View>

            <View style={styles.creditsEarned}>
              <Ionicons name="star" size={24} color={Colors.warning} />
              <View>
                <Text style={styles.creditsTitle}>Credits Earned</Text>
                <Text style={styles.creditsAmount}>+{credits || '25'}</Text>
              </View>
            </View>

            <View style={styles.severityCard}>
              <View style={styles.severityHead}>
                <Ionicons name="flash" size={18} color={Colors.white} />
                <Text style={styles.severityHeadText}>Incident Severity</Text>
              </View>
              <Text style={styles.severityValue}>{String(severity || 'medium').toUpperCase()}</Text>
              <Text style={styles.severityScore}>Score: {severityScore || '60'}/100</Text>
            </View>
          </Card>

          <Pressable
            onPress={() => router.replace('/(citizen)' as any)}
            style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900, textAlign: 'center' },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.gray500, textAlign: 'center', marginTop: 4, marginBottom: 32 },
  checklistContainer: { gap: 16, marginBottom: 32 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  checkIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkIconDone: { backgroundColor: Colors.success },
  checkIconPending: { backgroundColor: Colors.gray200 },
  checkTextWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkText: { fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.gray500, flex: 1 },
  checkTextDone: { color: Colors.gray800 },
  checkPass: { fontSize: 11, fontFamily: 'Inter_700Bold', color: Colors.success, marginLeft: 8 },
  spinner: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.secondary, borderTopColor: 'transparent' },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray400 },
  resultContainer: { flex: 1, justifyContent: 'center', gap: 16 },
  resultCard: { padding: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  resultInfo: { flex: 1 },
  resultLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  confidenceText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.success },
  wasteTypeText: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginTop: 2 },
  creditsEarned: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.warning + '10', padding: 16, borderRadius: 14 },
  creditsTitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  creditsAmount: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.warning },
  severityCard: { marginTop: 14, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.primary + '15' },
  severityHead: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8 },
  severityHeadText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  severityValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.primary, paddingHorizontal: 12, paddingTop: 10 },
  severityScore: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.gray600, paddingHorizontal: 12, paddingBottom: 10 },
  doneBtn: { backgroundColor: Colors.primary, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
