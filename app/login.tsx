import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const ROLES: { role: UserRole; icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { role: 'citizen', icon: 'person', title: 'Citizen', desc: 'Report waste & earn rewards' },
  { role: 'cleaner', icon: 'construct', title: 'Cleaner', desc: 'Manage cleanup tasks' },
  { role: 'admin', icon: 'shield-checkmark', title: 'Admin', desc: 'Oversee city operations' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, isLoggedIn, userRole, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isLoggedIn || !userRole) return;
    const route = userRole === 'citizen' ? '/(citizen)' : userRole === 'cleaner' ? '/(cleaner)' : '/(admin)';
    router.replace(route as any);
  }, [isLoading, isLoggedIn, userRole]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(
        email.trim(),
        password,
        selectedRole || undefined,
        name.trim() || undefined,
      );
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loginWithGoogle(selectedRole);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.header}>
          <View style={styles.logoBg}>
            <Ionicons name="leaf" size={28} color={Colors.white} />
          </View>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Enter your details to continue</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.inputSection}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.input}
            nativeID="fullName"
            name="fullName"
            placeholder="Enter your name"
            placeholderTextColor={Colors.gray400}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.inputSection}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.input}
            nativeID="email"
            name="email"
            placeholder="Enter your email"
            placeholderTextColor={Colors.gray400}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.inputSection}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.input}
            nativeID="password"
            name="password"
            placeholder="Enter your password"
            placeholderTextColor={Colors.gray400}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />
        </View>
      </Animated.View>

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.roleSection}>
        <Text style={styles.label}>Select Role</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((item) => (
            <Pressable
              key={item.role}
              onPress={() => {
                setSelectedRole(item.role);
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.roleCard,
                selectedRole === item.role && styles.roleCardSelected,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={[styles.roleIconBg, selectedRole === item.role && styles.roleIconBgSelected]}>
                <Ionicons name={item.icon} size={24} color={selectedRole === item.role ? Colors.white : Colors.primary} />
              </View>
              <Text style={[styles.roleTitle, selectedRole === item.role && styles.roleTitleSelected]}>{item.title}</Text>
              <Text style={[styles.roleDesc, selectedRole === item.role && styles.roleDescSelected]}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.buttonContainer}>
        <Pressable
          onPress={handleLogin}
          disabled={!email.trim() || !password || isSubmitting}
          style={({ pressed }) => [
            styles.loginButton,
            (!email.trim() || !password) && styles.loginButtonDisabled,
            pressed && styles.loginButtonPressed,
          ]}
        >
          <Text style={[styles.loginButtonText, (!email.trim() || !password) && styles.loginButtonTextDisabled]}>
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={!email.trim() || !password ? Colors.gray400 : Colors.white} />
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={handleGoogleLogin}
          disabled={!selectedRole || isSubmitting}
          style={({ pressed }) => [
            styles.googleButton,
            !selectedRole && styles.loginButtonDisabled,
            pressed && styles.loginButtonPressed,
          ]}
        >
          <Ionicons name="logo-google" size={20} color={!selectedRole ? Colors.gray400 : '#DB4437'} />
          <Text style={[styles.googleButtonText, !selectedRole && styles.loginButtonTextDisabled]}>
            Sign in with Google
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.gray900 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.gray500, marginTop: 6 },
  inputSection: { marginBottom: 24 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray700, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.gray200, paddingHorizontal: 14, gap: 10, height: 52 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular', color: Colors.gray900 },
  roleSection: { marginBottom: 32 },
  rolesGrid: { gap: 12 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: Colors.gray200, gap: 14 },
  roleCardSelected: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  roleIconBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  roleIconBgSelected: { backgroundColor: Colors.primary },
  roleTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
  roleTitleSelected: { color: Colors.primary },
  roleDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.gray500, position: 'absolute', right: 16 },
  roleDescSelected: { color: Colors.secondary },
  loginButton: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, gap: 8 },
  loginButtonDisabled: { backgroundColor: Colors.gray200 },
  loginButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  loginButtonText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: Colors.white },
  loginButtonTextDisabled: { color: Colors.gray400 },
  errorText: { color: Colors.danger, fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center', marginBottom: 16 },
  buttonContainer: { gap: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  line: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  dividerText: { marginHorizontal: 12, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.gray400 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, gap: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gray200 },
  googleButtonText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.gray800 },
});
