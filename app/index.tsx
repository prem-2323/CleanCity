import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function IndexScreen() {
  const { hasSeenWelcome, isLoggedIn, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!hasSeenWelcome) {
      router.replace('/welcome');
    } else if (!isLoggedIn || !userRole) {
      router.replace('/login');
    } else {
      const route = userRole === 'citizen' ? '/(citizen)' : userRole === 'cleaner' ? '/(cleaner)' : '/(admin)';
      router.replace(route as any);
    }
  }, [isLoading, hasSeenWelcome, isLoggedIn, userRole]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
});
