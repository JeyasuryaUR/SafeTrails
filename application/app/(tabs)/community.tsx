import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  CloudRain,
  Construction
} from 'lucide-react-native';
import { useSafeTrails } from '@/contexts/SafeTrailsContext';

export default function CommunityScreen() {
  const { communityReports } = useSafeTrails();
  const [upvotedReports, setUpvotedReports] = useState<Set<string>>(new Set());

  const handleUpvote = (reportId: string) => {
    const newUpvoted = new Set(upvotedReports);
    if (newUpvoted.has(reportId)) {
      newUpvoted.delete(reportId);
    } else {
      newUpvoted.add(reportId);
    }
    setUpvotedReports(newUpvoted);
  };

  const handleReportToAuthority = (report: any) => {
    Alert.alert(
      'Report to Authority',
      `"${report.title}" has been forwarded to local authorities for immediate attention.`,
      [{ text: 'OK' }]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Roadblock': return <Construction color="#F59E0B" size={20} />;
      case 'Medical': return <Shield color="#EF4444" size={20} />;
      case 'Weather': return <CloudRain color="#3B82F6" size={20} />;
      case 'Safety': return <AlertTriangle color="#EF4444" size={20} />;
      default: return <MessageSquare color="#6B7280" size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Roadblock': return '#F59E0B';
      case 'Medical': return '#EF4444';
      case 'Weather': return '#3B82F6';
      case 'Safety': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Reports</Text>
        <Text style={styles.headerSubtitle}>
          Real-time updates from fellow travelers
        </Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <TrendingUp color="#10B981" size={24} />
          <Text style={styles.statNumber}>127</Text>
          <Text style={styles.statLabel}>Active Reports</Text>
        </View>
        
        <View style={styles.statCard}>
          <Shield color="#2563EB" size={24} />
          <Text style={styles.statNumber}>89%</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        
        <View style={styles.statCard}>
          <Clock color="#F59E0B" size={24} />
          <Text style={styles.statNumber}>2.3h</Text>
          <Text style={styles.statLabel}>Avg Response</Text>
        </View>
      </View>

      <View style={styles.reportsSection}>
        {communityReports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportIcon}>
                {getCategoryIcon(report.category)}
              </View>
              <View style={styles.reportMeta}>
                <View 
                  style={[
                    styles.categoryBadge, 
                    { backgroundColor: getCategoryColor(report.category) }
                  ]}
                >
                  <Text style={styles.categoryText}>{report.category}</Text>
                </View>
                <Text style={styles.reportTime}>{report.timestamp}</Text>
              </View>
            </View>

            <Text style={styles.reportTitle}>{report.title}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin color="#6B7280" size={14} />
              <Text style={styles.locationText}>{report.location}</Text>
            </View>

            <Text style={styles.reportDescription}>{report.description}</Text>

            <View style={styles.reportFooter}>
              <Text style={styles.reportedBy}>by {report.reportedBy}</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[
                    styles.upvoteButton,
                    upvotedReports.has(report.id) && styles.upvoteButtonActive
                  ]}
                  onPress={() => handleUpvote(report.id)}
                >
                  <ThumbsUp 
                    color={upvotedReports.has(report.id) ? '#2563EB' : '#6B7280'} 
                    size={16} 
                  />
                  <Text style={[
                    styles.upvoteText,
                    upvotedReports.has(report.id) && styles.upvoteTextActive
                  ]}>
                    {report.upvotes + (upvotedReports.has(report.id) ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.reportButton}
                  onPress={() => handleReportToAuthority(report)}
                >
                  <AlertTriangle color="#EF4444" size={16} />
                  <Text style={styles.reportButtonText}>Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addReportButton}>
        <MessageSquare color="white" size={20} />
        <Text style={styles.addReportText}>Share Your Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  reportsSection: {
    paddingHorizontal: 20,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportMeta: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportedBy: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  upvoteButtonActive: {
    backgroundColor: '#EBF4FF',
  },
  upvoteText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  upvoteTextActive: {
    color: '#2563EB',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
  },
  reportButtonText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
    fontWeight: '600',
  },
  addReportButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addReportText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});