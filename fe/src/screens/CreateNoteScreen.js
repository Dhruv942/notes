import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import apiService from '../services/api';

export default function CreateNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createNote = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setIsCreating(true);
      
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.trim() ? tags.trim().split(',').map(tag => tag.trim()) : [],
        type: 'text',
        source: 'manual',
        is_public: false
      };

      const response = await apiService.createNote(noteData);
      
      Alert.alert(
        'Success', 
        'Note created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setContent('');
              setTags('');
              // Navigate back
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  const cancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={cancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Note</Text>
        <TouchableOpacity 
          onPress={createNote} 
          style={[styles.headerButton, styles.saveButton]}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="checkmark" size={24} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter note title..."
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.textTertiary}
            maxLength={100}
          />
        </View>

        {/* Content Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Content *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Enter your note content..."
            value={content}
            onChangeText={setContent}
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tags Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Tags (optional)</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="Enter tags separated by commas..."
            value={tags}
            onChangeText={setTags}
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.helperText}>
            Example: study, important, todo
          </Text>
        </View>

        {/* Character Count */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Characters: {content.length}
          </Text>
          <Text style={styles.statsText}>
            Words: {content.trim() ? content.trim().split(/\s+/).length : 0}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.createButton, (!title.trim() || !content.trim() || isCreating) && styles.disabledButton]}
          onPress={createNote}
          disabled={!title.trim() || !content.trim() || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.createButtonText}>Create Note</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  helperText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
});
