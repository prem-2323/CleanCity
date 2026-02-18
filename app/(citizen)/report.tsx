import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Crypto from 'expo-crypto';
import { useReports, WasteType, Report } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const WASTE_TYPES: { type: WasteType; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
  { type: 'plastic', icon: 'water', label: 'Plastic', color: '#3B82F6' },
  { type: 'organic', icon: 'leaf', label: 'Organic', color: '#10B981' },
  { type: 'hazardous', icon: 'warning', label: 'Hazardous', color: '#EF4444' },
  { type: 'electronic', icon: 'hardware-chip', label: 'Electronic', color: '#8B5CF6' },
  { type: 'mixed', icon: 'layers', label: 'Mixed', color: '#F59E0B' },
];

export default function ReportWasteScreen() {
  const insets = useSafeAreaInsets();
  const { addReport } = useReports();
  const { addCredits } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [address, setAddress] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = title.trim() && selectedType && address.trim() && photoTaken;

  const handleTakePhoto = () => {
    setPhotoTaken(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType) return;
    setIsSubmitting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const confidence = Math.floor(Math.random() * 15) + 85;
    const credits = Math.floor(Math.random() * 30) + 15;
    const report: Report = {
      id: Crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      wasteType: selectedType,
      status: 'pending',
      priority: selectedType === 'hazardous' ? 'critical' : selectedType === 'electronic' ? 'high' : 'medium',
      latitude: 28.6139 + Math.random() * 0.01,
      longitude: 77.2090 + Math.random() * 0.01,
      address: address.trim(),
      createdAt: new Date().toISOString(),
      aiConfidence: confidence,
      creditsEarned: credits,
    };

    await addReport(report);
    await addCredits(credits);
    router.push({ pathname: '/ai-verification', params: { confidence: confidence.toString(), credits: credits.toString(), wasteType: selectedType } });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.gray800} />
        </Pressable>
        <Text style={styles.topTitle}>Report Waste</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 100 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable onPress={handleTakePhoto} style={[styles.photoArea, photoTaken && styles.photoAreaActive]}>
            {photoTaken ? (
              <View style={styles.photoTakenContent}>
                <View style={styles.photoCheckCircle}>
                  <Ionicons name="checkmark" size={28} color={Colors.white} />
                </View>
                <Text style={styles.photoTakenText}>Photo captured</Text>
                <Text style={styles.photoSubtext}>AI analysis ready</Text>
              </View>
            ) : (
              <>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.photoText}>Take a Photo</Text>
                <Text style={styles.photoHint}>Tap to capture waste image</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Brief description..." placeholderTextColor={Colors.gray400} value={title} onChangeText={setTitle} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
          <Text style={styles.label}>Description (optional)</Text>
          <View style={[styles.inputContainer, { height: 80 }]}>
            <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} placeholder="More details..." placeholderTextColor={Colors.gray400} value={description} onChangeText={setDescription} multiline />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.label}>Waste Type</Text>
          <View style={styles.typeGrid}>
            {WASTE_TYPES.map((wt) => (
              <Pressable
                key={wt.type}
                onPress={() => { setSelectedType(wt.type); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={[styles.typeCard, selectedType === wt.type && { borderColor: wt.color, backgroundColor: wt.color + '10' }]}
              >
                <Ionicons name={wt.icon} size={20} color={selectedType === wt.type ? wt.color : Colors.gray400} />
                <Text style={[styles.typeLabel, selectedType === wt.type && { color: wt.color }]}>{wt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={18} color={Colors.gray400} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Enter address..." placeholderTextColor={Colors.gray400} value={address} onChangeText={setAddress} />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 12 }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={({ pressed }) => [styles.submitBtn, !canSubmit && styles.submitBtnDisabled, pressed && canSubmit && { opacity: 0.9 }]}
        >
          <Text style={[styles.submitText, !canSubmit && { color: Colors.gray400 }]}>
            {isSubmitting ? 'Analyzing...' : 'Submit Report'}
          </Text>
          <Ionicons name="send" size={18} color={canSubmit ? Colors.white : Colors.gray400} />
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
  scrollContent: { padding: 20 },
  photoArea: { backgroundColor: Colors.white, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.gray300, ...Colors.cardShadow },
  photoAreaActive: { borderStyle: 'solid', borderColor: Colors.success, backgroundColor: Colors.success + '08' },
  cameraCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  photoHint: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray400, marginTop: 4 },
  photoTakenContent: { alignItems: 'center' },
  photoCheckCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoTakenText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.success },
  photoSubtext: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  section: { marginTop: 20 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray700, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.gray200, paddingHorizontal: 14, gap: 8, height: 50 },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.gray900, flex: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200 },
  typeLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  submitBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 16, gap: 8 },
  submitBtnDisabled: { backgroundColor: Colors.gray200 },
  submitText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: Colors.white },
});
