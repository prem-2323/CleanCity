import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface MiniTrendChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  trending?: 'up' | 'down';
}

export function MiniTrendChart({ data, width = 80, height = 32, color = Colors.success, label, trending }: MiniTrendChartProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
      {(label || trending) && (
        <View style={styles.labelRow}>
          {trending && (
            <Ionicons
              name={trending === 'up' ? 'trending-up' : 'trending-down'}
              size={14}
              color={trending === 'up' ? Colors.success : Colors.danger}
            />
          )}
          {label && <Text style={[styles.label, { color: trending === 'up' ? Colors.success : Colors.danger }]}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  label: { fontSize: 11, fontWeight: '600' as const },
});
