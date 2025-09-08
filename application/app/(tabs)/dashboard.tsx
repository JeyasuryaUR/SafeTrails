import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { safetyScore, touristProfile, language, toggleLanguage, isInDangerZone } = useSafeTrails();

  const renderSafetyGauge = () => {
    const percentage = safetyScore.overall;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          <View style={styles.gaugeBackground} />
          <View 
            style={[
              styles.gaugeFill,
              { 
                transform: [{ rotate: `${(percentage / 100) * 180}deg` }],
                backgroundColor: percentage >= 70 ? '#10B981' : percentage >= 40 ? '#F59E0B' : '#EF4444'
              }
            ]} 
          />
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
        {renderSafetyGauge()}

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

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/digital-id')}
          >
            <Shield color="#2563EB" size={24} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Digital ID</Text>
              <Text style={styles.actionSubtitle}>Blockchain verified identity</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/map')}
          >
            <MapPin color="#10B981" size={24} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Check Route Safety</Text>
              <Text style={styles.actionSubtitle}>View real-time risk zones</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.emergencyCard]}
            onPress={() => router.push('/sos')}
          >
            <AlertTriangle color="#EF4444" size={24} />
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Emergency SOS</Text>
              <Text style={styles.actionSubtitle}>Instant help & location sharing</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tripInfo}>
          <Text style={styles.sectionTitle}>Current Trip</Text>
          <View style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripTitle}>India Heritage Tour</Text>
              <View style={styles.tripStatus}>
                <Clock color="#10B981" size={16} />
                <Text style={styles.tripStatusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.tripDates}>
              {touristProfile.tripValidFrom} - {touristProfile.tripValidTo}
            </Text>
            <Text style={styles.tripId}>Trip ID: {touristProfile.id}</Text>
          </View>
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
});