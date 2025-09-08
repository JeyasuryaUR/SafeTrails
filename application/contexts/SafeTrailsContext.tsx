import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export interface TouristProfile {
  id: string;
  name: string;
  photo: string;
  tripValidFrom: string;
  tripValidTo: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relation: string;
  }>;
  didVerified: boolean;
}

export interface SafetyScore {
  overall: number;
  routeRisk: number;
  itineraryChecks: number;
  activeness: number;
  badge: 'Safe Explorer' | 'At Risk' | 'Cautious Traveler';
}

export interface CommunityReport {
  id: string;
  title: string;
  location: string;
  category: 'Roadblock' | 'Medical' | 'Weather' | 'Safety';
  description: string;
  timestamp: string;
  upvotes: number;
  reportedBy: string;
}

export interface ItineraryItem {
  id: string;
  location: string;
  date: string;
  time: string;
  activity: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const [SafeTrailsProvider, useSafeTrails] = createContextHook(() => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isInDangerZone, setIsInDangerZone] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const [touristProfile] = useState<TouristProfile>({
    id: 'TID-2025-001',
    name: 'Alex Johnson',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    tripValidFrom: '2025-01-15',
    tripValidTo: '2025-01-25',
    emergencyContacts: [
      { name: 'Sarah Johnson', phone: '+1-555-0123', relation: 'Spouse' },
      { name: 'Emergency Services', phone: '911', relation: 'Emergency' }
    ],
    didVerified: true
  });

  const [safetyScore] = useState<SafetyScore>({
    overall: 78,
    routeRisk: 85,
    itineraryChecks: 92,
    activeness: 67,
    badge: 'Safe Explorer'
  });

  const [itinerary] = useState<ItineraryItem[]>([
    {
      id: '1',
      location: 'Red Fort, Delhi',
      date: '2025-01-16',
      time: '10:00 AM',
      activity: 'Historical Tour',
      riskLevel: 'low'
    },
    {
      id: '2',
      location: 'Chandni Chowk Market',
      date: '2025-01-16',
      time: '2:00 PM',
      activity: 'Shopping & Food',
      riskLevel: 'medium'
    },
    {
      id: '3',
      location: 'Connaught Place',
      date: '2025-01-17',
      time: '7:00 PM',
      activity: 'Nightlife',
      riskLevel: 'high'
    }
  ]);

  const [communityReports] = useState<CommunityReport[]>([
    {
      id: '1',
      title: 'Road closure on NH-1',
      location: 'Delhi-Chandigarh Highway',
      category: 'Roadblock',
      description: 'Major construction work causing 2-hour delays',
      timestamp: '2 hours ago',
      upvotes: 23,
      reportedBy: 'TravellerMike'
    },
    {
      id: '2',
      title: 'Pickpocket alert',
      location: 'Connaught Place Metro',
      category: 'Safety',
      description: 'Multiple reports of pickpocketing near exit gate 3',
      timestamp: '4 hours ago',
      upvotes: 45,
      reportedBy: 'SafetyFirst'
    },
    {
      id: '3',
      title: 'Heavy rainfall warning',
      location: 'Goa Beaches',
      category: 'Weather',
      description: 'Monsoon expected for next 3 days, beach activities suspended',
      timestamp: '6 hours ago',
      upvotes: 67,
      reportedBy: 'WeatherWatch'
    }
  ]);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(status === 'true');
    } catch (error) {
      console.log('Error loading onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  const updateLocation = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    
    // Simulate danger zone detection
    const dangerZones = [
      { lat: 28.6562, lng: 77.2410, radius: 0.01 }, // Connaught Place area
    ];
    
    const isInDanger = dangerZones.some(zone => {
      const distance = Math.sqrt(
        Math.pow(location.lat - zone.lat, 2) + Math.pow(location.lng - zone.lng, 2)
      );
      return distance < zone.radius;
    });
    
    setIsInDangerZone(isInDanger);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    touristProfile,
    safetyScore,
    itinerary,
    communityReports,
    currentLocation,
    isInDangerZone,
    updateLocation,
    language,
    toggleLanguage
  };
});