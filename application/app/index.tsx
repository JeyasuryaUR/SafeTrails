import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexScreen() {
  const { hasCompletedOnboarding, hasCompletedKYC, isAuthenticated, isLoading } = useSafeTrails();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth');
      } else if (!hasCompletedKYC) {
        router.replace('/kyc');
      } else if (hasCompletedOnboarding) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/onboarding');
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