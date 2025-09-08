import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  CheckCircle, 
  Phone, 
  Calendar,
  Share,
  QrCode
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';

export default function DigitalIDScreen() {
  const { touristProfile } = useSafeTrails();

  const handleShareID = () => {
    Alert.alert(
      'Share Digital ID',
      'Your verified digital ID has been shared with the authority.',
      [{ text: 'OK' }]
    );
  };

  const handleShowQR = () => {
    Alert.alert(
      'QR Code',
      'QR code displayed for quick verification by authorities.',
      [{ text: 'Close' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#2563EB', '#3B82F6', '#60A5FA']}
        style={styles.idCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.didBadge}>
            <Shield color="white" size={16} />
            <Text style={styles.didText}>DID VERIFIED</Text>
          </View>
          <CheckCircle color="#10B981" size={24} />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: touristProfile.photo }}
            style={styles.profilePhoto}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{touristProfile.name}</Text>
            <Text style={styles.profileId}>ID: {touristProfile.id}</Text>
          </View>
        </View>

        <View style={styles.validitySection}>
          <View style={styles.validityItem}>
            <Calendar color="rgba(255, 255, 255, 0.8)" size={16} />
            <Text style={styles.validityLabel}>Valid From</Text>
            <Text style={styles.validityDate}>{touristProfile.tripValidFrom}</Text>
          </View>
          <View style={styles.validityItem}>
            <Calendar color="rgba(255, 255, 255, 0.8)" size={16} />
            <Text style={styles.validityLabel}>Valid Until</Text>
            <Text style={styles.validityDate}>{touristProfile.tripValidTo}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.blockchainText}>🔗 Blockchain Verified</Text>
          <TouchableOpacity onPress={handleShowQR}>
            <QrCode color="white" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.primaryAction} onPress={handleShareID}>
          <Share color="white" size={20} />
          <Text style={styles.primaryActionText}>Share ID with Authority</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryAction} onPress={handleShowQR}>
          <QrCode color="#2563EB" size={20} />
          <Text style={styles.secondaryActionText}>Show QR Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emergencySection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {touristProfile.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Phone color="#2563EB" size={20} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Digital ID Features</Text>
        
        <View style={styles.featureItem}>
          <CheckCircle color="#10B981" size={20} />
          <Text style={styles.featureText}>Blockchain verified identity</Text>
        </View>
        
        <View style={styles.featureItem}>
          <CheckCircle color="#10B981" size={20} />
          <Text style={styles.featureText}>Instant authority verification</Text>
        </View>
        
        <View style={styles.featureItem}>
          <CheckCircle color="#10B981" size={20} />
          <Text style={styles.featureText}>Secure emergency contact access</Text>
        </View>
        
        <View style={styles.featureItem}>
          <CheckCircle color="#10B981" size={20} />
          <Text style={styles.featureText}>Real-time trip validity status</Text>
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
  idCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  didBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  didText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileId: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  validitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  validityItem: {
    alignItems: 'center',
  },
  validityLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  validityDate: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockchainText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  primaryAction: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryAction: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  secondaryActionText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emergencySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactCard: {
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
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
});