import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { CustomInputField } from '@/components/CustomInputField';

interface KYCFormData {
  aadharNumber: string;
  dateOfBirth: string;
}

export default function KYCScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<KYCFormData>({
    aadharNumber: '',
    dateOfBirth: ''
  });
  const safeTrailsContext = useSafeTrails();
  const { completeKYC } = safeTrailsContext;

  const updateFormData = (field: keyof KYCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatAadharNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 12 digits and add spaces every 4 digits
    const limited = cleaned.substring(0, 12);
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatDateOfBirth = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 8 digits (DDMMYYYY)
    const limited = cleaned.substring(0, 8);
    // Add slashes
    let formatted = limited;
    if (limited.length >= 2) {
      formatted = limited.substring(0, 2) + '/' + limited.substring(2);
    }
    if (limited.length >= 4) {
      formatted = limited.substring(0, 2) + '/' + limited.substring(2, 4) + '/' + limited.substring(4);
    }
    return formatted;
  };

  const handleAadharChange = (text: string) => {
    const formatted = formatAadharNumber(text);
    updateFormData('aadharNumber', formatted);
  };

  const handleDOBChange = (text: string) => {
    const formatted = formatDateOfBirth(text);
    updateFormData('dateOfBirth', formatted);
  };

  const validateForm = () => {
    const aadharDigits = formData.aadharNumber.replace(/\s/g, '');

    if (!aadharDigits || aadharDigits.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      return false;
    }

    if (!formData.dateOfBirth || formData.dateOfBirth.length !== 10) {
      Alert.alert('Error', 'Please enter a valid date of birth (DD/MM/YYYY)');
      return false;
    }

    // Validate date format
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = formData.dateOfBirth.match(dateRegex);

    if (!match) {
      Alert.alert('Error', 'Please enter date in DD/MM/YYYY format');
      return false;
    }

    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const now = new Date();

    if (date > now) {
      Alert.alert('Error', 'Date of birth cannot be in the future');
      return false;
    }

    const age = now.getFullYear() - date.getFullYear();
    if (age < 13 || age > 120) {
      Alert.alert('Error', 'Please enter a valid date of birth');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call for KYC verification
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store KYC data
      await completeKYC({
        aadharNumber: formData.aadharNumber.replace(/\s/g, ''),
        dateOfBirth: formData.dateOfBirth
      });

      // Alert.alert(
      //   'KYC Verification Successful',
      //   'Your identity has been verified successfully. Welcome to SafeTrails!',
      //   [
      //     {
      //       text: 'Continue',
      //       onPress: () => {
              router.replace('/(tabs)/dashboard');
      //       }
      //     }
      //   ]
      // );
    } catch {
      Alert.alert('Error', 'KYC verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="verified-user" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Identity Verification</Text>
            <Text style={styles.subtitle}>
              Complete your KYC to ensure secure travel verification
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.stepIndicator}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.completedStep]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.stepText, styles.completedStepText]}>Account</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, styles.activeStep]}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={[styles.stepText, styles.activeStepText]}>KYC</Text>
              </View>

              <View style={styles.stepLine} />

              <View style={styles.stepItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={styles.stepText}>Onboarding</Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialIcons name="info" size={24} color="#2563EB" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Why do we need this?</Text>
                <Text style={styles.infoText}>
                  Your Aadhar details help us create a secure digital identity for safe travel verification.
                </Text>
              </View>
            </View>

            {/* Form Fields */}
            <CustomInputField
              label="Aadhar Number"
              value={formData.aadharNumber}
              onChangeText={handleAadharChange}
              placeholder="1234 5678 9012"
              keyboardType="numeric"
              icon="credit-card"
              iconFamily="material"
              maxLength={14}
            />

            <CustomInputField
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChangeText={handleDOBChange}
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              icon="cake"
              iconFamily="material"
              maxLength={10}
            />

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialIcons name="security" size={20} color="#10B981" />
              <Text style={styles.securityText}>
                Your information is encrypted and stored securely
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#F59E0B', '#F97316']}
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="verified-user" size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>Verifying...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <MaterialIcons name="verified-user" size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>Verify Identity</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <MaterialIcons name="lock" size={16} color="#6B7280" />
              <Text style={styles.footerText}>
                Protected by 256-bit SSL encryption
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStep: {
    backgroundColor: '#2563EB',
  },
  completedStep: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  stepText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeStepText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  completedStepText: {
    color: '#10B981',
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});
