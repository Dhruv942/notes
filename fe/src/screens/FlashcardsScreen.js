import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { useFlashcards } from '../hooks/useFlashcards';
import apiService from '../services/api';

export default function FlashcardsScreen() {
  const [noteId, setNoteId] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const { data: noteFlashcards, isLoading, error, generateFlashcards } = useFlashcards(noteId);

  const generateFromNote = async () => {
    if (!noteId.trim()) {
      Alert.alert('Error', 'Please enter a note ID');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiService.generateFlashcardsFromNote(noteId);
      setFlashcards(response.data || []);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromContent = async () => {
    if (!customContent.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiService.generateCustomFlashcards(customContent);
      setFlashcards(response.data || []);
      setCurrentCardIndex(0);
      setShowAnswer(false);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>
      
      {/* Generate from Note ID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate from Note</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Note ID"
          value={noteId}
          onChangeText={setNoteId}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={generateFromNote}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Generate Flashcards</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Generate from Custom Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate from Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter content to generate flashcards from..."
          value={customContent}
          onChangeText={setCustomContent}
          multiline
          numberOfLines={4}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={generateFromContent}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Generate Flashcards</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Display Flashcards */}
      {flashcards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Flashcards ({currentCardIndex + 1} of {flashcards.length})
          </Text>
          
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <Text style={styles.cardQuestion}>{currentCard?.question || 'Loading question...'}</Text>
              
              <TouchableOpacity
                style={styles.answerButton}
                onPress={toggleAnswer}
              >
                <Text style={styles.answerButtonText}>
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Text>
              </TouchableOpacity>
              
              {showAnswer && (
                <Text style={styles.cardAnswer}>{currentCard?.answer || 'No answer available'}</Text>
              )}
            </View>
            
            <View style={styles.navigation}>
              <TouchableOpacity
                style={[styles.navButton, currentCardIndex === 0 && styles.disabledButton]}
                onPress={previousCard}
                disabled={currentCardIndex === 0}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.navButton, currentCardIndex === flashcards.length - 1 && styles.disabledButton]}
                onPress={nextCard}
                disabled={currentCardIndex === flashcards.length - 1}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    marginBottom: 20,
  },
  cardQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
    lineHeight: 24,
  },
  answerButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  answerButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  cardAnswer: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    flex: 0.45,
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
  },
});
