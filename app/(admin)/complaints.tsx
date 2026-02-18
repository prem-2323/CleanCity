import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useReports, ReportPriority, Report } from '@/contexts/ReportsContext';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

type SortKey = 'newest' | 'oldest' | 'priority';

const PRIORITY_FILTERS: { key: ReportPriority | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'priority', label: 'Priority' },
  { key: 'oldest', label: 'Oldest First' },
];

const PRIORITY_ORDER: Record<ReportPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ComplaintManagementScreen() {
  const insets = useSafeAreaInsets();
  const { reports, bulkUpdateReports } = useReports();
  const [priorityFilter, setPriorityFilter] = useState<ReportPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const filtered = useMemo(() => {
    let result = priorityFilter === 'all' ? [...reports] : reports.filter(r => r.priority === priorityFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.wasteType.toLowerCase().includes(q) ||
        r.id.includes(q)
      );
    }
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'priority': result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]); break;
    }
    return result;
  }, [reports, priorityFilter, searchQuery, sortBy]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBulkAssign = () => {
    if (selectedIds.size === 0) return;
    router.push({ pathname: '/assign-staff', params: { reportId: Array.from(selectedIds)[0] } });
  };

  const handleBulkChangePriority = async (priority: ReportPriority) => {
    if (selectedIds.size === 0) return;
    await bulkUpdateReports(Array.from(selectedIds), { priority });
    setSelectedIds(new Set());
    setBulkMode(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const [showPriorityPicker, setShowPriorityPicker] = useState(false);

  const renderItem = ({ item }: { item: Report }) => (
    <Card onPress={() => {
      if (bulkMode) { toggleSelect(item.id); return; }
      router.push({ pathname: '/report-detail', params: { id: item.id } });
    }}>
      <View style={styles.reportHeader}>
        {bulkMode && (
          <Pressable onPress={() => toggleSelect(item.id)} style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]}>
            {selectedIds.has(item.id) && <Ionicons name="checkmark" size={14} color={Colors.white} />}
          </Pressable>
        )}
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.reportMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.gray400} />
            <Text style={styles.reportAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
        <PriorityBadge priority={item.priority} />
      </View>
      <View style={styles.reportFooter}>
        <StatusBadge status={item.status} />
        {!bulkMode && !item.assignedTo && item.status === 'pending' && (
          <Pressable
            onPress={() => router.push({ pathname: '/assign-staff', params: { reportId: item.id } })}
            style={({ pressed }) => [styles.assignBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="person-add" size={14} color={Colors.white} />
            <Text style={styles.assignText}>Assign</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 8 }]}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.topTitle}>Complaints</Text>
            <Text style={styles.countLabel}>{filtered.length} complaints</Text>
          </View>
          <Pressable
            onPress={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
            style={[styles.bulkToggle, bulkMode && styles.bulkToggleActive]}
          >
            <Ionicons name={bulkMode ? 'close' : 'checkbox-outline'} size={18} color={bulkMode ? Colors.white : Colors.primary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, type, ID..."
            placeholderTextColor={Colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.gray400} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setShowSortDropdown(!showSortDropdown)}
          style={styles.sortButton}
        >
          <Ionicons name="swap-vertical" size={18} color={Colors.primary} />
        </Pressable>
      </View>

      {showSortDropdown && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => { setSortBy(opt.key); setShowSortDropdown(false); }}
              style={[styles.sortItem, sortBy === opt.key && styles.sortItemActive]}
            >
              <Text style={[styles.sortItemText, sortBy === opt.key && styles.sortItemTextActive]}>{opt.label}</Text>
              {sortBy === opt.key && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          data={PRIORITY_FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setPriorityFilter(item.key); if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              style={[styles.filterChip, priorityFilter === item.key && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, priorityFilter === item.key && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          )}
        />
      </View>

      {bulkMode && selectedIds.size > 0 && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.bulkActions}>
          <Pressable onPress={selectAll} style={styles.bulkActionChip}>
            <Text style={styles.bulkActionText}>{selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}</Text>
          </Pressable>
          <View style={styles.bulkActionDivider} />
          <Pressable onPress={handleBulkAssign} style={styles.bulkActionChip}>
            <Ionicons name="person-add" size={14} color={Colors.primary} />
            <Text style={styles.bulkActionText}>Assign</Text>
          </Pressable>
          <Pressable onPress={() => setShowPriorityPicker(!showPriorityPicker)} style={styles.bulkActionChip}>
            <Ionicons name="flag" size={14} color={Colors.warning} />
            <Text style={styles.bulkActionText}>Priority</Text>
          </Pressable>
          <Text style={styles.selectedCount}>{selectedIds.size}</Text>
        </Animated.View>
      )}

      {showPriorityPicker && bulkMode && (
        <View style={styles.priorityPicker}>
          {(['critical', 'high', 'medium', 'low'] as ReportPriority[]).map((p) => (
            <Pressable key={p} onPress={() => { handleBulkChangePriority(p); setShowPriorityPicker(false); }} style={styles.priorityPickerItem}>
              <Text style={styles.priorityPickerText}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or search</Text>
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 2 },
  bulkToggle: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  bulkToggleActive: { backgroundColor: Colors.primary },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8, backgroundColor: Colors.white },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray100, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray900 },
  sortButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  sortDropdown: { backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 12, ...Colors.cardShadow, overflow: 'hidden' },
  sortItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  sortItemActive: { backgroundColor: Colors.primary + '08' },
  sortItemText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray700 },
  sortItemTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  filterRow: { paddingVertical: 10, backgroundColor: Colors.white },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray100 },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray600 },
  filterTextActive: { color: Colors.white },
  bulkActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.lightBlue, gap: 8 },
  bulkActionChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bulkActionText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.primary },
  bulkActionDivider: { width: 1, height: 20, backgroundColor: Colors.gray300 },
  selectedCount: { marginLeft: 'auto', fontSize: 13, fontFamily: 'Inter_700Bold', color: Colors.primary },
  priorityPicker: { backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 12, ...Colors.cardShadow, overflow: 'hidden' },
  priorityPickerItem: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  priorityPickerText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.gray800 },
  reportHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reportInfo: { flex: 1, marginRight: 8 },
  reportTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  reportAddress: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, flex: 1 },
  reportFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  assignText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.white },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.gray500 },
  emptySubtext: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray400 },
});
