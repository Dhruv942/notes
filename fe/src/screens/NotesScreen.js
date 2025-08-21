import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import SelectableText from '../components/SelectableText';
import apiService from '../services/api';

export default function NotesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [highlightText, setHighlightText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    console.log('🔄 Starting to load notes...');
    try {
      console.log('📡 Making API call to getNotes...');
      const response = await apiService.getNotes(50, 0);
      console.log('✅ API call successful!');
      console.log('📦 Response:', response);
      console.log('📊 Response.data:', response.data);
      console.log('📝 Number of notes:', response.data ? response.data.length : 'undefined');
      
      setNotes(response.data || []);
      console.log('💾 Notes state updated with:', response.data ? response.data.length : 0, 'notes');
    } catch (error) {
      console.error('❌ Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const openHighlightModal = (note) => {
    setSelectedNote(note);
    setHighlightText('');
    setHighlightNote('');
    setShowHighlightModal(true);
  };

  const saveHighlight = async () => {
    if (!highlightText.trim()) {
      Alert.alert('Error', 'Please enter text to highlight');
      return;
    }

    try {
      await apiService.createHighlight({
        content: highlightText.trim(),
        note: highlightNote.trim(),
        source: 'manual',
      });
      
      setShowHighlightModal(false);
      setHighlightText('');
      setHighlightNote('');
      setSelectedNote(null);
      
      Alert.alert('Success', 'Highlight saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save highlight');
      console.error('Error saving highlight:', error);
    }
  };

  const cancelHighlightModal = () => {
    setShowHighlightModal(false);
    setHighlightText('');
    setHighlightNote('');
    setSelectedNote(null);
  };

  const renderNotesContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (notes.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No notes available</Text>
        </View>
      );
    }

    return (
      <View style={styles.notesContainer}>
        {/* Test button to verify touch works */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => Alert.alert('Test', 'Touch is working!')}
        >
          <Text style={styles.testButtonText}>🔧 Test Touch Button - Tap Me!</Text>
        </TouchableOpacity>

        {notes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString()}
              </Text>
            </View>
            
            {note.summary && (
              <Text style={styles.noteSummary}>
                {note.summary}
              </Text>
            )}
            
            <Text style={styles.noteContent}>
              {note.content.length > 200 
                ? note.content.substring(0, 200) + '...' 
                : note.content
              }
            </Text>
            
            {note.tags && note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {note.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.noteFooter}>
              <Text style={styles.noteType}>{note.type || 'text'}</Text>
              <Text style={styles.noteSource}>{note.source || 'manual'}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIMPLER TECHNOLOGIES</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Super Obvious Test Button */}
      <TouchableOpacity 
        style={styles.superTestButton}
        onPress={() => Alert.alert('SUCCESS!', 'App is working! You should see the navigation tabs below!')}
      >
        <Text style={styles.superTestButtonText}>🚨 TAP ME TO TEST! 🚨</Text>
      </TouchableOpacity>

      {/* Navigation Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            Notes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'podcast' && styles.activeTab]}
          onPress={() => setActiveTab('podcast')}
        >
          <Text style={[styles.tabText, activeTab === 'podcast' && styles.activeTabText]}>
            Podcast
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
          onPress={() => setActiveTab('quiz')}
        >
          <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>
            Quiz
          </Text>
        </TouchableOpacity>
        

        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'flashcards' && styles.activeTab]}
          onPress={() => setActiveTab('flashcards')}
        >
          <Text style={[styles.tabText, activeTab === 'flashcards' && styles.activeTabText]}>
            Flashcards
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {renderNotesContent()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateNote')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Highlight Modal */}
      <Modal
        visible={showHighlightModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelHighlightModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Highlight</Text>
              <TouchableOpacity
                onPress={cancelHighlightModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedNote && (
              <View style={styles.noteInfo}>
                <Text style={styles.noteInfoTitle}>From: {selectedNote.title}</Text>
              </View>
            )}

            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>Text to Highlight:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter the text you want to highlight..."
                value={highlightText}
                onChangeText={setHighlightText}
                multiline
                numberOfLines={4}
                autoFocus={true}
              />
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.inputLabel}>Add Note (Optional):</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add your thoughts or comments..."
                value={highlightNote}
                onChangeText={setHighlightNote}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelHighlightModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !highlightText.trim() && styles.saveButtonDisabled]}
                onPress={saveHighlight}
                disabled={!highlightText.trim()}
              >
                <Ionicons name="bookmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Highlight</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuButton: {
    padding: 5,
  },
  superTestButton: {
    backgroundColor: '#FF0000',
    padding: 20,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFFF00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  superTestButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.textPrimary,
  },

  mainContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  notesContainer: {
    gap: 16,
  },
  noteCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  noteContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    padding: 10,
    marginTop: 5,
  },
  noteSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteType: {
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  noteSource: {
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    backgroundColor: '#f0f0f0', // Light background to see the container
    padding: 5,
    borderRadius: 8,
  },
  highlightButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    gap: 8,
    minHeight: 50, // Make sure button is tall enough
    borderWidth: 2,
    borderColor: '#0056CC',
  },
  highlightButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quizButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    gap: 8,
    minHeight: 50, // Make sure button is tall enough
    borderWidth: 2,
    borderColor: '#CC5555',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  simpleButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
    paddingHorizontal: 5,
  },
  simpleHighlightButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0056CC',
  },
  simpleQuizButton: {
    backgroundColor: '#FF6B6B',
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#CC5555',
  },
  simpleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugInfo: {
    color: '#666',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  superSimpleContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFE6E6', // Light red background
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  superHighlightButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#0056CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  superQuizButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#CC5555',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  superButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  noteInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteInfoTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  textInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  noteContainer: {
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
