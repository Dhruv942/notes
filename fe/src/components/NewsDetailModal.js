import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

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

export default function NewsDetailModal({ visible, news, onClose }) {
  const [activeTab, setActiveTab] = useState('article'); // 'article', 'mcqs', 'flashcards', 'mindmap'
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showMCQResult, setShowMCQResult] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);

  if (!news) return null;

  const categoryColor = getCategoryColor(news.category);

  const handleOpenLink = async () => {
    if (news.source_url) {
      try {
        await Linking.openURL(news.source_url);
      } catch (error) {
        Alert.alert('Error', 'Could not open the link');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderArticleTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.articleHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{news.category}</Text>
        </View>
        <Text style={styles.date}>{formatDate(news.created_at)}</Text>
      </View>
      
      <Text style={styles.articleTitle}>{news.title}</Text>
      
      <View style={styles.sourceContainer}>
        <Text style={styles.sourceLabel}>Source:</Text>
        <TouchableOpacity onPress={handleOpenLink}>
          <Text style={styles.sourceLink}>{news.source}</Text>
        </TouchableOpacity>
      </View>
      
      {news.summary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{news.summary}</Text>
        </View>
      )}
      
      {news.content && (
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Full Article</Text>
          <Text style={styles.contentText}>{news.content}</Text>
        </View>
      )}
    </View>
  );

  const renderMCQsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Practice MCQs</Text>
      {news.mcqs && news.mcqs.length > 0 ? (
        <View style={styles.mcqContainer}>
          <View style={styles.mcqHeader}>
            <Text style={styles.mcqCounter}>
              Question {currentMCQIndex + 1} of {news.mcqs.length}
            </Text>
            <Text style={styles.mcqScore}>
              Score: {news.mcqs.filter((_, index) => index < currentMCQIndex && showMCQResult).length}/{currentMCQIndex}
            </Text>
          </View>

          <Text style={styles.mcqQuestion}>
            {news.mcqs[currentMCQIndex].question}
          </Text>

          <View style={styles.mcqOptions}>
            {news.mcqs[currentMCQIndex].options.map((option, optionIndex) => (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.mcqOption,
                  selectedAnswer === optionIndex && styles.mcqOptionSelected,
                  showMCQResult && optionIndex === news.mcqs[currentMCQIndex].correct_answer && styles.mcqOptionCorrect,
                  showMCQResult && selectedAnswer === optionIndex && optionIndex !== news.mcqs[currentMCQIndex].correct_answer && styles.mcqOptionIncorrect,
                ]}
                onPress={() => !showMCQResult && setSelectedAnswer(optionIndex)}
                disabled={showMCQResult}
              >
                <Text style={[
                  styles.mcqOptionText,
                  selectedAnswer === optionIndex && styles.mcqOptionTextSelected,
                  showMCQResult && optionIndex === news.mcqs[currentMCQIndex].correct_answer && styles.mcqOptionTextCorrect,
                ]}>
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showMCQResult && (
            <View style={styles.mcqExplanation}>
              <Text style={styles.mcqExplanationLabel}>Explanation:</Text>
              <Text style={styles.mcqExplanationText}>
                {news.mcqs[currentMCQIndex].explanation}
              </Text>
            </View>
          )}

          <View style={styles.mcqActions}>
            {!showMCQResult ? (
              <TouchableOpacity
                style={[styles.mcqButton, selectedAnswer === null && styles.mcqButtonDisabled]}
                onPress={() => setShowMCQResult(true)}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.mcqButtonText}>Check Answer</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.mcqNavigation}>
                {currentMCQIndex > 0 && (
                  <TouchableOpacity
                    style={styles.mcqButton}
                    onPress={() => {
                      setCurrentMCQIndex(currentMCQIndex - 1);
                      setSelectedAnswer(null);
                      setShowMCQResult(false);
                    }}
                  >
                    <Text style={styles.mcqButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}
                
                {currentMCQIndex < news.mcqs.length - 1 ? (
                  <TouchableOpacity
                    style={styles.mcqButton}
                    onPress={() => {
                      setCurrentMCQIndex(currentMCQIndex + 1);
                      setSelectedAnswer(null);
                      setShowMCQResult(false);
                    }}
                  >
                    <Text style={styles.mcqButtonText}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.mcqButton}
                    onPress={() => {
                      setCurrentMCQIndex(0);
                      setSelectedAnswer(null);
                      setShowMCQResult(false);
                    }}
                  >
                    <Text style={styles.mcqButtonText}>Restart Quiz</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      ) : (
        <Text style={styles.noContentText}>No MCQs available for this article.</Text>
      )}
    </View>
  );

  const renderFlashcardsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Flashcards</Text>
      {news.flashcards && news.flashcards.length > 0 ? (
        <View style={styles.flashcardContainer}>
          <View style={styles.flashcardHeader}>
            <Text style={styles.flashcardCounter}>
              Card {currentFlashcardIndex + 1} of {news.flashcards.length}
            </Text>
          </View>

          <View style={styles.flashcard}>
            <View style={styles.flashcardSide}>
              <Text style={styles.flashcardLabel}>Front:</Text>
              <Text style={styles.flashcardText}>
                {news.flashcards[currentFlashcardIndex].front}
              </Text>
            </View>

            {showFlashcardAnswer && (
              <View style={styles.flashcardSide}>
                <Text style={styles.flashcardLabel}>Back:</Text>
                <Text style={styles.flashcardText}>
                  {news.flashcards[currentFlashcardIndex].back}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.flashcardActions}>
            <TouchableOpacity
              style={styles.flashcardButton}
              onPress={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
            >
              <Text style={styles.flashcardButtonText}>
                {showFlashcardAnswer ? 'Hide Answer' : 'Show Answer'}
              </Text>
            </TouchableOpacity>

            <View style={styles.flashcardNavigation}>
              {currentFlashcardIndex > 0 && (
                <TouchableOpacity
                  style={styles.flashcardButton}
                  onPress={() => {
                    setCurrentFlashcardIndex(currentFlashcardIndex - 1);
                    setShowFlashcardAnswer(false);
                  }}
                >
                  <Text style={styles.flashcardButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              
              {currentFlashcardIndex < news.flashcards.length - 1 ? (
                <TouchableOpacity
                  style={styles.flashcardButton}
                  onPress={() => {
                    setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                    setShowFlashcardAnswer(false);
                  }}
                >
                  <Text style={styles.flashcardButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.flashcardButton}
                  onPress={() => {
                    setCurrentFlashcardIndex(0);
                    setShowFlashcardAnswer(false);
                  }}
                >
                  <Text style={styles.flashcardButtonText}>Restart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noContentText}>No flashcards available for this article.</Text>
      )}
    </View>
  );

  const renderMindmapTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Mind Map</Text>
      {news.mindmap && news.mindmap.topic ? (
        <View style={styles.mindmapContainer}>
          <View style={styles.mindmapTopic}>
            <Text style={styles.mindmapTopicText}>{news.mindmap.topic}</Text>
          </View>
          
          {news.mindmap.subtopics && news.mindmap.subtopics.map((subtopic, index) => (
            <View key={index} style={styles.mindmapSubtopic}>
              <View style={styles.mindmapSubtopicHeader}>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                <Text style={styles.mindmapSubtopicTitle}>{subtopic.name}</Text>
              </View>
              
              {subtopic.children && subtopic.children.map((child, childIndex) => (
                <View key={childIndex} style={styles.mindmapChild}>
                  <Text style={styles.mindmapChildText}>• {child.name}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noContentText}>No mind map available for this article.</Text>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'article':
        return renderArticleTab();
      case 'mcqs':
        return renderMCQsTab();
      case 'flashcards':
        return renderFlashcardsTab();
      case 'mindmap':
        return renderMindmapTab();
      default:
        return renderArticleTab();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.gradient}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>News Detail</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'article' && styles.activeTab]}
                onPress={() => setActiveTab('article')}
              >
                <Ionicons 
                  name="newspaper" 
                  size={16} 
                  color={activeTab === 'article' ? colors.white : colors.textSecondary} 
                />
                <Text style={[styles.tabText, activeTab === 'article' && styles.activeTabText]}>
                  Article
                </Text>
              </TouchableOpacity>
              
              {news.mcqs?.length > 0 && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'mcqs' && styles.activeTab]}
                  onPress={() => setActiveTab('mcqs')}
                >
                  <Ionicons 
                    name="help-circle" 
                    size={16} 
                    color={activeTab === 'mcqs' ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[styles.tabText, activeTab === 'mcqs' && styles.activeTabText]}>
                    MCQs ({news.mcqs.length})
                  </Text>
                </TouchableOpacity>
              )}
              
              {news.flashcards?.length > 0 && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
                  onPress={() => setActiveTab('flashcards')}
                >
                  <Ionicons 
                    name="card" 
                    size={16} 
                    color={activeTab === 'flashcards' ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>
                    Cards ({news.flashcards.length})
                  </Text>
                </TouchableOpacity>
              )}
              
              {news.mindmap?.subtopics?.length > 0 && (
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'mindmap' && styles.activeTab]}
                  onPress={() => setActiveTab('mindmap')}
                >
                  <Ionicons 
                    name="git-network" 
                    size={16} 
                    color={activeTab === 'mindmap' ? colors.white : colors.textSecondary} 
                  />
                  <Text style={[styles.tabText, activeTab === 'mindmap' && styles.activeTabText]}>
                    Mind Map
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingVertical: 20,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: 32,
    marginBottom: 16,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  sourceLink: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  summarySection: {
    marginBottom: 24,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  // MCQ Styles (matching notes design)
  mcqContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mcqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mcqCounter: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mcqScore: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  mcqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    lineHeight: 22,
  },
  mcqOptions: {
    marginBottom: 16,
  },
  mcqOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  mcqOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  mcqOptionCorrect: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  mcqOptionIncorrect: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  mcqOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mcqOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  mcqOptionTextCorrect: {
    color: colors.success,
    fontWeight: '600',
  },
  mcqExplanation: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  mcqExplanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  mcqExplanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mcqActions: {
    alignItems: 'center',
  },
  mcqButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  mcqButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  mcqButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  mcqNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  // Flashcard Styles (matching notes design)
  flashcardContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  flashcardHeader: {
    marginBottom: 16,
  },
  flashcardCounter: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashcard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    minHeight: 120,
  },
  flashcardSide: {
    marginBottom: 12,
  },
  flashcardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  flashcardText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  flashcardActions: {
    alignItems: 'center',
  },
  flashcardButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  flashcardButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  flashcardNavigation: {
    flexDirection: 'row',
    gap: 12,
  },
  // Mindmap Styles (matching notes design)
  mindmapContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
  },
  mindmapTopic: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  mindmapTopicText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  mindmapSubtopic: {
    marginBottom: 16,
  },
  mindmapSubtopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mindmapSubtopicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  mindmapChild: {
    marginLeft: 24,
    marginBottom: 4,
  },
  mindmapChildText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noContentText: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
});
