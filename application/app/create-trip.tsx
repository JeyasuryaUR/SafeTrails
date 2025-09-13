import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import Toast from 'react-native-toast-message';

interface TripData {
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
}

export default function CreateTripScreen() {
  const { language, loadUserProfile, createTrip } = useSafeTrails();
  
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startLocation: '',
    endLocation: '',
    startLatitude: 0,
    startLongitude: 0,
    endLatitude: 0,
    endLongitude: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleDateInput = (type: 'start' | 'end', value: string) => {
    // Simple date input handler - in a real app you'd use a proper date picker
    if (type === 'start') {
      setTripData(prev => ({ ...prev, startDate: value }));
    } else {
      setTripData(prev => ({ ...prev, endDate: value }));
    }
  };

  const validateForm = () => {
    if (!tripData.title.trim()) {
      Alert.alert('Error', 'Please enter a trip title');
      return false;
    }
    if (!tripData.description.trim()) {
      Alert.alert('Error', 'Please enter a trip description');
      return false;
    }
    if (!tripData.startDate) {
      Alert.alert('Error', 'Please select a start date');
      return false;
    }
    if (!tripData.endDate) {
      Alert.alert('Error', 'Please select an end date');
      return false;
    }
    if (!tripData.startLocation.trim()) {
      Alert.alert('Error', 'Please enter a start location');
      return false;
    }
    if (!tripData.endLocation.trim()) {
      Alert.alert('Error', 'Please enter an end location');
      return false;
    }
    
    // Check if end date is after start date
    if (new Date(tripData.endDate) <= new Date(tripData.startDate)) {
      Alert.alert('Error', 'End date must be after start date');
      return false;
    }
    
    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // For now, we'll use mock coordinates. In a real app, you'd geocode the addresses
      const tripPayload = {
        ...tripData,
        startLatitude: 28.6139, // Default Delhi coordinates
        startLongitude: 77.2090,
        endLatitude: 28.5562,   // Default Delhi Airport coordinates
        endLongitude: 77.1000,
      };

      console.log('Creating trip with data:', tripPayload);
      
      // Use the context's createTrip function
      await createTrip(tripPayload);

      // Refresh user profile to get updated trip status
      await loadUserProfile();
      
      // Navigate back to dashboard
      setTimeout(() => {
        router.back();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      Toast.show({
        type: 'error',
        text1: 'Trip Creation Failed',
        text2: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Create New Trip' : 'नई यात्रा बनाएं'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.form}>
          {/* Trip Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'Trip Title' : 'यात्रा शीर्षक'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={language === 'en' ? 'e.g., Delhi Heritage Tour' : 'उदा. दिल्ली विरासत दौरा'}
              value={tripData.title}
              onChangeText={(text) => setTripData(prev => ({ ...prev, title: text }))}
            />
          </View>

          {/* Trip Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'Description' : 'विवरण'}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={language === 'en' ? 'Describe your trip plans...' : 'अपनी यात्रा योजनाओं का वर्णन करें...'}
              value={tripData.description}
              onChangeText={(text) => setTripData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Start Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'Start Date & Time' : 'प्रारंभ दिनांक और समय'}
            </Text>
            <View style={styles.dateInput}>
              <Calendar color="#6B7280" size={20} />
              <TextInput
                style={styles.dateText}
                placeholder={language === 'en' ? 'YYYY-MM-DDTHH:mm:ssZ (e.g., 2025-02-01T10:00:00Z)' : 'YYYY-MM-DDTHH:mm:ssZ'}
                value={tripData.startDate}
                onChangeText={(text) => handleDateInput('start', text)}
              />
            </View>
          </View>

          {/* End Date */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'End Date & Time' : 'समाप्ति दिनांक और समय'}
            </Text>
            <View style={styles.dateInput}>
              <Calendar color="#6B7280" size={20} />
              <TextInput
                style={styles.dateText}
                placeholder={language === 'en' ? 'YYYY-MM-DDTHH:mm:ssZ (e.g., 2025-02-03T18:00:00Z)' : 'YYYY-MM-DDTHH:mm:ssZ'}
                value={tripData.endDate}
                onChangeText={(text) => handleDateInput('end', text)}
              />
            </View>
          </View>

          {/* Start Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'Start Location' : 'प्रारंभ स्थान'}
            </Text>
            <View style={styles.locationInput}>
              <MapPin color="#6B7280" size={20} />
              <TextInput
                style={styles.locationText}
                placeholder={language === 'en' ? 'e.g., New Delhi Railway Station' : 'उदा. नई दिल्ली रेलवे स्टेशन'}
                value={tripData.startLocation}
                onChangeText={(text) => setTripData(prev => ({ ...prev, startLocation: text }))}
              />
            </View>
          </View>

          {/* End Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {language === 'en' ? 'End Location' : 'समाप्ति स्थान'}
            </Text>
            <View style={styles.locationInput}>
              <MapPin color="#6B7280" size={20} />
              <TextInput
                style={styles.locationText}
                placeholder={language === 'en' ? 'e.g., Indira Gandhi International Airport' : 'उदा. इंदिरा गांधी अंतर्राष्ट्रीय हवाई अड्डा'}
                value={tripData.endLocation}
                onChangeText={(text) => setTripData(prev => ({ ...prev, endLocation: text }))}
              />
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateTrip}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#10B981', '#059669']}
              style={styles.createButtonGradient}
            >
              {isLoading ? (
                <Clock color="white" size={24} />
              ) : (
                <CheckCircle color="white" size={24} />
              )}
              <Text style={styles.createButtonText}>
                {isLoading 
                  ? (language === 'en' ? 'Creating Trip...' : 'यात्रा बनाई जा रही है...')
                  : (language === 'en' ? 'Create Trip' : 'यात्रा बनाएं')
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            {language === 'en' ? 'What happens next?' : 'आगे क्या होगा?'}
          </Text>
          <Text style={styles.infoText}>
            {language === 'en' 
              ? '• Your trip will be activated and real-time tracking will begin\n• Emergency contacts will be notified\n• Safety monitoring will start automatically\n• You can view your trip progress on the dashboard'
              : '• आपकी यात्रा सक्रिय हो जाएगी और रीयल-टाइम ट्रैकिंग शुरू हो जाएगी\n• आपातकालीन संपर्कों को सूचित किया जाएगा\n• सुरक्षा निगरानी स्वचालित रूप से शुरू हो जाएगी\n• आप डैशबोर्ड पर अपनी यात्रा की प्रगति देख सकते हैं'
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F9FAFB',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    flex: 1,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F9FAFB',
  },
  locationText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    flex: 1,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
