import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Users,
  X,
  Shield
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function SOSScreen() {
  const { touristProfile, currentLocation } = useSafeTrails();
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [alertNearbyTourists, setAlertNearbyTourists] = useState(false);

  useEffect(() => {
    if (isActivated) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [isActivated]);

  const handleSOSPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          activateSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const activateSOS = () => {
    setIsActivated(true);
    
    Alert.alert(
      'SOS ACTIVATED',
      `Emergency alert sent to:\n• Nearest police station\n• Your emergency contacts${alertNearbyTourists ? '\n• Fellow tourists nearby' : ''}\n\nLocation: ${currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Acquiring GPS...'}`,
      [
        {
          text: 'Cancel Alert',
          style: 'destructive',
          onPress: () => {
            setIsActivated(false);
            Alert.alert('Alert Cancelled', 'Emergency alert has been cancelled.');
          }
        },
        {
          text: 'Keep Active',
          style: 'default'
        }
      ]
    );
  };

  const handleClose = () => {
    if (isActivated) {
      Alert.alert(
        'Cancel Emergency Alert?',
        'Are you sure you want to cancel the active emergency alert?',
        [
          { text: 'No, Keep Active', style: 'cancel' },
          { 
            text: 'Yes, Cancel', 
            style: 'destructive',
            onPress: () => {
              setIsActivated(false);
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isActivated ? ['#DC2626', '#EF4444', '#F87171'] : ['#1F2937', '#374151', '#4B5563']}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X color="white" size={24} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {isActivated ? 'SOS ACTIVE' : 'Emergency SOS'}
          </Text>
          <Text style={styles.subtitle}>
            {isActivated 
              ? 'Help is on the way. Stay calm and safe.'
              : 'Press and hold the button below for emergency assistance'
            }
          </Text>
        </View>

        <View style={styles.sosContainer}>
          {countdown > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.countdownLabel}>Activating in...</Text>
            </View>
          )}

          <Animated.View style={[styles.sosButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.sosButton,
                isActivated && styles.sosButtonActive,
                countdown > 0 && styles.sosButtonCountdown
              ]}
              onPress={handleSOSPress}
              disabled={isActivated}
            >
              <AlertTriangle 
                color="white" 
                size={isActivated ? 80 : 60} 
              />
              <Text style={[styles.sosButtonText, isActivated && styles.sosButtonTextActive]}>
                {isActivated ? 'ACTIVE' : 'SOS'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {isActivated && (
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Shield color="#10B981" size={20} />
                <Text style={styles.statusText}>Authorities Notified</Text>
              </View>
              <View style={styles.statusItem}>
                <MapPin color="#10B981" size={20} />
                <Text style={styles.statusText}>Location Shared</Text>
              </View>
              <View style={styles.statusItem}>
                <Phone color="#10B981" size={20} />
                <Text style={styles.statusText}>Contacts Alerted</Text>
              </View>
            </View>
          )}
        </View>

        {!isActivated && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.option, alertNearbyTourists && styles.optionActive]}
              onPress={() => setAlertNearbyTourists(!alertNearbyTourists)}
            >
              <Users color={alertNearbyTourists ? '#2563EB' : '#9CA3AF'} size={20} />
              <Text style={[styles.optionText, alertNearbyTourists && styles.optionTextActive]}>
                Also alert fellow tourists nearby
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What happens when you activate SOS?</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Your exact location is shared with nearest police station
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Emergency contacts receive instant notification with your location
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Your digital ID and trip details are shared with authorities
            </Text>
          </View>
          {alertNearbyTourists && (
            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={styles.infoText}>
                Nearby SafeTrails users are notified to offer assistance
              </Text>
            </View>
          )}
        </View>

        {isActivated && (
          <View style={styles.emergencyContacts}>
            <Text style={styles.contactsTitle}>Emergency Contacts Notified:</Text>
            {touristProfile.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <Phone color="rgba(255, 255, 255, 0.8)" size={16} />
                <Text style={styles.contactText}>
                  {contact.name} ({contact.relation}) - {contact.phone}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  sosContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  countdownContainer: {
    position: 'absolute',
    top: -60,
    alignItems: 'center',
    zIndex: 2,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FCD34D',
  },
  countdownLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sosButtonContainer: {
    marginBottom: 30,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sosButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#FCD34D',
  },
  sosButtonCountdown: {
    backgroundColor: '#F59E0B',
  },
  sosButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sosButtonTextActive: {
    fontSize: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  optionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBullet: {
    color: '#FCD34D',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  emergencyContacts: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  contactsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginLeft: 8,
  },
});