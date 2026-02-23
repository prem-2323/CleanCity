import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useReports } from '@/contexts/ReportsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeLocation } from '@/hooks/useRealtimeLocation';
import ReportMapView, { MapLegend, MapMarker } from '@/components/ReportMapView';
import Colors from '@/constants/colors';
import * as Linking from 'expo-linking';

const PRIORITY_COLORS: Record<string, string> = {
  critical: Colors.danger,
  high: Colors.warning,
  medium: Colors.secondary,
  low: Colors.success,
};

export default function CleanerMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { uid, userEmail } = useAuth();
  const { reports } = useReports();
  const { location, isTracking, error: locError, refresh } = useRealtimeLocation({
    intervalMs: 3000,
    distanceFilter: 3,
  });

  /* ── Filter tasks assigned to this cleaner ── */
  const assignedTasks = useMemo(() => {
    const isAssigned = (s: string) => s === 'assigned' || s === 'in_progress';
    const mine = reports.filter(
      (r) => isAssigned(r.status) && (r.assignedTo === uid || r.assignedTo === userEmail),
    );
    // Fallback: if none specifically assigned, show all assigned tasks
    return mine.length > 0 ? mine : reports.filter((r) => isAssigned(r.status));
  }, [reports, uid, userEmail]);

  /* ── Map markers ───────────────────────────── */
  const markers: MapMarker[] = useMemo(
    () =>
      assignedTasks.map((t) => ({
        id: t.id,
        latitude: t.latitude,
        longitude: t.longitude,
        title: t.title,
        description: `${t.priority} priority · ${t.wasteType}`,
        color: PRIORITY_COLORS[t.priority] ?? Colors.primary,
        priority: t.priority,
      })),
    [assignedTasks],
  );

  const userCoords = useMemo(
    () => (location ? { latitude: location.latitude, longitude: location.longitude } : null),
    [location],
  );

  /* ── Tap marker → open task detail ─────────── */
  const handleMarkerPress = useCallback(
    (m: MapMarker) => {
      router.push({ pathname: '/task-detail', params: { id: m.id } });
    },
    [router],
  );

  /* ── Navigate to nearest task in Google Maps ── */
  const navigateToNearest = useCallback(() => {
    if (!location || assignedTasks.length === 0) return;
    // Find closest task
    let closest = assignedTasks[0];
    let minDist = Infinity;
    for (const t of assignedTasks) {
      const d = Math.hypot(t.latitude - location.latitude, t.longitude - location.longitude);
      if (d < minDist) {
        minDist = d;
        closest = t;
      }
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${closest.latitude},${closest.longitude}&travelmode=driving`;
    Linking.openURL(url);
  }, [location, assignedTasks]);

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <View style={styles.topRow}>
          <Text style={styles.topTitle}>Task Map</Text>
          <View style={styles.topActions}>
            <TouchableOpacity onPress={navigateToNearest} style={styles.navBtn}>
              <Ionicons name="navigate-circle" size={22} color={Colors.white} />
              <Text style={styles.navBtnText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={refresh} style={styles.locBtn}>
              {isTracking ? (
                <Ionicons name="locate" size={20} color={Colors.secondary} />
              ) : (
                <ActivityIndicator size="small" color={Colors.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {locError && <Text style={styles.locError}>{locError}</Text>}
        {location && (
          <Text style={styles.coordsText}>
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            {location.speed != null && location.speed > 0
              ? ` · ${(location.speed * 3.6).toFixed(1)} km/h`
              : ''}
            {location.heading != null && location.heading >= 0
              ? ` · ${location.heading.toFixed(0)}°`
              : ''}
          </Text>
        )}
      </View>

      {/* ── Live map ────────────────────────── */}
      <View style={styles.mapWrap}>
        <ReportMapView
          markers={markers}
          userLocation={userCoords}
          showUserRadius
          userRadiusMeters={200}
          onMarkerPress={handleMarkerPress}
        />

        {/* Floating info */}
        <View style={styles.badge}>
          <Ionicons name="briefcase" size={14} color={Colors.white} />
          <Text style={styles.badgeText}>{assignedTasks.length} tasks</Text>
        </View>

        {/* Floating critical alert */}
        {assignedTasks.some((t) => t.priority === 'critical') && (
          <View style={styles.criticalBadge}>
            <Ionicons name="warning" size={14} color={Colors.white} />
            <Text style={styles.badgeText}>Critical task nearby!</Text>
          </View>
        )}
      </View>

      {/* ── Legend ──────────────────────────── */}
      <View style={styles.legendWrap}>
        <MapLegend
          items={[
            { label: 'Critical', color: Colors.danger },
            { label: 'High', color: Colors.warning },
            { label: 'Medium', color: Colors.secondary },
            { label: 'Low', color: Colors.success },
            { label: 'You', color: Colors.secondary },
          ]}
        />
        <Text style={styles.legendNote}>
          Real-time tracking {isTracking ? 'active' : 'paused'} · Tap a marker for details
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
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  navBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
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
  criticalBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  legendWrap: {
    paddingVertical: 10,
    paddingBottom: 90,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  legendNote: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.gray400,
    paddingHorizontal: 16,
    marginTop: 4,
  },
});
