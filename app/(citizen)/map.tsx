import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/contexts/ReportsContext';
import Colors from '@/constants/colors';

const STATUS_COLORS = {
  pending: Colors.warning,
  assigned: Colors.secondary,
  in_progress: '#7C3AED',
  resolved: Colors.success,
};

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const { reports } = useReports();

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>Report Map</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <View style={styles.mapGrid}>
          {reports.map((report, i) => (
            <View
              key={report.id}
              style={[
                styles.marker,
                {
                  left: `${20 + (i * 15) % 60}%` as any,
                  top: `${15 + (i * 18) % 55}%` as any,
                  backgroundColor: STATUS_COLORS[report.status],
                },
              ]}
            >
              <Ionicons name="location" size={16} color={Colors.white} />
            </View>
          ))}
        </View>
        <View style={styles.mapOverlay}>
          <Ionicons name="map-outline" size={40} color={Colors.gray300} />
          <Text style={styles.mapLabel}>Interactive Map View</Text>
          <Text style={styles.mapSub}>{reports.length} reports in your area</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendRow}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{status.replace('_', ' ')}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  mapPlaceholder: { flex: 1, margin: 16, borderRadius: 20, backgroundColor: Colors.lightBlue, overflow: 'hidden', position: 'relative' },
  mapGrid: { position: 'absolute', width: '100%', height: '100%' },
  marker: { position: 'absolute', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  mapOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  mapLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
  mapSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
  legend: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 100, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  legendTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray700, marginBottom: 10 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.gray600, textTransform: 'capitalize' },
});
