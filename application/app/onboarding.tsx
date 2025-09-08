import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield, MapPin, AlertTriangle, Award } from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Digital Tourist ID',
    description: 'Secure blockchain-verified identity for seamless travel verification',
    icon: Shield,
    color: '#2563EB'
  },
  {
    id: 2,
    title: 'Geo Alerts',
    description: 'Real-time notifications when entering restricted or high-risk areas',
    icon: MapPin,
    color: '#F59E0B'
  },
  {
    id: 3,
    title: 'Panic Button',
    description: 'Instant SOS alerts to authorities and emergency contacts',
    icon: AlertTriangle,
    color: '#EF4444'
  },
  {
    id: 4,
    title: 'Safety Score',
    description: 'Track your travel safety with real-time risk assessment',
    icon: Award,
    color: '#10B981'
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { completeOnboarding } = useSafeTrails();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=80&h=80&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>SafeTrails</Text>
          <Text style={styles.tagline}>Travel Smart. Stay Safe.</Text>
        </View>

        <View style={styles.slideContainer}>
          <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
            <IconComponent size={60} color="white" />
          </View>
          
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentSlide && styles.paginationDotActive
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={nextSlide}>
            <Text style={styles.buttonText}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FCD34D',
    width: 24,
  },
  button: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#1E40AF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});