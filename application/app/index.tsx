import { useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const { 
    hasCompletedOnboarding, 
    hasCompletedKYC, 
    isAuthenticated, 
    isLoading,
    kycStatus 
  } = useSafeTrails();

  console.log('IndexScreen render:', {
    hasCompletedOnboarding,
    hasCompletedKYC,
    isAuthenticated,
    isLoading,
    kycStatus
  });

  useEffect(() => {
    console.log('IndexScreen useEffect triggered, isLoading:', isLoading);
    
    if (!isLoading) {
      console.log('Navigation logic starting...');
      
      // Authentication flow logic
      if (!hasCompletedOnboarding) {
        console.log('Navigating to onboarding');
        // First time users go to onboarding
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        console.log('Navigating to auth');
        // Not logged in - go to auth screen
        router.replace('/auth');
      } else if (!hasCompletedKYC || kycStatus !== 'APPROVED') {
        console.log('Navigating to KYC');
        // Logged in but KYC not completed/approved - go to KYC
        router.replace('/kyc');
      } else {
        console.log('Navigating to dashboard');
        // All good - go to dashboard
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [hasCompletedOnboarding, hasCompletedKYC, isAuthenticated, isLoading, kycStatus]);

  // Show elegant loading screen while determining navigation
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>SafeTrails</Text>
          <Text style={styles.subtitle}>Travel Smart. Stay Safe.</Text>
          <ActivityIndicator 
            size="large" 
            color="#FFFFFF" 
            style={styles.loader} 
          />
          <Text style={styles.loadingText}>
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </Text>
          <Text style={styles.debugText}>
            Debug: {isLoading ? 'Checking state...' : 
              !hasCompletedOnboarding ? 'Going to onboarding' :
              !isAuthenticated ? 'Going to auth' :
              (!hasCompletedKYC || kycStatus !== 'APPROVED') ? 'Going to KYC' :
              'Going to dashboard'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  debugText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
});