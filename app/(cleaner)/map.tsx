import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/contexts/ReportsContext';
import Colors from '@/constants/colors';

export default function CleanerMapScreen() {
  const insets = useSafeAreaInsets();
  const { reports } = useReports();
  const assignedTasks = reports.filter(r => r.status === 'assigned' || r.status === 'in_progress');

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>Task Map</Text>
      </View>
      <View style={styles.mapPlaceholder}>
        {assignedTasks.map((task, i) => (
          <View key={task.id} style={[styles.marker, { left: `${15 + (i * 20) % 70}%` as any, top: `${10 + (i * 22) % 60}%` as any }]}>
            <Ionicons name="location" size={20} color={Colors.white} />
          </View>
        ))}
        <View style={styles.mapCenter}>
          <Ionicons name="navigate-outline" size={40} color={Colors.gray300} />
          <Text style={styles.mapText}>{assignedTasks.length} assigned tasks nearby</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  mapPlaceholder: { flex: 1, margin: 16, borderRadius: 20, backgroundColor: Colors.lightBlue, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  marker: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Colors.cardShadow },
  mapCenter: { alignItems: 'center', gap: 8 },
  mapText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.gray500 },
});
