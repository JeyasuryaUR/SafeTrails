import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { 
  MapPin, 
  AlertTriangle, 
  Navigation, 
  Clock,
  Shield,
  Upload
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const { itinerary, currentLocation, updateLocation, isInDangerZone } = useSafeTrails();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    // Simulate location updates
    const interval = setInterval(() => {
      const mockLocations = [
        { lat: 28.6139, lng: 77.2090 }, // Safe area
        { lat: 28.6562, lng: 77.2410 }, // Connaught Place (danger zone)
        { lat: 28.6517, lng: 77.2219 }, // India Gate area
      ];
      
      const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      updateLocation(randomLocation);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLocationPress = (location: string) => {
    setSelectedLocation(location);
    if (location === 'Connaught Place') {
      Alert.alert(
        '⚠️ High Risk Area',
        'You are entering a restricted/high-risk area. Please exercise caution and consider alternative routes.',
        [
          { text: 'Understood', style: 'default' },
          { text: 'Find Alternative', style: 'cancel' }
        ]
      );
    }
  };

  const handleUploadItinerary = () => {
    Alert.alert(
      'Upload Itinerary',
      'Your travel itinerary has been uploaded and analyzed for safety risks.',
      [{ text: 'OK' }]
    );
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <Shield color="#10B981" size={16} />;
      case 'medium': return <AlertTriangle color="#F59E0B" size={16} />;
      case 'high': return <AlertTriangle color="#EF4444" size={16} />;
      default: return <MapPin color="#6B7280" size={16} />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Mock Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapTitle}>Interactive Safety Map</Text>
          
          {/* Current Location */}
          <View style={[styles.locationDot, styles.currentLocation]}>
            <View style={styles.currentLocationPulse} />
            <Text style={styles.locationLabel}>You are here</Text>
          </View>

          {/* Danger Zones */}
          <TouchableOpacity 
            style={[styles.locationDot, styles.dangerZone]}
            onPress={() => handleLocationPress('Connaught Place')}
          >
            <AlertTriangle color="#EF4444" size={16} />
            <Text style={styles.dangerLabel}>High Risk</Text>
          </TouchableOpacity>

          {/* Safe Zones */}
          <View style={[styles.locationDot, styles.safeZone]}>
            <Shield color="#10B981" size={16} />
            <Text style={styles.safeLabel}>Safe Zone</Text>
          </View>

          {/* Route Overlay */}
          <View style={styles.routeOverlay} />
        </View>

        {isInDangerZone && (
          <View style={styles.dangerAlert}>
            <AlertTriangle color="#EF4444" size={20} />
            <Text style={styles.dangerAlertText}>
              ⚠️ You are entering a restricted/high-risk area
            </Text>
          </View>
        )}
      </View>

      {/* Upload Itinerary */}
      <View style={styles.uploadSection}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadItinerary}>
          <Upload color="white" size={20} />
          <Text style={styles.uploadButtonText}>Upload Trip Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Itinerary List */}
      <View style={styles.itinerarySection}>
        <Text style={styles.sectionTitle}>Your Itinerary</Text>
        {itinerary.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.itineraryCard}
            onPress={() => handleLocationPress(item.location)}
          >
            <View style={styles.itineraryHeader}>
              <View style={styles.itineraryIcon}>
                {getRiskIcon(item.riskLevel)}
              </View>
              <View style={styles.itineraryInfo}>
                <Text style={styles.itineraryLocation}>{item.location}</Text>
                <Text style={styles.itineraryActivity}>{item.activity}</Text>
              </View>
              <View style={styles.itineraryMeta}>
                <Text style={styles.itineraryDate}>{item.date}</Text>
                <Text style={styles.itineraryTime}>{item.time}</Text>
              </View>
            </View>
            
            <View style={styles.riskIndicator}>
              <View 
                style={[
                  styles.riskBadge, 
                  { backgroundColor: getRiskColor(item.riskLevel) }
                ]}
              >
                <Text style={styles.riskText}>
                  {item.riskLevel.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map Legend */}
      <View style={styles.legendSection}>
        <Text style={styles.sectionTitle}>Map Legend</Text>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
          <Text style={styles.legendText}>Your Current Location</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Safe Zones</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Moderate Risk Areas</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>High Risk / Restricted Areas</Text>
        </View>
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationSection}>
        <TouchableOpacity style={styles.navButton}>
          <Navigation color="#2563EB" size={20} />
          <Text style={styles.navButtonText}>Get Directions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Clock color="#2563EB" size={20} />
          <Text style={styles.navButtonText}>Real-time Updates</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapContainer: {
    margin: 20,
    marginBottom: 0,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapTitle: {
    position: 'absolute',
    top: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  locationDot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocation: {
    top: 150,
    left: 100,
    width: 20,
    height: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  currentLocationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    top: -10,
    left: -10,
  },
  locationLabel: {
    position: 'absolute',
    top: 25,
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dangerZone: {
    top: 80,
    right: 60,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
  },
  dangerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 4,
  },
  safeZone: {
    bottom: 60,
    left: 80,
    backgroundColor: '#D1FAE5',
    padding: 8,
    borderRadius: 8,
  },
  safeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  routeOverlay: {
    position: 'absolute',
    top: 140,
    left: 90,
    width: 100,
    height: 3,
    backgroundColor: '#2563EB',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  dangerAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  dangerAlertText: {
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  uploadSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  itinerarySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  itineraryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itineraryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itineraryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itineraryLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  itineraryActivity: {
    fontSize: 14,
    color: '#6B7280',
  },
  itineraryMeta: {
    alignItems: 'flex-end',
  },
  itineraryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itineraryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  riskIndicator: {
    alignItems: 'flex-start',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  legendSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#1F2937',
  },
  navigationSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  navButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});