import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'];
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 12, paddingBottom: 120 }]}>
      <Text style={styles.pageTitle}>Settings</Text>

      <Card style={styles.settingCard}>
        <Text style={styles.sectionLabel}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.secondary + '15' }]}>
            <Ionicons name="notifications-outline" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.gray300, true: Colors.primary + '60' }}
            thumbColor={notifications ? Colors.primary : Colors.gray400}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.gray800 + '15' }]}>
            <Ionicons name="moon-outline" size={20} color={Colors.gray800} />
          </View>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: Colors.gray300, true: Colors.primary + '60' }}
            thumbColor={darkMode ? Colors.primary : Colors.gray400}
          />
        </View>

        <View style={styles.divider} />

        <Pressable style={styles.settingRow} onPress={() => setShowLangDropdown(!showLangDropdown)}>
          <View style={[styles.settingIcon, { backgroundColor: Colors.success + '15' }]}>
            <Ionicons name="language-outline" size={20} color={Colors.success} />
          </View>
          <Text style={styles.settingLabel}>Language</Text>
          <View style={styles.langSelector}>
            <Text style={styles.langText}>{language}</Text>
            <Ionicons name={showLangDropdown ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.gray500} />
          </View>
        </Pressable>

        {showLangDropdown && (
          <View style={styles.dropdown}>
            {languages.map((lang) => (
              <Pressable
                key={lang}
                onPress={() => { setLanguage(lang); setShowLangDropdown(false); }}
                style={[styles.dropdownItem, language === lang && styles.dropdownItemActive]}
              >
                <Text style={[styles.dropdownText, language === lang && styles.dropdownTextActive]}>{lang}</Text>
                {language === lang && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      <Card style={styles.settingCard}>
        <Text style={styles.sectionLabel}>About</Text>
        {[
          { icon: 'information-circle-outline' as const, label: 'Version', value: '1.0.0' },
          { icon: 'document-text-outline' as const, label: 'Terms of Service', value: '' },
          { icon: 'shield-checkmark-outline' as const, label: 'Privacy Policy', value: '' },
        ].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.gray200 }]}>
                <Ionicons name={item.icon} size={20} color={Colors.gray600} />
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              {item.value ? <Text style={styles.settingValue}>{item.value}</Text> : <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />}
            </View>
          </React.Fragment>
        ))}
      </Card>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.gray900, marginBottom: 16 },
  settingCard: { marginBottom: 16, padding: 0 },
  sectionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.gray500, padding: 16, paddingBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 52 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.gray800 },
  settingValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray500 },
  divider: { height: 1, backgroundColor: Colors.gray100, marginHorizontal: 16 },
  langSelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gray100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  langText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.gray700 },
  dropdown: { backgroundColor: Colors.gray50, marginHorizontal: 16, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  dropdownItemActive: { backgroundColor: Colors.primary + '08' },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.gray700 },
  dropdownTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.danger + '30', backgroundColor: Colors.danger + '08', marginTop: 8 },
  logoutText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.danger },
});
