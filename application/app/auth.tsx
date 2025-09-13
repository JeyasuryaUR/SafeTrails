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
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { CustomInputField } from '@/components/CustomInputField';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, completeOnboarding } = useSafeTrails();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        Alert.alert('Error', 'Name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
      if (!formData.phone) {
        Alert.alert('Error', 'Phone number is required');
        return false;
      }
      if (!formData.emergencyContact || !formData.emergencyPhone) {
        Alert.alert('Error', 'Emergency contact details are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isLogin) {
        // Handle login
        await login(formData.email, formData.password);
        Alert.alert(
          'Success',
          'Login successful!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/dashboard');
              }
            }
          ]
        );
      } else {
        // Handle signup - first login the user, then complete onboarding
        await login(formData.email, formData.password);
        await completeOnboarding();
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(tabs)/dashboard');
              }
            }
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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
              <MaterialIcons name="security" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>SafeTrails</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {!isLogin && (
              <CustomInputField
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter your full name"
                icon="person-outline"
                iconFamily="ionicons"
              />
            )}

            <CustomInputField
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              icon="mail-outline"
              iconFamily="ionicons"
            />

            <CustomInputField
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              showPasswordToggle={true}
              showPassword={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
              icon="lock-closed-outline"
              iconFamily="ionicons"
            />

            {!isLogin && (
              <>
                <CustomInputField
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  showPasswordToggle={true}
                  showPassword={showConfirmPassword}
                  onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  icon="lock-closed-outline"
                  iconFamily="ionicons"
                />

                <CustomInputField
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  icon="call-outline"
                  iconFamily="ionicons"
                />

                <CustomInputField
                  label="Emergency Contact Name"
                  value={formData.emergencyContact}
                  onChangeText={(text) => updateFormData('emergencyContact', text)}
                  placeholder="Emergency contact name"
                  icon="people-outline"
                  iconFamily="ionicons"
                />

                <CustomInputField
                  label="Emergency Contact Phone"
                  value={formData.emergencyPhone}
                  onChangeText={(text) => updateFormData('emergencyPhone', text)}
                  placeholder="Emergency contact phone"
                  keyboardType="phone-pad"
                  icon="call-outline"
                  iconFamily="ionicons"
                />
              </>
            )}

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
                  <Text style={styles.submitText}>Processing...</Text>
                ) : (
                  <Text style={styles.submitText}>
                    {isLogin ? 'Login' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.footerLink}>
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  submitButton: {
    marginTop: 24,
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
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
