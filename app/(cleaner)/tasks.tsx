import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/contexts/ReportsContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { reports } = useReports();
  const tasks = reports.filter(r => r.status === 'assigned' || r.status === 'in_progress');

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <Text style={styles.topTitle}>My Tasks</Text>
        <Text style={styles.countLabel}>{tasks.length} active tasks</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        scrollEnabled={tasks.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtext}>No tasks assigned at the moment</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push({ pathname: '/task-detail', params: { id: item.id } })}>
            <View style={styles.taskHeader}>
              <View style={[styles.priorityBar, { backgroundColor: item.priority === 'critical' ? Colors.danger : item.priority === 'high' ? Colors.warning : Colors.secondary }]} />
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.taskMeta}>
                  <Ionicons name="location-outline" size={14} color={Colors.gray400} />
                  <Text style={styles.taskAddress} numberOfLines={1}>{item.address}</Text>
                </View>
              </View>
            </View>
            <View style={styles.taskFooter}>
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  taskHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  priorityBar: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  taskContent: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskAddress: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, flex: 1 },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
});
