import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useReports, WasteType, Report } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeWasteImage } from '@/lib/ai-pipeline';
import { analyzeWasteApi } from '@/lib/ai-api';
import ReportMapView from '@/components/ReportMapView';
import Colors from '@/constants/colors';
import { Alert } from 'react-native';

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
  const { addCredits, uid, userEmail, userName } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<WasteType | null>(null);
  const [address, setAddress] = useState('');
  const [locationDetails, setLocationDetails] = useState<{ name: string; area: string } | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Fetch location on mount
  React.useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const setLocationFromCoords = async (latitude: number, longitude: number) => {
    try {
      let addressResult: Location.LocationGeocodedAddress | null = null;
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        addressResult = results?.[0] ?? null;
      } catch (geocodeErr) {
        console.warn('Expo reverseGeocodeAsync failed (may be deprecated on this platform):', geocodeErr);
        // Fall through to Nominatim fallback
      }

      if (addressResult) {
        const street = addressResult.street || addressResult.name || '';
        const city = addressResult.city || addressResult.district || '';
        const region = addressResult.region || addressResult.subregion || '';

        const name = street || 'Waste site';
        const area = city || region || 'Local area';
        const fullAddress = [street, city, region].filter(Boolean).join(', ');

        setLocationDetails({ name, area });
        setAddress(fullAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setLocationCoords({ latitude, longitude });
        return { name, area, fullAddress, latitude, longitude };
      } else {
        try {
          // On web, proxy through our Express server (port 5000) to avoid Nominatim CORS blocks.
          // On native, call Nominatim directly (no CORS issue).
          let geocodeUrl: string;
          const geocodeHeaders: Record<string, string> = { 'Accept': 'application/json' };
          if (Platform.OS === 'web') {
            let serverBase = process.env.EXPO_PUBLIC_API_URL
              || process.env.EXPO_PUBLIC_DOMAIN
              || 'http://localhost:5000';
            // Ensure the URL has a protocol
            if (serverBase && !serverBase.startsWith('http://') && !serverBase.startsWith('https://')) {
              serverBase = `http://${serverBase}`;
            }
            geocodeUrl = `${serverBase}/api/geocode/reverse?lat=${latitude}&lon=${longitude}`;
          } else {
            geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            geocodeHeaders['User-Agent'] = 'CleanCity-App/1.0 (civic-waste-reporting)';
          }
          const nominatim = await fetch(geocodeUrl, { headers: geocodeHeaders });
          if (nominatim.ok) {
            const data: { display_name?: string; address?: { suburb?: string; city?: string; state?: string; village?: string } } = await nominatim.json();
            const name = data.address?.suburb || data.address?.village || 'Waste site';
            const area = data.address?.city || data.address?.state || 'Local area';
            const fullAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocationDetails({ name, area });
            setAddress(fullAddress);
            setLocationCoords({ latitude, longitude });
            return { name, area, fullAddress, latitude, longitude };
          }
        } catch {
          // fall through to coordinate fallback
        }

        const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocationDetails({ name: 'Waste site', area: 'Local area' });
        setAddress(fallbackAddress);
        setLocationCoords({ latitude, longitude });
        return {
          name: 'Waste site',
          area: 'Local area',
          fullAddress: fallbackAddress,
          latitude,
          longitude,
        };
      }
    } catch {
      const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setLocationDetails({ name: 'Waste site', area: 'Local area' });
      setAddress(fallbackAddress);
      setLocationCoords({ latitude, longitude });
      return {
        name: 'Waste site',
        area: 'Local area',
        fullAddress: fallbackAddress,
        latitude,
        longitude,
      };
    }
  };

  const fetchLocationFromIp = async () => {
    const providers = [
      async () => {
        const response = await fetch('https://ipinfo.io/json');
        if (!response.ok) return null;
        const data: { loc?: string } = await response.json();
        if (!data?.loc) return null;
        const [latStr, lngStr] = data.loc.split(',');
        return { latitude: Number(latStr), longitude: Number(lngStr) };
      },
      async () => {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) return null;
        const data: { latitude?: number; longitude?: number } = await response.json();
        if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return null;
        return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
      },
      async () => {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) return null;
        const data: { latitude?: number; longitude?: number; success?: boolean } = await response.json();
        if (data.success === false) return null;
        if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return null;
        return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
      },
    ];

    for (const provider of providers) {
      try {
        const coords = await provider();
        if (!coords) continue;
        if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) continue;
        return await setLocationFromCoords(coords.latitude, coords.longitude);
      } catch {
        continue;
      }
    }

    return null;
  };

  const fetchCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return await fetchLocationFromIp();
      }

      // Try last known position first for speed
      let location = await Location.getLastKnownPositionAsync({});

      // If none, get current position
      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
      }

      if (location) {
        const { latitude, longitude } = location.coords;
        return await setLocationFromCoords(latitude, longitude);
      }

      return await fetchLocationFromIp();
    } catch (error) {
      console.error('Error fetching location:', error);
      return await fetchLocationFromIp();
    } finally {
      setIsLocating(false);
    }
  };

  const autoFillFields = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      // Get current location first if not available
      let loc = locationDetails;
      if (!loc) {
        loc = await fetchCurrentLocation() || null;
      }

      // Use AI to analyze
      const analysis = await analyzeWasteImage({
        imageUri: uri,
        title: 'Initial Scan',
      });

      setSelectedType(analysis.wasteType);

      const typeLabel = WASTE_TYPES.find(t => t.type === analysis.wasteType)?.label || analysis.wasteType;
      const placeName = loc?.name || 'Current Location';
      const areaName = loc?.area || 'Nearby';
      const riskType = analysis.severityLevel.charAt(0).toUpperCase() + analysis.severityLevel.slice(1);

      // Requirement: Title is "type of the waste which is near to place name"
      setTitle(`${typeLabel} near ${placeName}`);

      // Requirement: Description says "type waste type loaction area name and risk type"
      setDescription(`${typeLabel} waste found at ${placeName}, ${areaName}. Risk level: ${riskType}`);

    } catch (error) {
      console.error('AI Auto-fill error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions!');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need gallery permissions!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      autoFillFields(uri);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'web') {
      handlePickImage(false); // Library for web
      return;
    }

    Alert.alert(
      'Select ImageSource',
      'Choose how you want to upload the waste report image',
      [
        { text: 'Take Photo', onPress: () => handlePickImage(true) },
        { text: 'Upload from Gallery', onPress: () => handlePickImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const canSubmit = title.trim() && selectedType && address.trim() && imageUri;

  // Removed dedicated handleTakePhoto to use showImagePickerOptions instead

  const uploadImage = async (uri: string, reportId: string) => {
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
    const storageRef = ref(storage, `reports/${reportId}.jpg`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType || !imageUri) return;
    if (!uid) {
      alert('Please sign in to submit a report.');
      return;
    }
    setIsSubmitting(true);

    try {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const reportId = Crypto.randomUUID();
      const imageUrl = await uploadImage(imageUri, reportId);

      const analysis = await analyzeWasteApi<Awaited<ReturnType<typeof analyzeWasteImage>>>({
        imageSource: imageUrl,
        title: title.trim(),
        description: description.trim(),
      }).catch(() => analyzeWasteImage({
        imageUri,
        title: title.trim(),
        description: description.trim(),
      }));

      if (!analysis.isWaste) {
        alert('AI check marked this as non-waste. Please capture a clearer image of civic waste.');
        setIsSubmitting(false);
        return;
      }

      let latitude = locationCoords?.latitude ?? 28.6139 + Math.random() * 0.01;
      let longitude = locationCoords?.longitude ?? 77.2090 + Math.random() * 0.01;

      if (!locationCoords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      }

      const credits = analysis.rewardCredits;

      const report: Omit<Report, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        reporterId: uid,
        reporterName: userName || 'Citizen',
        reporterEmail: userEmail || '',
        wasteType: selectedType || analysis.wasteType,
        status: 'pending',
        priority: analysis.recommendedPriority,
        latitude,
        longitude,
        address: address.trim(),
        createdAt: new Date().toISOString(),
        aiConfidence: analysis.confidence,
        creditsEarned: credits,
        isWaste: analysis.isWaste,
        severityScore: analysis.severityScore,
        detectedObjects: analysis.detectedObjects,
        modelTrace: analysis.modelTrace,
        beforeImage: imageUrl,
      };

      await addReport(report);
      await addCredits(credits);
      router.push({
        pathname: '/ai-verification',
        params: {
          confidence: analysis.confidence.toString(),
          credits: credits.toString(),
          wasteType: (selectedType || analysis.wasteType) as string,
          severity: analysis.severityLevel,
          severityScore: analysis.severityScore.toString(),
        },
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (Platform.OS === 'web' ? 100 : insets.bottom + 160) }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable onPress={showImagePickerOptions} style={[styles.photoArea, imageUri && styles.photoAreaActive]}>
            {imageUri ? (
              <View style={styles.photoTakenContent}>
                <Image source={{ uri: imageUri }} style={styles.cameraPreview} />
                <View style={styles.photoOverlay}>
                  <View style={styles.photoCheckCircle}>
                    <Ionicons name="checkmark" size={20} color={Colors.white} />
                  </View>
                  <Text style={styles.photoTakenText}>Photo captured</Text>
                  <View style={{ flex: 1 }} />
                  <Pressable onPress={showImagePickerOptions} style={styles.changeBtn}>
                    <Text style={styles.changeBtnText}>Change</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.cameraCircle}>
                  <Ionicons name="camera" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.photoText}>Add Waste Photo</Text>
                <Text style={styles.photoHint}>Take a picture or upload from device</Text>
              </>
            )}
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <Text style={styles.analyzingText}>AI is analyzing waste...</Text>
              </View>
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
          <View style={styles.labelRow}>
            <Text style={styles.label}>Location</Text>
            {isLocating && <Text style={styles.locatingText}>Locating...</Text>}
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={18} color={isLocating ? Colors.primary : Colors.gray400} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Detecting location..."
              placeholderTextColor={Colors.gray400}
              value={address}
              onChangeText={setAddress}
            />
            <Pressable onPress={fetchCurrentLocation} disabled={isLocating} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color={isLocating ? Colors.gray300 : Colors.primary} />
            </Pressable>
          </View>

          {locationCoords && (
            <Animated.View entering={FadeInDown.delay(400)} style={styles.mapContainer}>
              <ReportMapView
                markers={[
                  {
                    id: 'current-location',
                    latitude: locationCoords.latitude,
                    longitude: locationCoords.longitude,
                    title: 'Current Location',
                    description: address || 'Verified location',
                    color: Colors.primary,
                  },
                ]}
                userLocation={locationCoords}
                showUserRadius={false}
                initialRegion={{
                  latitude: locationCoords.latitude,
                  longitude: locationCoords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onMapPress={(coords) => {
                  setLocationFromCoords(coords.latitude, coords.longitude);
                }}
              />
              <View style={styles.mapOverlay}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={styles.mapOverlayText} numberOfLines={1}>
                  Verified Location
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: (Platform.OS === 'web' ? 94 : insets.bottom + 74) }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting || isAnalyzing}
          style={({ pressed }) => [
            styles.submitBtn,
            !canSubmit && styles.submitBtnDisabled,
            pressed && canSubmit && { opacity: 0.9, transform: [{ scale: 0.98 }] }
          ]}
        >
          <View style={styles.submitBtnInner}>
            <Text style={[styles.submitText, !canSubmit && { color: Colors.gray400 }]}>
              {isSubmitting ? 'Processing...' : isAnalyzing ? 'Analyzing AI...' : 'Submit Report'}
            </Text>
            {!isSubmitting && !isAnalyzing && <Ionicons name="chevron-forward" size={20} color={canSubmit ? Colors.white : Colors.gray400} />}
          </View>
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
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  photoArea: { backgroundColor: Colors.white, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.gray300, ...Colors.cardShadow },
  photoAreaActive: { borderStyle: 'solid', borderColor: Colors.success, backgroundColor: Colors.success + '08' },
  cameraCircle: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  photoHint: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray400, marginTop: 4 },
  photoTakenContent: { alignItems: 'center' },
  photoCheckCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
  photoTakenText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  changeBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changeBtnText: { color: Colors.white, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  photoSubtext: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  section: { marginTop: 20 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray700, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.gray200, paddingHorizontal: 14, gap: 8, height: 50 },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.gray900, flex: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200 },
  typeLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitBtnDisabled: { backgroundColor: Colors.gray200, shadowOpacity: 0 },
  submitText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.white },
  cameraPreview: { width: '100%', height: 220, borderRadius: 20 },
  photoOverlay: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 16, gap: 10 },
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  analyzingText: { marginTop: 10, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  locatingText: { fontSize: 12, color: Colors.primary, fontFamily: 'Inter_500Medium' },
  refreshBtn: { padding: 4 },
  mapContainer: {
    marginTop: 12,
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: Colors.primary + '20',
    padding: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapOverlayText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray800,
  },
  webMapPlaceholder: {
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  webMapText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.gray800,
  },
  webMapCoords: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray500,
  },
});
