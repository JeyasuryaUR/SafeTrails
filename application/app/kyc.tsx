import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock,
  AlertCircle,
  XCircle 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function KYCScreen() {
  const { submitKYC, checkKYCStatus, kycStatus, isAuthenticated } = useSafeTrails();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentKycStatus, setCurrentKycStatus] = useState<string>('PENDING');
  
  // KYC Form data
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: '',
    documentType: 'AADHAAR' as const,
    documentNumber: '',
    documentImage: 'placeholder_document_base64',
    selfieImage: 'placeholder_selfie_base64',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }
    loadKYCStatus(false); // Don't navigate on initial load
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadKYCStatus = async (shouldNavigate: boolean = false) => {
    try {
      setStatusLoading(true);
      const result = await checkKYCStatus(shouldNavigate);
      setCurrentKycStatus(result?.status || kycStatus);
    } catch (error) {
      console.log('Error checking KYC status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const validateForm = () => {
    const { aadhaarNumber, fullName, dateOfBirth, address, phoneNumber, email } = formData;
    
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Aadhaar',
        text2: 'Please enter a valid 12-digit Aadhaar number',
      });
      return false;
    }

    if (!fullName || fullName.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Please enter your full name',
      });
      return false;
    }

    if (!dateOfBirth) {
      Toast.show({
        type: 'error',
        text1: 'Missing Date',
        text2: 'Please enter your date of birth',
      });
      return false;
    }

    if (!address || address.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Address',
        text2: 'Please enter your complete address',
      });
      return false;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone',
        text2: 'Please enter a valid phone number',
      });
      return false;
    }

    if (!email || !email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    return true;
  };

  const handleSubmitKYC = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await submitKYC(formData);
      
      Toast.show({
        type: 'success',
        text1: 'KYC Submitted!',
        text2: 'Your application is being reviewed',
      });
      
      // Refresh status after submission - enable navigation in case it's instantly approved
      await loadKYCStatus(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Failed to submit KYC application',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.replace('/(tabs)/dashboard');
  };

  const getStatusIcon = () => {
    switch (currentKycStatus) {
      case 'APPROVED':
        return <CheckCircle size={24} color="#10B981" />;
      case 'REJECTED':
        return <XCircle size={24} color="#EF4444" />;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return <Clock size={24} color="#F59E0B" />;
      default:
        return <AlertCircle size={24} color="#6B7280" />;
    }
  };

  const getStatusMessage = () => {
    switch (currentKycStatus) {
      case 'APPROVED':
        return {
          title: 'KYC Verified ✓',
          message: 'Your identity has been successfully verified. You can now access all SafeTrails features.',
          color: '#10B981',
        };
      case 'REJECTED':
        return {
          title: 'KYC Rejected',
          message: 'Your application was rejected. Please contact support or submit a new application.',
          color: '#EF4444',
        };
      case 'UNDER_REVIEW':
        return {
          title: 'Under Review',
          message: 'Your KYC application is being reviewed by our team. This usually takes 24-48 hours.',
          color: '#F59E0B',
        };
      case 'SUBMITTED':
        return {
          title: 'Application Submitted',
          message: 'Your KYC application has been submitted and is awaiting review.',
          color: '#F59E0B',
        };
      default:
        return {
          title: 'KYC Verification Required',
          message: 'Complete your KYC verification to access all SafeTrails features.',
          color: '#6B7280',
        };
    }
  };

  if (statusLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1E40AF', '#2563EB', '#3B82F6']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Checking KYC Status...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const statusInfo = getStatusMessage();

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1E40AF', '#2563EB', '#3B82F6']} style={styles.gradient}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>KYC Verification</Text>
            <Text style={styles.subtitle}>Identity Verification</Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {getStatusIcon()}
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                  {statusInfo.title}
                </Text>
                <Text style={styles.statusMessage}>{statusInfo.message}</Text>
              </View>
            </View>

            {currentKycStatus === 'APPROVED' && (
              <TouchableOpacity style={styles.dashboardButton} onPress={handleGoToDashboard}>
                <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Show form only if KYC is pending or rejected */}
          {(currentKycStatus === 'PENDING' || currentKycStatus === 'REJECTED') && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Complete Your KYC</Text>
              <Text style={styles.formSubtitle}>
                Please provide accurate information for identity verification
              </Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <FileText size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Aadhaar Number"
                    placeholderTextColor="#6B7280"
                    value={formData.aadhaarNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, aadhaarNumber: text }))}
                    keyboardType="numeric"
                    maxLength={12}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <User size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Full Name (as per Aadhaar)"
                    placeholderTextColor="#6B7280"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Date of Birth (DD/MM/YYYY)"
                    placeholderTextColor="#6B7280"
                    value={formData.dateOfBirth}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, dateOfBirth: text }))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.multilineInput]}
                    placeholder="Complete Address"
                    placeholderTextColor="#6B7280"
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Phone size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Phone Number"
                    placeholderTextColor="#6B7280"
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor="#6B7280"
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FileText size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Document Number"
                    placeholderTextColor="#6B7280"
                    value={formData.documentNumber}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, documentNumber: text }))}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleSubmitKYC}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit KYC Application</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Show message for submitted/under review */}
          {(currentKycStatus === 'SUBMITTED' || currentKycStatus === 'UNDER_REVIEW') && (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingTitle}>Application In Progress</Text>
              <Text style={styles.waitingMessage}>
                Your KYC application is being processed. We&apos;ll notify you once the verification is complete.
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={() => loadKYCStatus(true)}>
                <Text style={styles.refreshButtonText}>Refresh Status</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  dashboardButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  dashboardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  waitingMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
