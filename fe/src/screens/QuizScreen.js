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
import { useQuiz } from '../hooks/useQuiz';
import apiService from '../services/api';

export default function QuizScreen() {
  const [noteId, setNoteId] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const { data: noteQuizzes, isLoading, error, generateQuiz } = useQuiz(noteId);

  const generateFromNote = async () => {
    if (!noteId.trim()) {
      Alert.alert('Error', 'Please enter a note ID');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiService.generateQuizFromNote(noteId);
      setQuizzes(response.data || []);
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate quiz');
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
      const response = await apiService.generateCustomQuiz(customContent);
      setQuizzes(response.data || []);
      setCurrentQuizIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setScore(0);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (answerIndex) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) {
      Alert.alert('Error', 'Please select an answer');
      return;
    }

    setShowResult(true);
    const currentQuiz = quizzes[currentQuizIndex];
    if (selectedAnswer === currentQuiz.correct_answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const percentage = Math.round((score / quizzes.length) * 100);
      Alert.alert(
        'Quiz Completed!',
        `Your score: ${score}/${quizzes.length} (${percentage}%)`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentQuizIndex(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setScore(0);
            },
          },
        ]
      );
    }
  };

  const currentQuiz = quizzes[currentQuizIndex];

  const getOptionStyle = (optionIndex) => {
    if (!showResult) {
      return selectedAnswer === optionIndex ? styles.selectedOption : styles.option;
    }

    if (optionIndex === currentQuiz.correct_answer) {
      return styles.correctOption;
    } else if (optionIndex === selectedAnswer && optionIndex !== currentQuiz.correct_answer) {
      return styles.incorrectOption;
    }
    return styles.option;
  };

  const getOptionTextStyle = (optionIndex) => {
    if (!showResult) {
      return selectedAnswer === optionIndex ? styles.selectedOptionText : styles.optionText;
    }

    if (optionIndex === currentQuiz.correct_answer) {
      return styles.correctOptionText;
    } else if (optionIndex === selectedAnswer && optionIndex !== currentQuiz.correct_answer) {
      return styles.incorrectOptionText;
    }
    return styles.optionText;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      
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
            <Text style={styles.buttonText}>Generate Quiz</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Generate from Custom Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate from Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter content to generate quiz from..."
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
            <Text style={styles.buttonText}>Generate Quiz</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Display Quiz */}
      {quizzes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Question {currentQuizIndex + 1} of {quizzes.length}
          </Text>
          {score > 0 && (
            <Text style={styles.scoreText}>Score: {score}</Text>
          )}
          
          <View style={styles.quizContainer}>
            <Text style={styles.questionText}>{currentQuiz?.question || 'Loading question...'}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQuiz?.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={getOptionStyle(index)}
                  onPress={() => selectAnswer(index)}
                  disabled={showResult}
                >
                  <Text style={getOptionTextStyle(index)}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {!showResult ? (
              <TouchableOpacity
                style={[styles.checkButton, selectedAnswer === null && styles.disabledButton]}
                onPress={checkAnswer}
                disabled={selectedAnswer === null}
              >
                <Text style={styles.checkButtonText}>Check Answer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={nextQuestion}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuizIndex === quizzes.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Text>
              </TouchableOpacity>
            )}
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
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 15,
  },
  quizContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: colors.primary + '20',
  },
  correctOption: {
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: colors.success + '20',
  },
  incorrectOption: {
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: colors.error + '20',
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedOptionText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  correctOptionText: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '600',
  },
  incorrectOptionText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  checkButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
