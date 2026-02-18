import React, { useState } from 'react';
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
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !selectedRole) return;
    setIsSubmitting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await login(selectedRole, name.trim());
    const route = selectedRole === 'citizen' ? '/(citizen)' : selectedRole === 'cleaner' ? '/(cleaner)' : '/(admin)';
    router.replace(route as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 20, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 24 }]}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <View style={styles.header}>
          <View style={styles.logoBg}>
            <Ionicons name="leaf" size={28} color={Colors.white} />
          </View>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Enter your name and select your role</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.inputSection}>
        <Text style={styles.label}>Your Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={Colors.gray400} />
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.gray400}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>
      </Animated.View>

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

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <Pressable
          onPress={handleLogin}
          disabled={!name.trim() || !selectedRole || isSubmitting}
          style={({ pressed }) => [
            styles.loginButton,
            (!name.trim() || !selectedRole) && styles.loginButtonDisabled,
            pressed && styles.loginButtonPressed,
          ]}
        >
          <Text style={[styles.loginButtonText, (!name.trim() || !selectedRole) && styles.loginButtonTextDisabled]}>
            Continue
          </Text>
          <Ionicons name="arrow-forward" size={20} color={!name.trim() || !selectedRole ? Colors.gray400 : Colors.white} />
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
});
