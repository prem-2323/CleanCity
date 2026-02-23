import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useReports, ReportStatus } from '@/contexts/ReportsContext';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import ReportMapView, { MapLegend, MapMarker } from '@/components/ReportMapView';
import Colors from '@/constants/colors';

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: Colors.warning,
  assigned: Colors.secondary,
  in_progress: '#7C3AED',
  resolved: Colors.success,
};

const LEGEND_ITEMS = Object.entries(STATUS_COLORS).map(([status, color]) => ({
  label: status.replace('_', ' '),
  color,
}));

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports } = useReports();
  const { location, isTracking, error: locError, refresh } = useRealtimeLocation({
    intervalMs: 4000,
    distanceFilter: 5,
  });

  /* Build markers from reports */
  const markers: MapMarker[] = useMemo(
    () =>
      reports.map((r) => ({
        id: r.id,
        latitude: r.latitude,
        longitude: r.longitude,
        title: r.title,
        description: `${r.wasteType} · ${r.status.replace('_', ' ')}`,
        color: STATUS_COLORS[r.status],
        priority: r.priority,
      })),
    [reports],
  );

  const userCoords = useMemo(
    () => (location ? { latitude: location.latitude, longitude: location.longitude } : null),
    [location],
  );

  const handleMarkerPress = useCallback(
    (m: MapMarker) => {
      router.push({ pathname: '/report-detail', params: { id: m.id } });
    },
    [router],
  );

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <View style={styles.topRow}>
          <Text style={styles.topTitle}>Report Map</Text>
          <TouchableOpacity onPress={refresh} style={styles.locBtn}>
            {isTracking ? (
              <Ionicons name="navigate" size={20} color={Colors.secondary} />
            ) : (
              <ActivityIndicator size="small" color={Colors.secondary} />
            )}
          </TouchableOpacity>
        </View>
        {locError && <Text style={styles.locError}>{locError}</Text>}
        {location && (
          <Text style={styles.coordsText}>
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            {location.accuracy ? ` · ±${location.accuracy.toFixed(0)} m` : ''}
          </Text>
        )}
      </View>

      {/* ── Live map ────────────────────────── */}
      <View style={styles.mapWrap}>
        <ReportMapView
          markers={markers}
          userLocation={userCoords}
          showUserRadius
          userRadiusMeters={300}
          onMarkerPress={handleMarkerPress}
        />

        {/* Floating badge */}
        <View style={styles.badge}>
          <Ionicons name="location" size={14} color={Colors.white} />
          <Text style={styles.badgeText}>{reports.length} reports</Text>
        </View>
      </View>

      {/* ── Legend ──────────────────────────── */}
      <View style={styles.legendWrap}>
        <Text style={styles.legendTitle}>Legend</Text>
        <MapLegend items={[...LEGEND_ITEMS, { label: 'You', color: Colors.secondary }]} />
        <Text style={styles.legendNote}>
          Markers update in real-time · Location tracking {isTracking ? 'active' : 'paused'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  locBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locError: { fontSize: 11, color: Colors.danger, marginTop: 4 },
  coordsText: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray400, marginTop: 2 },
  mapWrap: { flex: 1, margin: 12, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  legendWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 90,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  legendTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray700, marginBottom: 6 },
  legendNote: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.gray400, marginTop: 6, paddingHorizontal: 16 },
});
