import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for development and testing
 * TODO: Remove these in production
 */

export class DevTools {
  /**
   * Clear all app data (useful for testing)
   */
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        'hasCompletedOnboarding',
        'hasCompletedKYC',
        'isAuthenticated',
        'user',
        'authToken',
        'kycApplicationStatus',
        'mockKYCStatus'
      ]);
      console.log('✅ All app data cleared');
      return true;
    } catch (error) {
      console.log('❌ Error clearing app data:', error);
      return false;
    }
  }

  /**
   * Set onboarding as completed (skip onboarding)
   */
  static async completeOnboarding() {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('✅ Onboarding marked as completed');
      return true;
    } catch (error) {
      console.log('❌ Error setting onboarding:', error);
      return false;
    }
  }

  /**
   * Mock a logged-in user (skip auth)
   */
  static async mockLoggedInUser() {
    try {
      const mockUser = {
        id: 'dev_user_123',
        email: 'dev@safetrails.com',
        firstName: 'Dev',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.multiSet([
        ['isAuthenticated', 'true'],
        ['user', JSON.stringify(mockUser)],
        ['authToken', 'dev_mock_token_123'],
      ]);
      
      console.log('✅ Mock user logged in');
      return true;
    } catch (error) {
      console.log('❌ Error mocking user:', error);
      return false;
    }
  }

  /**
   * Mock approved KYC status
   */
  static async mockApprovedKYC() {
    try {
      await AsyncStorage.multiSet([
        ['hasCompletedKYC', 'true'],
        ['mockKYCStatus', 'APPROVED'],
      ]);
      console.log('✅ KYC marked as approved');
      return true;
    } catch (error) {
      console.log('❌ Error setting KYC:', error);
      return false;
    }
  }

  /**
   * Mock submitted KYC status (for testing submission flow)
   */
  static async mockSubmittedKYC() {
    try {
      await AsyncStorage.multiSet([
        ['hasCompletedKYC', 'false'],
        ['mockKYCStatus', 'SUBMITTED'],
      ]);
      console.log('✅ KYC marked as submitted');
      return true;
    } catch (error) {
      console.log('❌ Error setting KYC:', error);
      return false;
    }
  }

  /**
   * Simulate KYC approval (for testing the approval flow from KYC page)
   */
  static async simulateKYCApproval() {
    try {
      await AsyncStorage.multiSet([
        ['hasCompletedKYC', 'true'],
        ['mockKYCStatus', 'APPROVED'],
      ]);
      console.log('🎉 KYC approved! Should navigate to dashboard on next refresh');
      return true;
    } catch (error) {
      console.log('❌ Error approving KYC:', error);
      return false;
    }
  }

  /**
   * Quick setup for testing dashboard
   */
  static async quickSetupForDashboard() {
    try {
      await this.clearAllData();
      await this.completeOnboarding();
      await this.mockLoggedInUser();
      await this.mockApprovedKYC();
      console.log('🚀 Quick setup complete - should go to dashboard');
      return true;
    } catch (error) {
      console.log('❌ Error in quick setup:', error);
      return false;
    }
  }

  /**
   * Print current app state
   */
  static async printCurrentState() {
    try {
      const [onboarding, auth, kyc, user] = await Promise.all([
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('isAuthenticated'),
        AsyncStorage.getItem('hasCompletedKYC'),
        AsyncStorage.getItem('user'),
      ]);

      console.log('📱 Current App State:');
      console.log('  Onboarding:', onboarding);
      console.log('  Authenticated:', auth);
      console.log('  KYC Completed:', kyc);
      console.log('  User:', user ? 'Present' : 'None');
    } catch (error) {
      console.log('❌ Error reading state:', error);
    }
  }
}

// Export for use in development
if (__DEV__) {
  // Make available globally for easy testing
  (global as any).DevTools = DevTools;
  console.log('🛠️ DevTools available globally. Try:');
  console.log('  DevTools.clearAllData() - Reset everything');
  console.log('  DevTools.quickSetupForDashboard() - Go straight to dashboard');
  console.log('  DevTools.simulateKYCApproval() - Test KYC approval flow');
}
