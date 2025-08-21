import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Modal from 'react-native-modal';
import { colors } from '../theme/colors';

export default function UploadBottomSheet({
  visible,
  onClose,
  onUploadText,
  onUploadFile,
  onUploadWebsite,
  uploading = false,
}) {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleTextSubmit = () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }
    onUploadText(text.trim(), title.trim() || 'New Text Note');
    setText('');
    setTitle('');
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'audio/*',
          'video/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        onUploadFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleWebsiteSubmit = () => {
    if (!websiteUrl.trim()) {
      Alert.alert('Error', 'Please enter a website URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(websiteUrl.trim());
      onUploadWebsite(websiteUrl.trim());
      setWebsiteUrl('');
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid URL');
    }
  };

  const renderTextTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Create Text Note</Text>
      <Text style={styles.tabSubtitle}>
        Write or paste your content and AI will generate notes, quiz, and flashcards.
      </Text>
      
      <TextInput
        style={styles.titleInput}
        placeholder="Note title (optional)"
        placeholderTextColor={colors.textTertiary}
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.textInput}
        placeholder="Enter your text here..."
        placeholderTextColor={colors.textTertiary}
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
      />
      
      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleTextSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <>
            <Ionicons name="send" size={20} color={colors.textPrimary} />
            <Text style={styles.submitButtonText}>Create Note</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderFileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Upload File</Text>
      <Text style={styles.tabSubtitle}>
        Upload PDF, DOC, TXT, or audio files. AI will extract and process the content.
      </Text>
      
      <View style={styles.fileTypesContainer}>
        <View style={styles.fileType}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
          <Text style={styles.fileTypeText}>PDF</Text>
        </View>
        <View style={styles.fileType}>
          <Ionicons name="document" size={24} color={colors.info} />
          <Text style={styles.fileTypeText}>DOC</Text>
        </View>
        <View style={styles.fileType}>
          <Ionicons name="text" size={24} color={colors.success} />
          <Text style={styles.fileTypeText}>TXT</Text>
        </View>
        <View style={styles.fileType}>
          <Ionicons name="musical-notes" size={24} color={colors.accent} />
          <Text style={styles.fileTypeText}>Audio</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleFileUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color={colors.textPrimary} />
            <Text style={styles.submitButtonText}>Choose File</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderWebsiteTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Website Link</Text>
      <Text style={styles.tabSubtitle}>
        Enter a website URL and AI will summarize the content for you.
      </Text>
      
      <TextInput
        style={styles.urlInput}
        placeholder="https://example.com"
        placeholderTextColor={colors.textTertiary}
        value={websiteUrl}
        onChangeText={setWebsiteUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      
      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
        onPress={handleWebsiteSubmit}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <>
            <Ionicons name="globe" size={20} color={colors.textPrimary} />
            <Text style={styles.submitButtonText}>Process Website</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Content</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'text' && styles.activeTab]}
            onPress={() => setActiveTab('text')}
          >
            <Ionicons 
              name="create" 
              size={20} 
              color={activeTab === 'text' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>
              Text
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'file' && styles.activeTab]}
            onPress={() => setActiveTab('file')}
          >
            <Ionicons 
              name="document-text" 
              size={20} 
              color={activeTab === 'file' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'file' && styles.activeTabText]}>
              File
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'website' && styles.activeTab]}
            onPress={() => setActiveTab('website')}
          >
            <Ionicons 
              name="globe" 
              size={20} 
              color={activeTab === 'website' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, activeTab === 'website' && styles.activeTabText]}>
              Website
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'text' && renderTextTab()}
          {activeTab === 'file' && renderFileTab()}
          {activeTab === 'website' && renderWebsiteTab()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 400,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.surfaceSecondary,
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
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  titleInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    height: 120,
    marginBottom: 24,
  },
  urlInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  fileTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  fileType: {
    alignItems: 'center',
  },
  fileTypeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
});

