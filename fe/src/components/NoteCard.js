import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function NoteCard({ note, onPress }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'upload':
        return 'document-text';
      case 'website':
        return 'globe';
      case 'manual':
        return 'create';
      default:
        return 'document-text';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'upload':
        return colors.info;
      case 'website':
        return colors.success;
      case 'manual':
        return colors.primary;
      default:
        return colors.textTertiary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sourceContainer}>
          <View style={[styles.sourceIcon, { backgroundColor: getSourceColor(note.source) }]}>
            <Ionicons 
              name={getSourceIcon(note.source)} 
              size={16} 
              color={colors.textPrimary} 
            />
          </View>
          <Text style={styles.sourceText}>
            {note.source.charAt(0).toUpperCase() + note.source.slice(1)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(note.created_at)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {note.title}
      </Text>

      <Text style={styles.preview} numberOfLines={3}>
        {note.summary || note.content?.substring(0, 150) || 'No preview available'}
      </Text>

      <View style={styles.cardFooter}>
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {note.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{note.tags.length - 2}</Text>
            )}
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="bookmark-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.statText}>Notes</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="help-circle-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.statText}>Quiz</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="card-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.statText}>Cards</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  preview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tag: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginLeft: 4,
  },
});

