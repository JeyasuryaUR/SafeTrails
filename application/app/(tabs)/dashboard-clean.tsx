import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Globe,
  Activity,
  Users,
  Navigation,
  Play,
  BarChart3,
  Timer
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { 
    safetyScore, 
    touristProfile, 
    language, 
    toggleLanguage, 
    isInDangerZone,
    tripStatistics,
    user,
    loadUserProfile,
    hasActiveTrip,
    checkActiveTrip,
    trips,
    loadTrips,
    startTrip
  } = useSafeTrails();

  const [animatedScore] = useState(new Animated.Value(safetyScore.overall));
  
  // Determine if user is currently on a trip
  const isOnActiveTrip = hasActiveTrip;
  console.log('Current user status:', user);
  console.log('Has active trip:', hasActiveTrip);

  useEffect(() => {
    // Load user profile and check for active trips
    const loadData = async () => {
      try {
        await loadUserProfile();
        await checkActiveTrip();
        await loadTrips({ status: 'PLANNED' }); // Load planned trips for display
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [loadUserProfile, checkActiveTrip, loadTrips]);

  useEffect(() => {
    // Animate score changes
    Animated.timing(animatedScore, {
      toValue: safetyScore.overall,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [safetyScore.overall, animatedScore]);

  const handleStartTrip = () => {
    // Navigate to trip creation screen
    router.push('/create-trip');
  };

  const handleStartExistingTrip = async (tripId: string) => {
    try {
      await startTrip(tripId);
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const handleManageTrip = () => {
    Alert.alert(
      '📍 Manage Active Trip',
      'Your current trip: ' + (tripStatistics.activeTripTitle || 'Unknown Trip'),
      [
        { text: 'View Details', onPress: () => console.log('View trip details') },
        { text: 'End Trip', style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  const renderNoTripDashboard = () => (
    <>
      {/* Trip Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Travel Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
              <BarChart3 color="white" size={20} />
            </View>
            <Text style={styles.statValue}>{tripStatistics.totalTrips}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
              <CheckCircle color="white" size={20} />
            </View>
            <Text style={styles.statValue}>{tripStatistics.completedTrips}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B' }]}>
              <Navigation color="white" size={20} />
            </View>
            <Text style={styles.statValue}>{tripStatistics.totalDistance.toFixed(0)}km</Text>
            <Text style={styles.statLabel}>Total Distance</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' }]}>
              <Timer color="white" size={20} />
            </View>
            <Text style={styles.statValue}>{formatDuration(tripStatistics.totalTimeSpent)}</Text>
            <Text style={styles.statLabel}>Time Traveled</Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.additionalStatRow}>
            <Text style={styles.additionalStatLabel}>Average Safety Score</Text>
            <Text style={styles.additionalStatValue}>{tripStatistics.averageSafetyScore.toFixed(1)}/100</Text>
          </View>
          <View style={styles.additionalStatRow}>
            <Text style={styles.additionalStatLabel}>Last Trip</Text>
            <Text style={styles.additionalStatValue}>{formatDate(tripStatistics.lastTripDate)}</Text>
          </View>
        </View>
      </View>

      {/* Planned Trips */}
      <View style={styles.plannedTripsSection}>
        <Text style={styles.sectionTitle}>Your Planned Trips</Text>
        
        {trips.length > 0 ? (
          trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>{trip.title}</Text>
                <TouchableOpacity 
                  style={styles.startTripButton}
                  onPress={() => handleStartExistingTrip(trip.id)}
                >
                  <Play color="white" size={16} />
                  <Text style={styles.startTripButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tripDescription}>{trip.description}</Text>
              <View style={styles.tripDates}>
                <Text style={styles.tripDate}>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </Text>
              </View>
              <Text style={styles.tripLocation}>
                From: {trip.startLocation} → {trip.endLocation}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noTripsCard}>
            <Text style={styles.noTripsText}>No planned trips yet</Text>
            <Text style={styles.noTripsSubtext}>Create your first trip to get started!</Text>
          </View>
        )}
      </View>

      {/* Start Trip Section */}
      <View style={styles.startTripSection}>
        <Text style={styles.sectionTitle}>Ready for Your Next Adventure?</Text>
        <Text style={styles.sectionSubtitle}>
          Plan and start a new safe journey with real-time monitoring and community support.
        </Text>
        
        <TouchableOpacity style={styles.createTripButton} onPress={handleStartTrip}>
          <Play color="white" size={24} />
          <Text style={styles.createTripButtonText}>Create New Trip</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Shield color="#3B82F6" size={20} />
            <Text style={styles.featureText}>Real-time safety monitoring</Text>
          </View>
          <View style={styles.feature}>
            <Users color="#10B981" size={20} />
            <Text style={styles.featureText}>Community support network</Text>
          </View>
          <View style={styles.feature}>
            <Activity color="#F59E0B" size={20} />
            <Text style={styles.featureText}>Live location tracking</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderActiveTripDashboard = () => (
    <>
      {/* Active Trip Header */}
      <View style={styles.activeTripHeader}>
        <Text style={styles.activeTripTitle}>🚀 Trip in Progress</Text>
        <Text style={styles.activeTripName}>{tripStatistics.activeTripTitle}</Text>
      </View>

      {/* Trip Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#10B981' }]}>
            <MapPin color="white" size={20} />
          </View>
          <Text style={styles.metricValue}>{safetyScore.routeRisk}</Text>
          <Text style={styles.metricLabel}>Route Safety</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#3B82F6' }]}>
            <CheckCircle color="white" size={20} />
          </View>
          <Text style={styles.metricValue}>{safetyScore.itineraryChecks}</Text>
          <Text style={styles.metricLabel}>Itinerary Checks</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#F59E0B' }]}>
            <TrendingUp color="white" size={20} />
          </View>
          <Text style={styles.metricValue}>{safetyScore.activeness}</Text>
          <Text style={styles.metricLabel}>Activity Level</Text>
        </View>
      </View>

      {/* Trip Actions */}
      <View style={styles.activeTripSection}>
        <Text style={styles.sectionTitle}>Trip Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/map')}
        >
          <MapPin color="#10B981" size={24} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Live Location</Text>
            <Text style={styles.actionSubtitle}>Track your current position & route</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={handleManageTrip}
        >
          <Activity color="#3B82F6" size={24} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Trip</Text>
            <Text style={styles.actionSubtitle}>View details & trip controls</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.emergencyCard]}
          onPress={() => router.push('/sos')}
        >
          <AlertTriangle color="#EF4444" size={24} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Emergency SOS</Text>
            <Text style={styles.actionSubtitle}>Immediate help & alert contacts</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderDashboardContent = () => {
    if (isOnActiveTrip) {
      return renderActiveTripDashboard();
    } else {
      return renderNoTripDashboard();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              {language === 'en' ? 'Welcome back,' : 'वापसी पर स्वागत है,'}
            </Text>
            <Text style={styles.userName}>{touristProfile.name}</Text>
          </View>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageToggle}>
            <Globe color="white" size={20} />
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {isInDangerZone && (
          <View style={styles.alertBanner}>
            <AlertTriangle color="#EF4444" size={20} />
            <Text style={styles.alertText}>
              {language === 'en' 
                ? '⚠️ You are in a high-risk area' 
                : '⚠️ आप एक उच्च जोखिम क्षेत्र में हैं'}
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        {renderDashboardContent()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  alertText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Stats Section (No Trip State)
  statsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  // Planned Trips Section
  plannedTripsSection: {
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  startTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startTripButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  tripDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  tripDates: {
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tripLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  noTripsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noTripsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  noTripsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Start Trip Section
  startTripSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 24,
  },
  createTripButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  features: {
    alignSelf: 'stretch',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  // Active Trip State
  activeTripHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  activeTripName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTripSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  actionContent: {
    marginLeft: 16,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
