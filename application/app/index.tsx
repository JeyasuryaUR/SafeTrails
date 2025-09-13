import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexScreen() {
  const { hasCompletedOnboarding, hasCompletedKYC, isAuthenticated, isLoading } = useSafeTrails();

  useEffect(() => {
    if (!isLoading) { 
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/auth');
      } else if (!hasCompletedKYC) {
        router.replace('/kyc');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [hasCompletedOnboarding, hasCompletedKYC, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});