import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { 
  AuthAPI, 
  RegisterRequest, 
  LoginRequest, 
  KYCSubmitRequest,
  ApiError,
  UserProfile,
  KYCStatusResponse
} from '@/services/auth';
import Toast from 'react-native-toast-message';

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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TripStatistics {
  totalTrips: number;
  completedTrips: number;
  activeTripId?: string;
  activeTripTitle?: string;
  activeTripStartDate?: string;
  totalDistance: number; // in km
  averageSafetyScore: number;
  lastTripDate?: string;
  totalTimeSpent: number; // in hours
}

export interface KYCData {
  aadhaarNumber: string;
  dateOfBirth: string;
}

export const [SafeTrailsProvider, useSafeTrails] = createContextHook(() => {
  // ============================================================================
  // AUTHENTICATION STATE & FUNCTIONS
  // ============================================================================

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [hasCompletedKYC, setHasCompletedKYC] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING');
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

  // Trip Statistics State
  const [tripStatistics, setTripStatistics] = useState<TripStatistics>({
    totalTrips: 5,
    completedTrips: 4,
    activeTripId: user?.isActive ? 'trip-001' : undefined,
    activeTripTitle: user?.isActive ? 'Delhi Heritage Tour' : undefined,
    activeTripStartDate: user?.isActive ? '2025-09-13T10:00:00Z' : undefined,
    totalDistance: 234.7,
    averageSafetyScore: 89.2,
    lastTripDate: '2025-09-10T18:30:00Z',
    totalTimeSpent: 48.5,
  });

  useEffect(() => {
    loadAppState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAppState = async () => {
    try {
      const [onboardingStatus, kycStatus, authStatus, userData] = await Promise.all([
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('hasCompletedKYC'),
        AsyncStorage.getItem('isAuthenticated'),
        AsyncStorage.getItem('user')
      ]);

      setHasCompletedOnboarding(onboardingStatus === 'true');
      setIsAuthenticated(authStatus === 'true');

      if (userData) {
        setUser(JSON.parse(userData));
      }

      // If authenticated, check KYC status from API
      if (authStatus === 'true') {
        await checkKYCStatus();
      } else {
        setHasCompletedKYC(kycStatus === 'true');
      }
    } catch (error) {
      console.log('Error loading app state:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load app data. Please restart the app.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check KYC status from API
   * TODO: This will call the real backend when ready
   */
  const checkKYCStatus = async (shouldNavigate: boolean = false) => {
    try {
      const response = await AuthAPI.getKYCStatus();
      
      if (response.kycApplication) {
        const status = response.kycApplication.status;
        const wasApproved = status === 'APPROVED';
        
        setKycStatus(status);
        setHasCompletedKYC(wasApproved);
        
        // Save KYC status to local storage for offline access
        await AsyncStorage.setItem('hasCompletedKYC', wasApproved ? 'true' : 'false');
        await AsyncStorage.setItem('kycApplicationStatus', status);
        
        // Navigate to dashboard if KYC is approved and navigation is requested
        if (shouldNavigate && wasApproved) {
          Toast.show({
            type: 'success',
            text1: 'KYC Approved! 🎉',
            text2: 'Welcome to SafeTrails dashboard',
          });
          
          setTimeout(() => {
            router.replace('/(tabs)/dashboard');
          }, 1500);
        }
        
        return { status, wasApproved };
      } else {
        setKycStatus('PENDING');
        setHasCompletedKYC(false);
        await AsyncStorage.setItem('hasCompletedKYC', 'false');
        return { status: 'PENDING', wasApproved: false };
      }
    } catch (error) {
      console.log('Error checking KYC status:', error);
      // Fall back to local storage value if API fails
      const localKycStatus = await AsyncStorage.getItem('hasCompletedKYC');
      setHasCompletedKYC(localKycStatus === 'true');
      return { status: 'ERROR', wasApproved: localKycStatus === 'true' };
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

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  /**
   * Register a new user account
   * TODO: This calls the API service which will connect to backend when ready
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await AuthAPI.register(data);
      
      // Save auth token
      await AuthAPI.saveAuthToken(response.token);
      
      // Save user data and auth state
      await Promise.all([
        AsyncStorage.setItem('isAuthenticated', 'true'),
        AsyncStorage.setItem('user', JSON.stringify(response.user))
      ]);

      setUser(response.user);
      setIsAuthenticated(true);
      
      // Check KYC status and navigate accordingly
      const kycResponse = await AuthAPI.getKYCStatus();
      let shouldGoToDashboard = false;
      
      if (kycResponse.kycApplication && kycResponse.kycApplication.status === 'APPROVED') {
        setKycStatus('APPROVED');
        setHasCompletedKYC(true);
        await AsyncStorage.setItem('hasCompletedKYC', 'true');
        shouldGoToDashboard = true;
      } else {
        setKycStatus('PENDING');
        setHasCompletedKYC(false);
        await AsyncStorage.setItem('hasCompletedKYC', 'false');
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Account created successfully',
      });

      // Navigate based on KYC status
      setTimeout(() => {
        if (shouldGoToDashboard) {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/kyc');
        }
      }, 1000);

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: apiError.message,
      });
      throw error;
    }
  };

  /**
   * Login with email and password
   * TODO: This calls the API service which will connect to backend when ready
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.login({ email, password });
      
      // Save auth token
      await AuthAPI.saveAuthToken(response.token);
      
      // Save user data and auth state
      await Promise.all([
        AsyncStorage.setItem('isAuthenticated', 'true'),
        AsyncStorage.setItem('user', JSON.stringify(response.user))
      ]);

      setUser(response.user);
      setIsAuthenticated(true);

      // Check KYC status and navigate accordingly
      const kycResponse = await AuthAPI.getKYCStatus();
      let shouldGoToDashboard = false;
      
      if (kycResponse.kycApplication && kycResponse.kycApplication.status === 'APPROVED') {
        setKycStatus('APPROVED');
        setHasCompletedKYC(true);
        await AsyncStorage.setItem('hasCompletedKYC', 'true');
        shouldGoToDashboard = true;
      } else {
        const status = kycResponse.kycApplication?.status || 'PENDING';
        setKycStatus(status as any);
        setHasCompletedKYC(false);
        await AsyncStorage.setItem('hasCompletedKYC', 'false');
      }
      
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Logged in successfully',
      });

      // Navigate based on KYC status
      setTimeout(() => {
        if (shouldGoToDashboard) {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/kyc');
        }
      }, 1000);

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: apiError.message,
      });
      throw error;
    }
  };

  /**
   * Submit KYC application
   * TODO: This calls the API service which will connect to backend when ready
   */
  const submitKYC = async (data: KYCSubmitRequest) => {
    try {
      const response = await AuthAPI.submitKYC(data);
      
      setKycStatus('SUBMITTED');
      await AsyncStorage.setItem('kycApplicationStatus', 'SUBMITTED');
      
      Toast.show({
        type: 'success',
        text1: 'KYC Submitted',
        text2: 'Your application is under review',
      });

      return response;
    } catch (error) {
      const apiError = error as ApiError;
      Toast.show({
        type: 'error',
        text1: 'KYC Submission Failed',
        text2: apiError.message,
      });
      throw error;
    }
  };

  /**
   * Complete KYC process (for backward compatibility)
   */
  const completeKYC = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedKYC', 'true');
      setHasCompletedKYC(true);
      setKycStatus('APPROVED');
    } catch (error) {
      console.log('Error saving KYC status:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save KYC status',
      });
    }
  };

  /**
   * Logout user and clear all auth data
   */
  const logout = async () => {
    try {
      await Promise.all([
        AuthAPI.removeAuthToken(),
        AsyncStorage.removeItem('isAuthenticated'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('hasCompletedKYC'),
        AsyncStorage.removeItem('kycApplicationStatus')
      ]);

      setUser(null);
      setIsAuthenticated(false);
      setHasCompletedKYC(false);
      setKycStatus('PENDING');
      
      Toast.show({
        type: 'info',
        text1: 'Logged out',
        text2: 'See you next time!',
      });
    } catch (error) {
      console.log('Error clearing auth state:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout properly',
      });
    }
  };

  return {
    // Onboarding
    hasCompletedOnboarding,
    completeOnboarding,
    
    // Authentication 
    isAuthenticated,
    user,
    login,
    register,
    logout,
    
    // KYC
    hasCompletedKYC,
    kycStatus,
    completeKYC,
    submitKYC,
    checkKYCStatus,
    
    // App State
    isLoading,
    
    // App Features (existing)
    touristProfile,
    safetyScore,
    itinerary,
    communityReports,
    tripStatistics,
    currentLocation,
    isInDangerZone,
    updateLocation,
    language,
    toggleLanguage,
  };
});
