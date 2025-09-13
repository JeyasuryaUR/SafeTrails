import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export interface TouristProfile {
  id: string;
  name: string;
  photo: string;
  tripValidFrom: string;
  tripValidTo: string;
  emergencyContacts: {
    name: string;
    phone: string;
    relation: string;
  }[];
  didVerified: boolean;
  lastActiveTime: string;
  geoTagStatus: 'active' | 'inactive' | 'warning';
  locationHistory: {
    timestamp: string;
    lat: number;
    lng: number;
    location: string;
  }[];
}

export interface SafetyScore {
  overall: number;
  routeRisk: number;
  itineraryChecks: number;
  activeness: number;
  badge: 'Safe Explorer' | 'At Risk' | 'Cautious Traveler' | 'Adventure Seeker' | 'Safety Champion';
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
  const [lastLocationUpdate, setLastLocationUpdate] = useState<string>(new Date().toISOString());
  const [alertCount, setAlertCount] = useState<number>(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);

  const [touristProfile, setTouristProfile] = useState<TouristProfile>({
    id: 'TID-2025-001',
    name: 'Jeyasurya',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    tripValidFrom: '2025-09-10',
    tripValidTo: '2025-09-17',
    emergencyContacts: [
      { name: 'Rathika U', phone: '+91-9876543210', relation: 'Mother' },
      { name: 'Emergency Services', phone: '112', relation: 'Emergency' },
      { name: 'Tourist Helpline', phone: '1363', relation: 'Tourism' }
    ],
    didVerified: true,
    lastActiveTime: new Date().toISOString(),
    geoTagStatus: 'active',
    locationHistory: [
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        lat: 28.6139,
        lng: 77.2090,
        location: 'India Gate, New Delhi'
      },
      {
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        lat: 28.6562,
        lng: 77.2410,
        location: 'Connaught Place, New Delhi'
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        lat: 28.6279,
        lng: 77.2185,
        location: 'Lotus Temple, New Delhi'
      }
    ]
  });

  const [safetyScore, setSafetyScore] = useState<SafetyScore>({
    overall: 85,
    routeRisk: 92,
    itineraryChecks: 88,
    activeness: 75,
    badge: 'Adventure Seeker'
  });

  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    {
      id: '1',
      location: 'Red Fort, Delhi',
      date: '2025-09-10',
      time: '09:00 AM',
      activity: 'Historical Monument Visit',
      riskLevel: 'low'
    },
    {
      id: '2',
      location: 'Chandni Chowk Market',
      date: '2025-09-10',
      time: '12:30 PM',
      activity: 'Street Food & Shopping',
      riskLevel: 'medium'
    },
    {
      id: '3',
      location: 'India Gate',
      date: '2025-09-10',
      time: '06:00 PM',
      activity: 'Evening Walk & Photography',
      riskLevel: 'low'
    },
    {
      id: '4',
      location: 'Connaught Place',
      date: '2025-09-10',
      time: '08:30 PM',
      activity: 'Dinner & Nightlife',
      riskLevel: 'high'
    },
    {
      id: '5',
      location: 'Lotus Temple',
      date: '2025-09-11',
      time: '10:00 AM',
      activity: 'Spiritual Visit',
      riskLevel: 'low'
    },
    {
      id: '6',
      location: 'Humayun\'s Tomb',
      date: '2025-09-11',
      time: '02:00 PM',
      activity: 'UNESCO World Heritage Site',
      riskLevel: 'low'
    }
  ]);

  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([
    {
      id: '1',
      title: 'Heavy traffic near Red Fort',
      location: 'Red Fort Metro Station',
      category: 'Roadblock',
      description: 'Republic Day preparations causing major traffic delays. Use alternative routes.',
      timestamp: '12 minutes ago',
      upvotes: 34,
      reportedBy: 'DelhiExplorer'
    },
    {
      id: '2',
      title: 'Pickpocket alert - Chandni Chowk',
      location: 'Chandni Chowk Main Market',
      category: 'Safety',
      description: 'Multiple tourists reported theft incidents near spice market. Stay vigilant with belongings.',
      timestamp: '28 minutes ago',
      upvotes: 67,
      reportedBy: 'SafetyFirst2025'
    },
    {
      id: '3',
      title: 'Medical emergency support needed',
      location: 'India Gate Lawns',
      category: 'Medical',
      description: 'Tourist fainted due to heat. First aid provided. Ambulance on the way.',
      timestamp: '45 minutes ago',
      upvotes: 89,
      reportedBy: 'HealthcareTraveller'
    },
    {
      id: '4',
      title: 'Free WiFi and charging station',
      location: 'Connaught Place Central Park',
      category: 'Safety',
      description: 'Government setup free WiFi and mobile charging for tourists. Open 24/7.',
      timestamp: '1 hour ago',
      upvotes: 156,
      reportedBy: 'TechSavvyTourist'
    },
    {
      id: '5',
      title: 'Smog alert - poor air quality',
      location: 'Delhi NCR Region',
      category: 'Weather',
      description: 'AQI crossed 300. Wear masks and avoid outdoor activities. Especially for elderly tourists.',
      timestamp: '2 hours ago',
      upvotes: 203,
      reportedBy: 'WeatherWatchIndia'
    }
  ]);

  useEffect(() => {
    loadOnboardingStatus();
    
    // Simulate real-time location updates every 10 minutes
    const locationInterval = setInterval(() => {
      simulateLocationUpdate();
    }, 10 * 60 * 1000); // 10 minutes

    // Simulate safety score updates every 30 seconds for demo
    const safetyInterval = setInterval(() => {
      updateSafetyScore();
    }, 30 * 1000);

    // Simulate new community reports every 2 minutes
    const reportsInterval = setInterval(() => {
      addNewCommunityReport();
    }, 2 * 60 * 1000);

    return () => {
      clearInterval(locationInterval);
      clearInterval(safetyInterval);
      clearInterval(reportsInterval);
    };
  }, []);

  const simulateLocationUpdate = () => {
    const locations = [
      { lat: 28.6139, lng: 77.2090, location: 'India Gate, New Delhi' },
      { lat: 28.6562, lng: 77.2410, location: 'Connaught Place, New Delhi' },
      { lat: 28.6279, lng: 77.2185, location: 'Lotus Temple, New Delhi' },
      { lat: 28.6507, lng: 77.2334, location: 'Red Fort, New Delhi' },
      { lat: 28.6596, lng: 77.2350, location: 'Chandni Chowk, New Delhi' },
    ];
    
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    setCurrentLocation({ lat: randomLocation.lat, lng: randomLocation.lng });
    setLastLocationUpdate(new Date().toISOString());
    
    // Update location history
    setTouristProfile(prev => ({
      ...prev,
      lastActiveTime: new Date().toISOString(),
      locationHistory: [
        {
          timestamp: new Date().toISOString(),
          lat: randomLocation.lat,
          lng: randomLocation.lng,
          location: randomLocation.location
        },
        ...prev.locationHistory.slice(0, 4) // Keep last 5 locations
      ]
    }));
  };

  const updateSafetyScore = () => {
    setSafetyScore(prev => {
      const variance = 5; // ±5 points variation
      const newOverall = Math.max(60, Math.min(95, prev.overall + (Math.random() - 0.5) * variance));
      const newRouteRisk = Math.max(70, Math.min(100, prev.routeRisk + (Math.random() - 0.5) * variance));
      const newActivityness = Math.max(60, Math.min(90, prev.activeness + (Math.random() - 0.5) * variance));
      
      let badge: SafetyScore['badge'] = 'Safe Explorer';
      if (newOverall >= 90) badge = 'Safety Champion';
      else if (newOverall >= 80) badge = 'Adventure Seeker';
      else if (newOverall >= 70) badge = 'Safe Explorer';
      else if (newOverall >= 60) badge = 'Cautious Traveler';
      else badge = 'At Risk';

      return {
        ...prev,
        overall: Math.round(newOverall),
        routeRisk: Math.round(newRouteRisk),
        activeness: Math.round(newActivityness),
        badge
      };
    });
  };

  const addNewCommunityReport = () => {
    const newReports = [
      {
        title: 'Free water distribution',
        location: 'Metro Station Exit',
        category: 'Safety' as const,
        description: 'NGO providing free water to tourists. Very helpful in this heat!',
        reportedBy: 'HelpfulTourist'
      },
      {
        title: 'Street food vendor verified',
        location: 'Parathe Wali Gali',
        category: 'Safety' as const,
        description: 'This vendor has clean setup and good hygiene. Recommended!',
        reportedBy: 'FoodieExplorer'
      },
      {
        title: 'Construction work ahead',
        location: 'Rajpath',
        category: 'Roadblock' as const,
        description: 'Republic Day preparations. Expect delays and road closures.',
        reportedBy: 'LocalGuide'
      },
      {
        title: 'Tourist assistance center',
        location: 'Red Fort Gate',
        category: 'Safety' as const,
        description: 'Government setup tourist help desk with multilingual support.',
        reportedBy: 'OfficialUpdate'
      }
    ];

    const randomReport = newReports[Math.floor(Math.random() * newReports.length)];
    const newReport: CommunityReport = {
      id: Date.now().toString(),
      ...randomReport,
      timestamp: 'Just now',
      upvotes: Math.floor(Math.random() * 20) + 1
    };

    setCommunityReports(prev => [newReport, ...prev.slice(0, 7)]); // Keep latest 8 reports
  };

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
    toggleLanguage,
    lastLocationUpdate,
    alertCount,
    realTimeUpdates,
    simulateLocationUpdate,
    updateSafetyScore,
    addNewCommunityReport,
    setTouristProfile,
    setSafetyScore,
    setItinerary,
    setCommunityReports,
    setAlertCount,
    setRealTimeUpdates
  };
});