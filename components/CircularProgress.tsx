import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Colors from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  bgColor = Colors.gray200,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  const progressColor = color || (progress >= 75 ? Colors.success : progress >= 50 ? Colors.warning : Colors.secondary);

  useEffect(() => {
    animatedProgress.value = withTiming(progress / 100, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={bgColor} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={progressColor} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  childrenContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
