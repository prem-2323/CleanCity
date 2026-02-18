import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { setHasSeenWelcome } = useAuth();

  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslate = useSharedValue(30);

  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 12 }));
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    titleTranslate.value = withDelay(500, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
    buttonTranslate.value = withDelay(1100, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleTranslate.value }] }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value, transform: [{ translateY: buttonTranslate.value }] }));

  const handleContinue = async () => {
    await setHasSeenWelcome();
    router.replace('/login');
  };

  return (
    <LinearGradient colors={['#1E3A8A', '#2563EB', '#3B82F6']} style={styles.container}>
      <View style={[styles.content, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 60 }]}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <View style={styles.iconBg}>
            <Ionicons name="leaf" size={48} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.View style={titleStyle}>
          <Text style={styles.greeting}>Hi, Welcome to</Text>
          <Text style={styles.appName}>CleanMap</Text>
        </Animated.View>

        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>
            Report waste, earn rewards, and help keep your city clean. Together we make a difference.
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          {[
            { icon: 'camera' as const, text: 'AI-powered waste detection' },
            { icon: 'trophy' as const, text: 'Earn credits for reporting' },
            { icon: 'map' as const, text: 'Track cleanup in real-time' },
          ].map((item, i) => (
            <Animated.View key={i} style={[styles.featureRow, { opacity: subtitleOpacity }]}>
              <View style={styles.featureIcon}>
                <Ionicons name={item.icon} size={20} color={Colors.white} />
              </View>
              <Text style={styles.featureText}>{item.text}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.bottomSection, buttonStyle, { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
        <Pressable onPress={handleContinue} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, alignItems: 'center' },
  iconContainer: { marginBottom: 32 },
  iconBg: { width: 88, height: 88, borderRadius: 28, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 20, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_500Medium', textAlign: 'center' },
  appName: { fontSize: 42, color: Colors.white, fontFamily: 'Inter_700Bold', textAlign: 'center', marginTop: 4 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 24, marginTop: 16 },
  featuresContainer: { marginTop: 40, gap: 16, width: '100%' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 15, color: Colors.white, fontFamily: 'Inter_500Medium', flex: 1 },
  bottomSection: { paddingHorizontal: 32 },
  button: { backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, gap: 8 },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: 17, color: Colors.primary, fontFamily: 'Inter_700Bold' },
});
