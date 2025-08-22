import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const getCategoryColor = (category) => {
  const categoryColors = {
    'Polity & Governance': '#EF4444',
    'Economy': '#10B981',
    'Environment & Ecology': '#059669',
    'Science & Technology': '#3B82F6',
    'International Relations': '#8B5CF6',
    'Current Affairs': '#F59E0B',
  };
  return categoryColors[category] || colors.primary;
};

const getCategoryIcon = (category) => {
  const categoryIcons = {
    'Polity & Governance': 'business',
    'Economy': 'trending-up',
    'Environment & Ecology': 'leaf',
    'Science & Technology': 'flask',
    'International Relations': 'globe',
    'Current Affairs': 'time',
  };
  return categoryIcons[category] || 'newspaper';
};

export default function NewsCard({ news, onPress }) {
  const categoryColor = getCategoryColor(news.category);
  const categoryIcon = getCategoryIcon(news.category);
  
  const hasAI = news.mcqs?.length > 0 || news.flashcards?.length > 0 || news.mindmap?.subtopics?.length > 0;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <Ionicons name={categoryIcon} size={12} color={colors.white} />
              <Text style={styles.categoryText}>{news.category}</Text>
            </View>
          </View>
          
          <View style={styles.metaContainer}>
            <Text style={styles.source}>{news.source}</Text>
            <Text style={styles.date}>{formatDate(news.created_at)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {news.title}
        </Text>

        {/* Summary */}
        {news.summary && (
          <Text style={styles.summary} numberOfLines={3}>
            {news.summary}
          </Text>
        )}

        {/* AI Content Indicators */}
        {hasAI && (
          <View style={styles.aiIndicators}>
            <Text style={styles.aiLabel}>🤖 AI Generated:</Text>
            <View style={styles.aiFeatures}>
              {news.mcqs?.length > 0 && (
                <View style={styles.aiFeature}>
                  <Ionicons name="help-circle" size={14} color={colors.accent} />
                  <Text style={styles.aiFeatureText}>{news.mcqs.length} MCQs</Text>
                </View>
              )}
              {news.flashcards?.length > 0 && (
                <View style={styles.aiFeature}>
                  <Ionicons name="card" size={14} color={colors.secondary} />
                  <Text style={styles.aiFeatureText}>{news.flashcards.length} Flashcards</Text>
                </View>
              )}
              {news.mindmap?.subtopics?.length > 0 && (
                <View style={styles.aiFeature}>
                  <Ionicons name="git-network" size={14} color={colors.info} />
                  <Text style={styles.aiFeatureText}>Mindmap</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Read full article</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
          
          {hasAI && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={colors.accent} />
              <Text style={styles.aiBadgeText}>AI Enhanced</Text>
            </View>
          )}
                 </View>
       </View>
     </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  source: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  aiIndicators: {
    marginBottom: 16,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  aiFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiFeatureText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
});
