import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { ReportStatus, ReportPriority } from '@/contexts/ReportsContext';

const STATUS_CONFIG: Record<ReportStatus, { color: string; bg: string; label: string }> = {
  pending: { color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  assigned: { color: '#2563EB', bg: '#DBEAFE', label: 'Assigned' },
  in_progress: { color: '#7C3AED', bg: '#EDE9FE', label: 'In Progress' },
  resolved: { color: '#059669', bg: '#D1FAE5', label: 'Resolved' },
};

const PRIORITY_CONFIG: Record<ReportPriority, { color: string; bg: string; label: string }> = {
  low: { color: '#6B7280', bg: '#F3F4F6', label: 'Low' },
  medium: { color: '#D97706', bg: '#FEF3C7', label: 'Medium' },
  high: { color: '#DC2626', bg: '#FEE2E2', label: 'High' },
  critical: { color: '#991B1B', bg: '#FEE2E2', label: 'Critical' },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' as const },
});
