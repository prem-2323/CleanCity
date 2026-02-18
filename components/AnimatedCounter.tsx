import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, duration = 1200, style, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    return { text: `${prefix}${Math.round(animatedValue.value)}${suffix}` } as { text: string };
  });

  return (
    <AnimatedText
      animatedProps={animatedProps}
      style={style}
      accessibilityLabel={`${prefix}${value}${suffix}`}
    >
      {`${prefix}${value}${suffix}`}
    </AnimatedText>
  );
}
