import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { CircularProgress } from '@/components/CircularProgress';
import { Card } from '@/components/Card';

const CHECKLIST = [
  { label: 'Siamese Network: Before vs After compared', icon: 'git-compare' as const },
  { label: 'YOLOv8: Residual waste scanned', icon: 'scan' as const },
  { label: 'Cleanup score calculated', icon: 'analytics' as const },
  { label: 'Verification threshold checked', icon: 'shield-checkmark' as const },
  { label: 'Credits and rewards finalized', icon: 'ribbon' as const },
];

export default function CleanupVerificationScreen() {
  const insets = useSafeAreaInsets();
  const {
    cleanupScore,
    similarityScore,
    rewardCredits,
    verified,
    residualDetections,
    taskTitle,
  } = useLocalSearchParams();

  const [completedItems, setCompletedItems] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const resultScale = useSharedValue(0);
  const resultOpacity = useSharedValue(0);

  const isVerified = verified === 'true';
  const score = Number(cleanupScore) || 0;
  const similarity = Number(similarityScore) || 0;
  const credits = Number(rewardCredits) || 0;
  const residual = Number(residualDetections) || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedItems(prev => {
        if (prev >= CHECKLIST.length) {
          clearInterval(timer);
          setTimeout(() => {
            setShowResult(true);
            resultScale.value = withSpring(1, { damping: 12 });
            resultOpacity.value = withTiming(1, { duration: 400 });
            if (Platform.OS !== 'web') Haptics.notificationAsync(
              isVerified
                ? Haptics.NotificationFeedbackType.Success
                : Haptics.NotificationFeedbackType.Warning
            );
          }, 300);
          return prev;
        }
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, [resultOpacity, resultScale, isVerified]);

  const resultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultOpacity.value,
  }));

  const statusColor = isVerified ? Colors.success : Colors.secondary;
  const statusIcon = isVerified ? 'checkmark-circle' : 'alert-circle';
  const statusText = isVerified ? 'Cleanup Verified!' : 'Verification Failed';

  return (
    <View style={[styles.container, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
      <Text style={styles.pageTitle}>Cleanup Verification</Text>
      <Text style={styles.subtitle}>
        {showResult
          ? (isVerified ? 'Area has been cleaned successfully' : 'Residual waste detected')
          : 'Analyzing cleanup quality...'}
      </Text>

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
            {/* Status header */}
            <View style={[styles.statusBanner, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name={statusIcon} size={28} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>

            {/* Cleanup score circular */}
            <View style={styles.resultHeader}>
              <CircularProgress size={90} strokeWidth={7} progress={score} color={statusColor}>
                <Text style={[styles.scoreText, { color: statusColor }]}>{score}%</Text>
              </CircularProgress>
              <View style={styles.resultInfo}>
                <Text style={styles.resultLabel}>Cleanup Score</Text>
                {taskTitle ? (
                  <Text style={styles.taskTitleText} numberOfLines={2}>{taskTitle}</Text>
                ) : null}
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{similarity}%</Text>
                <Text style={styles.statLabel}>Similarity</Text>
              </View>
              <View style={[styles.statItem, styles.statDivider]}>
                <Text style={styles.statValue}>{residual}</Text>
                <Text style={styles.statLabel}>Residual Objects</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: isVerified ? Colors.success : Colors.secondary }]}>
                  {isVerified ? 'PASS' : 'FAIL'}
                </Text>
                <Text style={styles.statLabel}>Result</Text>
              </View>
            </View>

            {/* Credits earned */}
            <View style={[styles.creditsEarned, { backgroundColor: (isVerified ? Colors.warning : Colors.gray400) + '10' }]}>
              <Ionicons name="star" size={24} color={isVerified ? Colors.warning : Colors.gray400} />
              <View>
                <Text style={styles.creditsTitle}>{isVerified ? 'Credits Earned' : 'Partial Credits'}</Text>
                <Text style={[styles.creditsAmount, { color: isVerified ? Colors.warning : Colors.gray500 }]}>+{credits}</Text>
              </View>
            </View>

            {/* Model trace */}
            <View style={styles.traceCard}>
              <View style={styles.traceHead}>
                <Ionicons name="hardware-chip" size={16} color={Colors.white} />
                <Text style={styles.traceHeadText}>AI Pipeline</Text>
              </View>
              <View style={styles.traceBody}>
                <View style={styles.traceItem}>
                  <Ionicons name="git-compare-outline" size={14} color={Colors.primary} />
                  <Text style={styles.traceText}>Siamese Network (MobileNetV2)</Text>
                </View>
                <View style={styles.traceItem}>
                  <Ionicons name="scan-outline" size={14} color={Colors.primary} />
                  <Text style={styles.traceText}>YOLOv8 Residual Detection</Text>
                </View>
              </View>
            </View>
          </Card>

          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                // Go back twice to skip the task-detail page
                setTimeout(() => {
                  if (router.canGoBack()) router.back();
                }, 100);
              } else {
                router.replace('/(cleaner)/tasks' as any);
              }
            }}
            style={({ pressed }) => [
              styles.doneBtn,
              { backgroundColor: statusColor },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.doneBtnText}>Back to Tasks</Text>
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

  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, marginBottom: 16 },
  statusText: { fontSize: 18, fontFamily: 'Inter_700Bold' },

  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  resultInfo: { flex: 1 },
  resultLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  scoreText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  taskTitleText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginTop: 4 },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.gray100, borderRadius: 14, padding: 14, marginBottom: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.gray200 },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },

  creditsEarned: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14 },
  creditsTitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  creditsAmount: { fontSize: 24, fontFamily: 'Inter_700Bold' },

  traceCard: { marginTop: 14, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.primary + '15' },
  traceHead: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8 },
  traceHeadText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  traceBody: { padding: 12, gap: 8 },
  traceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  traceText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray700 },

  doneBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
