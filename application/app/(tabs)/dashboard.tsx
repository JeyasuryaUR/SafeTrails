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
    user
  } = useSafeTrails();

  const [animatedScore] = useState(new Animated.Value(safetyScore.overall));
  
  // Determine if user is currently on a trip
  const isOnActiveTrip = user?.isActive === true;

  useEffect(() => {
    // Animate score changes
    Animated.timing(animatedScore, {
      toValue: safetyScore.overall,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [safetyScore.overall, animatedScore]);

  const handleStartTrip = () => {
    // TODO: Navigate to trip creation/start screen
    Alert.alert(
      '� Start New Trip',
      'You will be redirected to create a new trip. This will guide you through planning your safe journey.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          // TODO: Navigate to trip creation screen
          console.log('Navigate to trip creation...');
        }}
      ]
    );
  };

  const handleManageTrip = () => {
    Alert.alert(
      '📍 Manage Active Trip',
      'Your current trip: ' + (tripStatistics.activeTripTitle || 'Unknown Trip'),
      [
        { text: 'View Details', onPress: () => console.log('View trip details...') },
        { text: 'End Trip', style: 'destructive', onPress: () => console.log('End trip...') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  };

  const renderSafetyGauge = () => {
    const percentage = safetyScore.overall;

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          <View style={styles.gaugeCenter}>
            <Text style={styles.gaugeScore}>{percentage}</Text>
            <Text style={styles.gaugeLabel}>Safety Score</Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badge, { 
            backgroundColor: percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444'
          }]}>
            {safetyScore.badge}
          </Text>
        </View>
      </View>
    );
  };

  // Render different content based on trip status
  const renderDashboardContent = () => {
    if (isOnActiveTrip) {
      return renderActiveTripDashboard();
    } else {
      return renderNoTripDashboard();
    }
  };

  const renderNoTripDashboard = () => (
    <>
      {/* Trip Statistics Section */}
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

      {/* Start Trip Section */}
      <View style={styles.startTripSection}>
        <Text style={styles.sectionTitle}>Ready for Your Next Adventure?</Text>
        <Text style={styles.sectionSubtitle}>
          Plan and start a new safe journey with real-time monitoring and community support.
        </Text>
        
        <TouchableOpacity style={styles.startTripButton} onPress={handleStartTrip}>
          <Play color="white" size={24} />
          <Text style={styles.startTripButtonText}>Start New Trip</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Shield color="#3B82F6" size={20} />
            <Text style={styles.featureText}>Real-time safety monitoring</Text>
          </View>
          <View style={styles.feature}>
            <MapPin color="#10B981" size={20} />
            <Text style={styles.featureText}>GPS tracking & alerts</Text>
          </View>
          <View style={styles.feature}>
            <Users color="#F59E0B" size={20} />
            <Text style={styles.featureText}>Community support network</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderActiveTripDashboard = () => (
    <>
      {/* Current Trip Status */}
      <View style={styles.activeTripSection}>
        <View style={styles.activeTripHeader}>
          <View style={styles.tripStatusBadge}>
            <Activity color="white" size={16} />
            <Text style={styles.tripStatusText}>ACTIVE TRIP</Text>
          </View>
          <TouchableOpacity style={styles.manageTripButton} onPress={handleManageTrip}>
            <Text style={styles.manageTripText}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.activeTripTitle}>{tripStatistics.activeTripTitle}</Text>
        <Text style={styles.activeTripDate}>
          Started: {formatDate(tripStatistics.activeTripStartDate)}
        </Text>
      </View>

      {/* Safety Gauge for Active Trip */}
      {renderSafetyGauge()}

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

      {/* Quick Actions for Active Trip */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Trip Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/map')}
        >
          <MapPin color="#10B981" size={24} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Live Location</Text>
            <Text style={styles.actionSubtitle}>View current position & route</Text>
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
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  languageText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  alertText: {
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gauge: {
    width: 200,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeBackground: {
    position: 'absolute',
    width: 180,
    height: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    backgroundColor: '#E5E7EB',
    borderWidth: 15,
    borderBottomWidth: 0,
    borderColor: '#E5E7EB',
  },
  gaugeFill: {
    position: 'absolute',
    width: 180,
    height: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderWidth: 15,
    borderBottomWidth: 0,
    borderColor: '#10B981',
    transformOrigin: 'bottom center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
  },
  gaugeScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  gaugeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  badgeContainer: {
    marginTop: 16,
  },
  badge: {
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
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
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
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
  tripInfo: {
    marginBottom: 20,
  },
  tripCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
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
  },
  tripStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripStatusText: {
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  tripDates: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  tripId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  // New styles for dynamic dashboard
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  additionalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  startTripSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  startTripButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  startTripButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTripSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tripAction: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  emergencyAction: {
    backgroundColor: '#FEE2E2',
  },
  tripActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  emergencyActionText: {
    color: '#EF4444',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  manageTripButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageTripText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTripTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  activeTripDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
});