import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

export default function SelectableText({ children, style, onHighlightSaved }) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [highlightText, setHighlightText] = useState('');
  const [highlightNote, setHighlightNote] = useState('');

  // Debug: Log when component renders
  console.log('SelectableText rendered with content:', children ? children.substring(0, 50) + '...' : 'No content');

  const handleTextPress = () => {
    // Show the modal directly when text is pressed
    console.log('Text pressed! Opening modal...');
    Alert.alert('Debug', 'Text was pressed! Modal should open now.');
    setShowSaveModal(true);
  };

  const handleLongPress = () => {
    // Alternative trigger for long press
    console.log('Text long pressed! Opening modal...');
    Alert.alert('Debug', 'Text was long pressed! Modal should open now.');
    setShowSaveModal(true);
  };

  const handleTouchStart = () => {
    console.log('Touch started on text!');
  };

  const handleTouchEnd = () => {
    console.log('Touch ended on text!');
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
        source: 'text_selection',
      });
      
      setShowSaveModal(false);
      setHighlightText('');
      setHighlightNote('');
      
      if (onHighlightSaved) {
        onHighlightSaved();
      }
      
      Alert.alert('Success', 'Highlight saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save highlight');
      console.error('Error saving highlight:', error);
    }
  };

  const cancelModal = () => {
    setShowSaveModal(false);
    setHighlightText('');
    setHighlightNote('');
  };

  return (
    <>
      <View style={[styles.textContainer, style]}>
        <TouchableOpacity
          style={styles.textTouchable}
          onPress={handleTextPress}
          onLongPress={handleLongPress}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          activeOpacity={0.7}
          delayPressIn={0}
          delayLongPress={500}
        >
          <Text style={styles.selectableText}>
            {children}
          </Text>
          <View style={styles.tapIndicator}>
            <Text style={styles.tapText}>👆 TAP HERE TO HIGHLIGHT</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.selectionHint}>
          <Ionicons name="bookmark-outline" size={16} color="#007AFF" />
          <Text style={styles.hintText}>Tap to create highlight</Text>
        </View>
      </View>

      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Highlight</Text>
              <TouchableOpacity
                onPress={cancelModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

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
                onPress={cancelModal}
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
    </>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    position: 'relative',
  },
  textTouchable: {
    padding: 15,
    backgroundColor: 'rgba(255, 107, 107, 0.15)', // Light red background
    minHeight: 60, // Larger touch target
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    marginVertical: 5,
  },
  selectableText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  tapIndicator: {
    backgroundColor: '#FF6B6B',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  tapText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  hintText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '500',
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
});
