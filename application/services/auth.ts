import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Environment-based API configuration
// TODO: Update this URL when backend is deployed
const getApiBaseUrl = () => {
  // Check if we have an environment variable for API URL
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envApiUrl) {
    console.log('Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Default to localhost for development
  // This will use mock data since the backend isn't running
  console.log('No API URL found in environment, using mock data mode');
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();
const USE_MOCK_DATA = !process.env.EXPO_PUBLIC_API_URL;

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
   * TODO: Replace with actual backend endpoint when ready
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/register', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const mockResponse: AuthResponse = {
        message: 'User created successfully',
        user: {
          id: `user_${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          createdAt: new Date().toISOString(),
        },
        token: `mock_token_${Date.now()}`
      };
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Login with email and password
   * TODO: Replace with actual backend endpoint when ready
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/login', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const mockResponse: AuthResponse = {
        message: 'Login successful',
        user: {
          id: 'user_12345',
          email: data.email,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          createdAt: '2025-01-13T10:30:00.000Z',
          isActive: true,
        },
        token: `mock_token_${Date.now()}`
      };
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Get current user profile
   * TODO: Replace with actual backend endpoint when ready
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<UserProfile> = await apiClient.get('/api/auth/profile');
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      const mockResponse: UserProfile = {
        user: {
          id: 'user_12345',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          isActive: true,
          createdAt: '2025-01-13T10:30:00.000Z',
          updatedAt: '2025-01-13T10:30:00.000Z',
        }
      };
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Update user profile
   * TODO: Replace with actual backend endpoint when ready
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<UpdateProfileResponse> = await apiClient.put('/api/auth/profile', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
      
      const mockResponse: UpdateProfileResponse = {
        message: 'Profile updated successfully',
        user: {
          id: 'user_12345',
          email: 'john.doe@example.com',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          updatedAt: new Date().toISOString(),
        }
      };
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Change user password
   * TODO: Replace with actual backend endpoint when ready
   */
  static async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<{ message: string }> = await apiClient.put('/api/auth/change-password', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      return { message: 'Password changed successfully' };
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Submit KYC application
   * TODO: Replace with actual backend endpoint when ready
   */
  static async submitKYC(data: KYCSubmitRequest): Promise<KYCSubmitResponse> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<KYCSubmitResponse> = await apiClient.post('/api/auth/kyc/submit', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const mockResponse: KYCSubmitResponse = {
        message: 'KYC application submitted successfully',
        application: {
          id: `kyc_${Date.now()}`,
          status: 'SUBMITTED',
          createdAt: new Date().toISOString(),
        }
      };
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Get KYC application status
   * TODO: Replace with actual backend endpoint when ready
   */
  static async getKYCStatus(): Promise<KYCStatusResponse> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<KYCStatusResponse> = await apiClient.get('/api/auth/kyc/status');
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      
      // Simulate different KYC states based on local storage for demo
      const kycStatus = await AsyncStorage.getItem('mockKYCStatus') || 'PENDING';
      
      let mockResponse: KYCStatusResponse;
      
      if (kycStatus === 'APPROVED') {
        mockResponse = {
          kycApplication: {
            id: 'kyc_12345',
            status: 'APPROVED',
            adminComments: 'Documents verified successfully',
            verifiedAt: '2025-01-13T12:00:00.000Z',
            createdAt: '2025-01-13T10:30:00.000Z',
            updatedAt: '2025-01-13T12:00:00.000Z',
          }
        };
      } else if (kycStatus === 'SUBMITTED') {
        mockResponse = {
          kycApplication: {
            id: 'kyc_12345',
            status: 'SUBMITTED',
            createdAt: '2025-01-13T10:30:00.000Z',
            updatedAt: '2025-01-13T10:30:00.000Z',
          }
        };
      } else {
        mockResponse = {
          kycApplication: null
        };
      }
      
      return mockResponse;
    } catch (error) {
      throw AuthAPI.handleApiError(error);
    }
  }

  /**
   * Update emergency contacts
   * TODO: Replace with actual backend endpoint when ready
   */
  static async updateEmergencyContacts(data: UpdateEmergencyContactsRequest): Promise<{ message: string }> {
    try {
      // TODO: Uncomment when backend is ready
      // const response: AxiosResponse<{ message: string }> = await apiClient.put('/api/auth/emergency-contacts', data);
      // return response.data;

      // MOCK IMPLEMENTATION - Remove when backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      return { message: 'Emergency contacts updated successfully' };
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
  private static handleApiError(error: any): ApiError {
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
}

// ============================================================================
// MOCK DATA HELPERS (Remove when backend is ready)
// ============================================================================

export class MockKYCHelper {
  /**
   * Simulate KYC approval (for testing UI flow)
   */
  static async approveKYC(): Promise<void> {
    await AsyncStorage.setItem('mockKYCStatus', 'APPROVED');
  }

  /**
   * Simulate KYC submission (for testing UI flow)
   */
  static async submitKYC(): Promise<void> {
    await AsyncStorage.setItem('mockKYCStatus', 'SUBMITTED');
  }

  /**
   * Reset KYC status (for testing UI flow)
   */
  static async resetKYC(): Promise<void> {
    await AsyncStorage.removeItem('mockKYCStatus');
  }
}
