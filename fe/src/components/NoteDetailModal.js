import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { colors } from '../theme/colors';
import apiService from '../services/api';
import MindMapViewer from './MindMapViewer';
import { useQuiz } from '../hooks/useQuiz';
import { useFlashcards } from '../hooks/useFlashcards';
import { useHighlights } from '../hooks/useHighlights';

export default function NoteDetailModal({ visible, note, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [localHighlights, setLocalHighlights] = useState([]);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightText, setHighlightText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  // React Query hooks
  const { 
    data: quizData, 
    isLoading: quizLoading, 
    error: quizError,
    refetch: refetchQuiz 
  } = useQuiz(note?.id, false);
  
  const { 
    data: flashcardsData, 
    isLoading: flashcardsLoading, 
    error: flashcardsError,
    refetch: refetchFlashcards 
  } = useFlashcards(note?.id, false);

  const {
    data: highlights,
    isLoading: highlightsLoading,
    error: highlightsError,
    refetch: refetchHighlights,
    createHighlight
  } = useHighlights(note?.id);

  useEffect(() => {
    if (visible && note) {
      loadNoteData();
    }
  }, [visible, note]);

  // Reset quiz state when quiz data changes
  useEffect(() => {
    if (quizData) {
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setScore(0);
      setAnsweredQuestions(new Set());
    }
  }, [quizData]);

  // Reset flashcards state when flashcards data changes
  useEffect(() => {
    if (flashcardsData) {
      setCurrentFlashcardIndex(0);
      setFlashcardFlipped(false);
    }
  }, [flashcardsData]);

  const loadNoteData = async () => {
    if (!note) return;
    
    setLoading(true);
    try {
      // Highlights are now loaded by the hook
      console.log('Note data loaded');
    } catch (error) {
      console.error('Error loading note data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelectedText = async (selectedText) => {
    if (!selectedText || !selectedText.trim()) return;

    try {
      console.log('Saving highlight:', selectedText.trim());
      
      // Use the hook's createHighlight function
      const result = await createHighlight({
        content: selectedText.trim(),
        note: '',
        source: 'selection',
        note_id: note.id,
      });
      
      if (result) {
        Alert.alert('Success', 'Text highlighted successfully!');
      } else {
        Alert.alert('Error', 'Failed to save highlight');
      }
    } catch (error) {
      console.error('Error saving highlight:', error);
      Alert.alert('Error', 'Failed to save highlight: ' + error.message);
    }
  };

  const openHighlightModal = () => {
    Alert.prompt(
      'Create Highlight',
      'Enter the text you want to highlight:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: (text) => {
            if (text && text.trim()) {
              setHighlightText(text.trim());
              setShowHighlightModal(true);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const saveHighlight = async () => {
    if (!highlightText.trim()) {
      Alert.alert('Error', 'Please select text to highlight');
      return;
    }

    try {
      const result = await createHighlight({
        content: highlightText.trim(),
        note: highlightNote.trim(),
        source: 'manual',
        note_id: note.id,
      });
      
      if (result) {
        setShowHighlightModal(false);
        setHighlightText('');
        setHighlightNote('');
        Alert.alert('Success', 'Highlight saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save highlight');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save highlight');
      console.error('Error saving highlight:', error);
    }
  };

  const cancelHighlightModal = () => {
    setShowHighlightModal(false);
    setHighlightText('');
    setHighlightNote('');
  };



  const handleAnswerSelect = (index) => {
    if (answeredQuestions.has(currentQuizIndex)) return; // Prevent multiple answers
    
    setSelectedAnswer(index);
    setShowAnswer(true);
    
    // Check if answer is correct
    const currentQuestion = quizData[currentQuizIndex];
    if (currentQuestion && currentQuestion.correct_answer !== undefined) {
      const isCorrect = index === currentQuestion.correct_answer;
      if (isCorrect) {
        setScore(score + 1);
      }
    }
    
    // Mark question as answered
    setAnsweredQuestions(prev => new Set([...prev, currentQuizIndex]));
  };

  const handleNextQuestion = () => {
    if (quizData && currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };



  const renderHighlightedContent = () => {
    if (!highlights || highlights.length === 0) {
      return note.content;
    }

    let content = note.content;
    let result = [];

    // Sort highlights by position in text
    const sortedHighlights = [...highlights].sort((a, b) => {
      const aIndex = content.indexOf(a.content);
      const bIndex = content.indexOf(b.content);
      return aIndex - bIndex;
    });

    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      const highlightIndex = content.indexOf(highlight.content, lastIndex);
      
      if (highlightIndex !== -1) {
        // Add text before highlight
        if (highlightIndex > lastIndex) {
          result.push(
            <Text key={`text-${index}`} style={styles.contentText}>
              {content.substring(lastIndex, highlightIndex)}
            </Text>
          );
        }

        // Add highlighted text
        result.push(
          <Text key={`highlight-${highlight.id}`} style={[styles.contentText, styles.highlightedText]}>
            {highlight.content}
          </Text>
        );

        lastIndex = highlightIndex + highlight.content.length;
      }
    });

    // Add remaining text
    if (lastIndex < content.length) {
      result.push(
        <Text key="text-end" style={styles.contentText}>
          {content.substring(lastIndex)}
        </Text>
      );
    }

    return result.length > 0 ? result : note.content;
  };

  const renderNotesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteDate}>
        {new Date(note.created_at).toLocaleDateString()}
      </Text>
      
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{note.summary}</Text>
      </View>

      {note.key_points && note.key_points.length > 0 && (
        <View style={styles.keyPointsSection}>
          <Text style={styles.sectionTitle}>Key Points</Text>
          {note.key_points.map((point, index) => (
            <View key={index} style={styles.keyPoint}>
              <Text style={styles.keyPointBullet}>•</Text>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Full Content</Text>
        <View style={styles.selectionHint}>
          <Text style={styles.selectionHintText}>📝 Long press on text to highlight it</Text>
        </View>
        <TouchableOpacity
          style={styles.highlightButton}
          onPress={openHighlightModal}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
          <Text style={styles.highlightButtonText}>Manual Highlight</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectTextButton}
          onPress={() => Alert.prompt(
            'Highlight Text',
            'Enter the text you want to highlight:',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Highlight', 
                onPress: (text) => {
                  if (text && text.trim()) {
                    handleSaveSelectedText(text.trim());
                  }
                }
              }
            ],
            'plain-text'
          )}
        >
          <Ionicons name="text-outline" size={20} color={colors.primary} />
          <Text style={styles.selectTextButtonText}>Select Text to Highlight</Text>
        </TouchableOpacity>
        <Text
          style={styles.contentText}
          onLongPress={() => Alert.prompt(
            'Highlight Text',
            'Enter the text you want to highlight:',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Highlight', 
                onPress: (text) => {
                  if (text && text.trim()) {
                    handleSaveSelectedText(text.trim());
                  }
                }
              }
            ],
            'plain-text'
          )}
        >
          {renderHighlightedContent()}
        </Text>
      </View>
         </ScrollView>
   );

       const renderQuizTab = () => (
      <ScrollView style={styles.quizContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>AI Quiz</Text>
          <Text style={styles.quizSubtitle}>
            Test your knowledge with AI-generated questions from this note
          </Text>
        </View>

        {quizLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating quiz questions...</Text>
          </View>
                 ) : quizError ? (
           <View style={styles.emptyContainer}>
             <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
             <Text style={styles.emptyTitle}>Error Loading Quiz</Text>
             <Text style={styles.emptySubtitle}>
               {quizError || 'Failed to load quiz. Please try again.'}
             </Text>
             <TouchableOpacity
               style={styles.restartButton}
               onPress={() => {
                 console.log(`🔄 [QUIZ REFETCH] Manual refetch triggered for noteId: ${note?.id}`);
                 refetchQuiz();
               }}
             >
               <Ionicons name="refresh" size={20} color={colors.textPrimary} />
               <Text style={styles.restartButtonText}>Retry</Text>
             </TouchableOpacity>
           </View>
        ) : !quizData ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Quiz Available</Text>
            <Text style={styles.emptySubtitle}>
              Quiz questions will be generated automatically when you open this tab.
            </Text>
          </View>
        ) : (
         <View style={styles.quizContent}>
           {/* Quiz Progress */}
           <View style={styles.quizProgress}>
             <Text style={styles.quizProgressText}>
               Question {currentQuizIndex + 1} of {quizData.length}
             </Text>
             <Text style={styles.quizProgressText}>
               Score: {score} / {answeredQuestions.size}
             </Text>
           </View>

           {/* Quiz Question */}
           <View style={styles.questionContainer}>
             <Text style={styles.questionText}>
               {quizData[currentQuizIndex].question}
             </Text>
           </View>

           {/* Quiz Options */}
           <View style={styles.optionsContainer}>
             {quizData[currentQuizIndex].options.map((option, index) => (
               <TouchableOpacity
                 key={index}
                 style={[
                   styles.optionCard,
                   selectedAnswer === index && styles.selectedOptionCard,
                   showAnswer && index === quizData[currentQuizIndex].correct_answer && styles.correctOptionCard,
                   showAnswer && selectedAnswer === index && index !== quizData[currentQuizIndex].correct_answer && styles.wrongOptionCard,
                 ]}
                 onPress={() => handleAnswerSelect(index)}
                 disabled={showAnswer} // Disable selection after answer is shown
               >
                 <Text style={[
                   styles.optionText,
                   selectedAnswer === index && styles.selectedOptionText,
                   showAnswer && index === quizData[currentQuizIndex].correct_answer && styles.correctOptionText,
                   showAnswer && selectedAnswer === index && index !== quizData[currentQuizIndex].correct_answer && styles.wrongOptionText,
                 ]}>
                   {option}
                 </Text>
               </TouchableOpacity>
             ))}
           </View>

           {/* Navigation Buttons */}
           <View style={styles.quizNavigation}>
             <TouchableOpacity
               style={[styles.navButton, currentQuizIndex === 0 && styles.disabledButton]}
               onPress={handlePreviousQuestion}
               disabled={currentQuizIndex === 0}
             >
               <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
               <Text style={styles.navButtonText}>Previous</Text>
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.navButton, currentQuizIndex === quizData.length - 1 && styles.disabledButton]}
               onPress={handleNextQuestion}
               disabled={currentQuizIndex === quizData.length - 1}
             >
               <Text style={styles.navButtonText}>Next</Text>
               <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
             </TouchableOpacity>
           </View>

                       {/* Restart Button */}
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => {
                console.log(`🔄 [QUIZ REFETCH] New Quiz button clicked for noteId: ${note?.id}`);
                refetchQuiz();
                setCurrentQuizIndex(0);
                setSelectedAnswer(null);
                setShowAnswer(false);
                setScore(0);
                setAnsweredQuestions(new Set());
              }}
            >
              <Ionicons name="refresh" size={20} color={colors.textPrimary} />
              <Text style={styles.restartButtonText}>New Quiz</Text>
            </TouchableOpacity>
         </View>
       )}
          </ScrollView>
   );

       const renderFlashcardsTab = () => (
      <ScrollView style={styles.flashcardsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.flashcardsHeader}>
          <Text style={styles.flashcardsTitle}>Flashcards</Text>
          <Text style={styles.flashcardsSubtitle}>
            Review key concepts with AI-generated flashcards
          </Text>
        </View>

        {flashcardsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating flashcards...</Text>
          </View>
                 ) : flashcardsError ? (
           <View style={styles.emptyContainer}>
             <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
             <Text style={styles.emptyTitle}>Error Loading Flashcards</Text>
             <Text style={styles.emptySubtitle}>
               {flashcardsError || 'Failed to load flashcards. Please try again.'}
             </Text>
             <TouchableOpacity
               style={styles.restartButton}
               onPress={() => {
                 console.log(`🔄 [FLASHCARDS REFETCH] Manual refetch triggered for noteId: ${note?.id}`);
                 refetchFlashcards();
               }}
             >
               <Ionicons name="refresh" size={20} color={colors.textPrimary} />
               <Text style={styles.restartButtonText}>Retry</Text>
             </TouchableOpacity>
           </View>
        ) : !flashcardsData ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Flashcards Available</Text>
            <Text style={styles.emptySubtitle}>
              Flashcards will be generated automatically when you open this tab.
            </Text>
          </View>
        ) : (
         <View style={styles.flashcardsContent}>
           {/* Flashcard Progress */}
           <View style={styles.flashcardProgress}>
             <Text style={styles.flashcardProgressText}>
               Card {currentFlashcardIndex + 1} of {flashcardsData.length}
             </Text>
           </View>

           {/* Flashcard */}
           <TouchableOpacity
             style={styles.flashcardContainer}
             onPress={() => setFlashcardFlipped(!flashcardFlipped)}
           >
             <View style={styles.flashcard}>
               <Text style={styles.flashcardText}>
                 {flashcardFlipped ? flashcardsData[currentFlashcardIndex].answer : flashcardsData[currentFlashcardIndex].question}
               </Text>
             </View>
           </TouchableOpacity>



           {/* Navigation Buttons */}
           <View style={styles.flashcardNavigation}>
             <TouchableOpacity
               style={[styles.navButton, currentFlashcardIndex === 0 && styles.disabledButton]}
               onPress={() => { setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1)); setFlashcardFlipped(false); }}
               disabled={currentFlashcardIndex === 0}
             >
               <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
               <Text style={styles.navButtonText}>Previous</Text>
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.navButton, currentFlashcardIndex === flashcardsData.length - 1 && styles.disabledButton]}
               onPress={() => { setCurrentFlashcardIndex(Math.min(flashcardsData.length - 1, currentFlashcardIndex + 1)); setFlashcardFlipped(false); }}
               disabled={currentFlashcardIndex === flashcardsData.length - 1}
             >
               <Text style={styles.navButtonText}>Next</Text>
               <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
             </TouchableOpacity>
           </View>

           {/* Pagination Dots */}
           <View style={styles.paginationContainer}>
             {flashcardsData.map((_, index) => (
               <TouchableOpacity
                 key={index}
                 style={[
                   styles.paginationDot,
                   index === currentFlashcardIndex && styles.activePaginationDot
                 ]}
                 onPress={() => { setCurrentFlashcardIndex(index); setFlashcardFlipped(false); }}
               />
             ))}
           </View>

                       {/* Restart Button */}
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => {
                console.log(`🔄 [FLASHCARDS REFETCH] New Flashcards button clicked for noteId: ${note?.id}`);
                refetchFlashcards();
                setCurrentFlashcardIndex(0);
                setFlashcardFlipped(false);
              }}
            >
              <Ionicons name="refresh" size={20} color={colors.textPrimary} />
              <Text style={styles.restartButtonText}>New Flashcards</Text>
            </TouchableOpacity>
         </View>
       )}
     </ScrollView>
   );

       const renderMindMapTab = () => (
      <View style={styles.mindMapContainer}>
        <MindMapViewer noteId={note?.id} onClose={onClose} />
      </View>
    );

   const renderHighlightTab = () => (
    <View style={styles.highlightContainer}>
      <View style={styles.highlightHeader}>
        <Text style={styles.highlightTitle}>Highlights</Text>
        <Text style={styles.highlightSubtitle}>
          Select text in the Notes tab to create highlights
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading highlights...</Text>
        </View>
      ) : highlights.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Highlights Yet</Text>
          <Text style={styles.emptySubtitle}>
            Select text in the Notes tab to create highlights for quick reference.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.highlightsList} showsVerticalScrollIndicator={false}>
          {highlights.map((highlight) => (
            <View key={highlight.id} style={styles.highlightCard}>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightText}>{highlight.content}</Text>
                {highlight.note && (
                  <Text style={styles.highlightNote}>{highlight.note}</Text>
                )}
              </View>
              <Text style={styles.highlightDate}>
                {new Date(highlight.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (!note) return null;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

                 <View style={styles.tabs}>
           <TouchableOpacity
             style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
             onPress={() => {
               console.log(`📱 [TAB SWITCH] Switching to Notes tab for noteId: ${note?.id}`);
               setActiveTab('notes');
             }}
           >
             <Ionicons 
               name="document-text" 
               size={20} 
               color={activeTab === 'notes' ? colors.primary : colors.textSecondary} 
             />
             <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
               Notes
             </Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
             onPress={() => {
               console.log(`📱 [TAB SWITCH] Switching to Quiz tab for noteId: ${note?.id}`);
               setActiveTab('quiz');
             }}
           >
             <Ionicons 
               name="help-circle" 
               size={20} 
               color={activeTab === 'quiz' ? colors.primary : colors.textSecondary} 
             />
             <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>
               Quiz
             </Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
             onPress={() => {
               console.log(`📱 [TAB SWITCH] Switching to Flashcards tab for noteId: ${note?.id}`);
               setActiveTab('flashcards');
             }}
           >
             <Ionicons 
               name="card" 
               size={20} 
               color={activeTab === 'flashcards' ? colors.primary : colors.textSecondary} 
             />
             <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>
               Cards
             </Text>
           </TouchableOpacity>
           
                       <TouchableOpacity
              style={[styles.tab, activeTab === 'mindmap' && styles.activeTab]}
              onPress={() => {
                console.log(`📱 [TAB SWITCH] Switching to Mind Map tab for noteId: ${note?.id}`);
                setActiveTab('mindmap');
              }}
            >
              <Ionicons 
                name="git-network" 
                size={20} 
                color={activeTab === 'mindmap' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.tabText, activeTab === 'mindmap' && styles.activeTabText]}>
                Mind Map
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'highlights' && styles.activeTab]}
              onPress={() => {
                console.log(`📱 [TAB SWITCH] Switching to Highlights tab for noteId: ${note?.id}`);
                setActiveTab('highlights');
              }}
            >
              <Ionicons 
                name="bookmark" 
                size={20} 
                color={activeTab === 'highlights' ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.tabText, activeTab === 'highlights' && styles.activeTabText]}>
                Highlights
              </Text>
            </TouchableOpacity>
         </View>

                           <View style={styles.content}>
            {activeTab === 'notes' && renderNotesTab()}
            {activeTab === 'quiz' && renderQuizTab()}
            {activeTab === 'flashcards' && renderFlashcardsTab()}
            {activeTab === 'mindmap' && renderMindMapTab()}
            {activeTab === 'highlights' && renderHighlightTab()}
          </View>
      </View>

      {/* Highlight Modal */}
      <Modal
        isVisible={showHighlightModal}
        onBackdropPress={cancelHighlightModal}
        style={styles.highlightModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.highlightModalContent}>
          <View style={styles.highlightModalHeader}>
            <Text style={styles.highlightModalTitle}>Create Highlight</Text>
            <TouchableOpacity
              onPress={cancelHighlightModal}
              style={styles.highlightModalCloseButton}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.highlightModalBody}>
            <View style={styles.highlightInputContainer}>
              <Text style={styles.highlightInputLabel}>Selected Text:</Text>
              <View style={styles.selectedTextContainer}>
                <Text style={styles.selectedText}>{highlightText}</Text>
              </View>
            </View>

            <View style={styles.highlightInputContainer}>
              <Text style={styles.highlightInputLabel}>Add Note (Optional):</Text>
              <TextInput
                style={styles.highlightTextInput}
                placeholder="Add your thoughts or comments..."
                placeholderTextColor={colors.textTertiary}
                value={highlightNote}
                onChangeText={setHighlightNote}
                multiline
                numberOfLines={3}
                autoFocus={true}
              />
            </View>
          </View>

          <View style={styles.highlightModalActions}>
            <TouchableOpacity
              style={styles.highlightModalCancelButton}
              onPress={cancelHighlightModal}
            >
              <Text style={styles.highlightModalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.highlightModalSaveButton, !highlightText.trim() && styles.highlightModalSaveButtonDisabled]}
              onPress={saveHighlight}
              disabled={!highlightText.trim()}
            >
              <Ionicons name="bookmark" size={20} color={colors.textPrimary} />
              <Text style={styles.highlightModalSaveButtonText}>Save Highlight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 24,
  },
  summarySection: {
    marginBottom: 24,
  },
  keyPointsSection: {
    marginBottom: 24,
  },
  contentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  keyPointBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  highlightedText: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightContainer: {
    flex: 1,
    padding: 20,
  },
  highlightHeader: {
    marginBottom: 24,
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  highlightsList: {
    flex: 1,
  },
  highlightCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  highlightContent: {
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  highlightNote: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  highlightDate: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
  },
  selectionHint: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionHintText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  highlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  highlightButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  selectTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectTextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  highlightModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  highlightModalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  highlightModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  highlightModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightModalCloseButton: {
    padding: 4,
  },
  highlightModalBody: {
    marginBottom: 20,
  },
  highlightInputContainer: {
    marginBottom: 16,
  },
  highlightInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selectedTextContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
  },
  selectedText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  highlightTextInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 80,
  },
  highlightModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightModalCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightModalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  highlightModalSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  highlightModalSaveButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.7,
  },
  highlightModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  // Quiz Styles
  quizProgress: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  questionContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedOptionCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  correctOptionCard: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  wrongOptionCard: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  optionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  quizNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    alignSelf: 'center',
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Flashcard Styles
  flashcardProgress: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flashcardProgressText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  flashcardContainer: {
    marginBottom: 20,
  },
  flashcard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 32,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  flashcardText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  flashcardQuestionContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  flashcardQuestionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  flashcardNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
     activePaginationDot: {
     backgroundColor: colors.primary,
   },
   // Quiz Container Styles
   quizContainer: {
     flex: 1,
     padding: 20,
   },
   quizHeader: {
     marginBottom: 24,
   },
   quizTitle: {
     fontSize: 20,
     fontWeight: '600',
     color: colors.textPrimary,
     marginBottom: 8,
   },
   quizSubtitle: {
     fontSize: 14,
     color: colors.textSecondary,
     lineHeight: 20,
   },
   quizContent: {
     flex: 1,
   },
   quizCard: {
     backgroundColor: colors.cardBackground,
     borderRadius: 16,
     padding: 24,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: colors.cardBorder,
   },
   quizCardTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: colors.textPrimary,
     marginTop: 16,
     marginBottom: 8,
   },
   quizCardDescription: {
     fontSize: 14,
     color: colors.textSecondary,
     textAlign: 'center',
     lineHeight: 20,
     marginBottom: 24,
   },
   quizButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.primary,
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderRadius: 25,
     gap: 8,
   },
   quizButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: colors.textPrimary,
   },
   // Flashcards Container Styles
   flashcardsContainer: {
     flex: 1,
     padding: 20,
   },
   flashcardsHeader: {
     marginBottom: 24,
   },
   flashcardsTitle: {
     fontSize: 20,
     fontWeight: '600',
     color: colors.textPrimary,
     marginBottom: 8,
   },
   flashcardsSubtitle: {
     fontSize: 14,
     color: colors.textSecondary,
     lineHeight: 20,
   },
   flashcardsContent: {
     flex: 1,
   },
   flashcardsCard: {
     backgroundColor: colors.cardBackground,
     borderRadius: 16,
     padding: 24,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: colors.cardBorder,
   },
   flashcardsCardTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: colors.textPrimary,
     marginTop: 16,
     marginBottom: 8,
   },
   flashcardsCardDescription: {
     fontSize: 14,
     color: colors.textSecondary,
     textAlign: 'center',
     lineHeight: 20,
     marginBottom: 24,
   },
   flashcardsButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.primary,
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderRadius: 25,
     gap: 8,
   },
   flashcardsButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: colors.textPrimary,
   },
   // Mind Map Container Styles
   mindMapContainer: {
     flex: 1,
     padding: 20,
   },
   mindMapHeader: {
     marginBottom: 24,
   },
   mindMapTitle: {
     fontSize: 20,
     fontWeight: '600',
     color: colors.textPrimary,
     marginBottom: 8,
   },
   mindMapSubtitle: {
     fontSize: 14,
     color: colors.textSecondary,
     lineHeight: 20,
   },
   mindMapContent: {
     flex: 1,
   },
   mindMapCard: {
     backgroundColor: colors.cardBackground,
     borderRadius: 16,
     padding: 24,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: colors.cardBorder,
   },
   mindMapCardTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: colors.textPrimary,
     marginTop: 16,
     marginBottom: 8,
   },
   mindMapCardDescription: {
     fontSize: 14,
     color: colors.textSecondary,
     textAlign: 'center',
     lineHeight: 20,
     marginBottom: 24,
   },
   mindMapButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.primary,
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderRadius: 25,
     gap: 8,
   },
   mindMapButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: colors.textPrimary,
   },
 });

