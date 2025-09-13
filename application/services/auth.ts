import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Environment-based API configuration
const getApiBaseUrl = () => {
  // Check if we have an environment variable for API URL
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Default to localhost for development
  console.log('Using default localhost API URL');
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: string;
    updatedAt?: string;
    isActive?: boolean;
  };
  token: string;
}

export interface UserProfile {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    updatedAt: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface KYCSubmitRequest {
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  email: string;
  documentType: 'AADHAAR';
  documentNumber: string;
  documentImage: string;
  selfieImage: string;
}

export interface KYCSubmitResponse {
  message: string;
  application: {
    id: string;
    status: 'SUBMITTED';
    createdAt: string;
  };
}

export interface KYCStatusResponse {
  kycApplication: {
    id: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    adminComments?: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface UpdateEmergencyContactsRequest {
  contacts: EmergencyContact[];
}

export interface ItineraryItem {
  id?: string;
  location: string;
  landmark: string;
  latitude: number;
  longitude: number;
  plannedTime: string;
  order?: number;
  isCompleted?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  safetyScore?: number;
  createdAt: string;
  itineraryItems?: ItineraryItem[];
  _count?: {
    communityPosts: number;
    sosRequests: number;
    locationUpdates: number;
  };
}

export interface CreateTripRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  itineraryItems?: Omit<ItineraryItem, 'id' | 'order' | 'isCompleted'>[];
}

export interface TripsResponse {
  trips: Trip[];
}

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}

// ============================================================================
// REQUEST INTERCEPTOR - ADD AUTH TOKEN
// ============================================================================

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - HANDLE AUTH ERRORS
// ============================================================================

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      try {
        await AsyncStorage.multiRemove([
          'authToken',
          'user',
          'isAuthenticated',
          'hasCompletedKYC'
        ]);
      } catch (storageError) {
        console.log('Error clearing auth data:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTHENTICATION API FUNCTIONS
// ============================================================================

export class AuthAPI {
  
  /**
   * Register a new user account
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/login', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await apiClient.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      const response: AxiosResponse<UpdateProfileResponse> = await apiClient.put('/api/auth/profile', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await apiClient.put('/api/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Submit KYC application
   */
  static async submitKYC(data: KYCSubmitRequest): Promise<KYCSubmitResponse> {
    try {
      const response: AxiosResponse<KYCSubmitResponse> = await apiClient.post('/api/auth/kyc/submit', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Get KYC application status
   */
  static async getKYCStatus(): Promise<KYCStatusResponse> {
    try {
      console.log('Fetching KYC status from backend...');
      const response: AxiosResponse<KYCStatusResponse> = await apiClient.get('/api/auth/kyc/status');
      console.log('KYC Status response:', response.data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Update emergency contacts
   */
  static async updateEmergencyContacts(data: UpdateEmergencyContactsRequest): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await apiClient.put('/api/auth/emergency-contacts', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Handle API errors and convert to user-friendly messages
   */
  static handleApiError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        message: error.response.data?.message || 'An error occurred',
        error: error.response.data?.error,
        statusCode: error.response.status,
      };
      return apiError;
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      };
    } else {
      // Other error
      return {
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Save auth token to AsyncStorage
   */
  static async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.log('Error saving auth token:', error);
      throw error;
    }
  }

  /**
   * Remove auth token from AsyncStorage
   */
  static async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.log('Error removing auth token:', error);
      throw error;
    }
  }

  /**
   * Get auth token from AsyncStorage
   */
  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.log('Error getting auth token:', error);
      return null;
    }
  }

  // ============================================================================
  // TRIP MANAGEMENT API FUNCTIONS
  // ============================================================================

  /**
   * Get trips with optional filtering
   */
  static async getTrips(params?: {
    status?: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    limit?: number;
    offset?: number;
  }): Promise<TripsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `/api/trips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response: AxiosResponse<TripsResponse> = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Check if user has any active trips
   */
  static async hasActiveTrip(): Promise<{ hasActiveTrip: boolean; activeTrip?: Trip }> {
    try {
      const response = await this.getTrips({ status: 'ACTIVE', limit: 1 });
      const hasActiveTrip = response.trips.length > 0;
      const activeTrip = hasActiveTrip ? response.trips[0] : undefined;
      
      return { hasActiveTrip, activeTrip };
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Create a new trip
   */
  static async createTrip(data: CreateTripRequest): Promise<{ message: string; trip: Trip }> {
    try {
      const response: AxiosResponse<{ message: string; trip: Trip }> = await apiClient.post('/api/trips', data);
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Start a trip (change status from PLANNED to ACTIVE)
   */
  static async startTrip(tripId: string): Promise<{ message: string; trip: Trip }> {
    try {
    const response: AxiosResponse<{ message: string; trip: Trip }> = await apiClient.post(`/api/trips/${tripId}/start`, {
      startLatitude: 37.7749,  // Mock latitude (San Francisco)
      startLongitude: -122.4194  // Mock longitude (San Francisco)
    });
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * End a trip (change status from ACTIVE to COMPLETED)
   */
  static async endTrip(tripId: string): Promise<{ message: string; trip: Trip }> {
    try {
      const response: AxiosResponse<{ message: string; trip: Trip }> = await apiClient.post(`/api/trips/${tripId}/end`, {
        endLatitude: 37.7849,  // Mock end latitude 
        endLongitude: -122.4094  // Mock end longitude
      });
      return response.data;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }
}
