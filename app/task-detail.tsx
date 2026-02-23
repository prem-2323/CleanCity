import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as Crypto from 'expo-crypto';
import { useReports, Report } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';
import { db, storage } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { verifyCleanup } from '@/lib/ai-pipeline';
import { verifyCleanupApi } from '@/lib/ai-api';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { updateReport } = useReports();
  const { addCredits } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [afterImageUri, setAfterImageUri] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setIsLoading(false);
      return;
    }

    const reportRef = doc(db, 'reports', id);
    const unsubscribe = onSnapshot(reportRef, (snapshot) => {
      if (!snapshot.exists()) {
        setReport(null);
        setIsLoading(false);
        return;
      }

      setReport({
        id: snapshot.id,
        ...snapshot.data(),
      } as Report);
      setIsLoading(false);
    }, () => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Arrived at location', done: false },
    { id: '2', label: 'Assessed waste type', done: false },
    { id: '3', label: 'Cleaned area', done: false },
    { id: '4', label: 'Took after photo', done: false },
  ]);

  const allDone = checklist.every(c => c.done) && !!afterImageUri;

  const toggleItem = (itemId: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecklist(prev => prev.map(c => c.id === itemId ? { ...c, done: !c.done } : c));

    // Mark report as in_progress when cleaner starts checklist
    if (report && report.status === 'assigned') {
      updateReport(report.id, { status: 'in_progress' }).catch(() => {});
    }
  };

  const handleTakeAfterPhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      alert('Camera access is required to verify cleanup.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAfterImageUri(result.assets[0].uri);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleNavigate = async () => {
    if (!report) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`;
    await Linking.openURL(url);
  };

  const uploadAfterImage = async (uri: string, reportId: string) => {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to process image on web'));
        reader.readAsDataURL(blob);
      });

      return dataUrl;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `reports/${reportId}-after.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleComplete = async () => {
    if (!report || !afterImageUri) return;
    setIsCompleting(true);

    try {
      const afterImageUrl = await uploadAfterImage(afterImageUri, report.id || Crypto.randomUUID());

      const verification = await verifyCleanupApi<Awaited<ReturnType<typeof verifyCleanup>>>({
        beforeImageSource: report.beforeImage,
        afterImageSource: afterImageUrl,
        severityScore: report.severityScore || 60,
      }).catch(() => verifyCleanup({
        beforeImageUri: report.beforeImage,
        afterImageUri,
        wasteType: report.wasteType,
        severityScore: report.severityScore || 60,
      }));

      if (!verification.verified) {
        alert(`Cleanup verification failed (${verification.cleanupScore}%). Please recapture and clean remaining waste.`);
        return;
      }

      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await updateReport(report.id, {
        status: 'resolved',
        afterImage: afterImageUrl,
        cleanupVerification: {
          verified: verification.verified,
          similarityScore: verification.similarityScore,
          cleanupScore: verification.cleanupScore,
          checkedAt: new Date().toISOString(),
        },
        modelTrace: [...(report.modelTrace || []), ...verification.modelTrace],
      });

      // Decrement staff activeTasks and increment tasksCompleted
      if (report.assignedTo) {
        try {
          const staffRef = doc(db, 'staff', report.assignedTo);
          await updateDoc(staffRef, {
            activeTasks: increment(-1),
            tasksCompleted: increment(1),
          });
        } catch (staffErr) {
          console.warn('Could not update staff stats:', staffErr);
        }
      }

      await addCredits(verification.rewardCredits);
      router.back();
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading task...</Text>
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={[styles.container, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.topTitle}>Task Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}>
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <PriorityBadge priority={report.priority} />
            <StatusBadge status={report.status} />
          </View>
          <Text style={styles.taskTitle}>{report.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.address}>{report.address}</Text>
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Before Photo</Text>
          <View style={styles.photoPlaceholder}>
            {report.beforeImage ? (
              <Image source={{ uri: report.beforeImage }} style={styles.reportImage} />
            ) : (
              <>
                <Ionicons name="image-outline" size={40} color={Colors.gray300} />
                <Text style={styles.photoLabel}>Reported waste image</Text>
              </>
            )}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>After Cleanup Photo</Text>
          {afterImageUri ? (
            <Image source={{ uri: afterImageUri }} style={styles.afterImage} />
          ) : (
            <Pressable onPress={handleTakeAfterPhoto} style={styles.photoCapture}>
              <Ionicons name="camera" size={22} color={Colors.primary} />
              <Text style={styles.photoCaptureText}>Capture after photo</Text>
            </Pressable>
          )}
          {afterImageUri && (
            <Pressable onPress={handleTakeAfterPhoto} style={styles.retakeBtn}>
              <Ionicons name="refresh" size={14} color={Colors.secondary} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Cleanup Checklist</Text>
          {checklist.map((item) => (
            <Pressable key={item.id} style={styles.checkItem} onPress={() => toggleItem(item.id)}>
              <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                {item.done && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <Text style={[styles.checkLabel, item.done && styles.checkLabelDone]}>{item.label}</Text>
            </Pressable>
          ))}
        </Card>

        <Pressable
          onPress={handleNavigate}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.9 }]}
        >
          <Ionicons name="navigate" size={18} color={Colors.white} />
          <Text style={styles.navBtnText}>Navigate to Location</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 12 }]}>
        <Pressable
          onPress={handleComplete}
          disabled={!allDone || isCompleting}
          style={({ pressed }) => [styles.completeBtn, (!allDone || isCompleting) && styles.completeBtnDisabled, pressed && allDone && !isCompleting && { opacity: 0.9 }]}
        >
          <Ionicons name="checkmark-circle" size={20} color={allDone ? Colors.white : Colors.gray400} />
          <Text style={[styles.completeBtnText, !allDone && { color: Colors.gray400 }]}>{isCompleting ? 'Verifying...' : 'Mark as Complete'}</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  headerCard: { marginBottom: 12 },
  headerTop: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  taskTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray600, flex: 1 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 12 },
  photoPlaceholder: { height: 150, borderRadius: 14, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoCapture: { height: 130, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.lightBlue },
  photoCaptureText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  retakeBtn: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.lightBlue },
  retakeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.secondary },
  reportImage: { width: '100%', height: '100%', borderRadius: 14 },
  afterImage: { width: '100%', height: 170, borderRadius: 14 },
  photoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkLabel: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray800 },
  checkLabelDone: { textDecorationLine: 'line-through', color: Colors.gray400 },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.secondary, height: 48, borderRadius: 14, marginTop: 4 },
  navBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, height: 52, borderRadius: 16 },
  completeBtnDisabled: { backgroundColor: Colors.gray200 },
  completeBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
});
