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
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Modal from 'react-native-modal';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

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
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
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
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '60%',
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
    // Safe area for different devices
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    // Better touch target
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    // Better touch target
    minHeight: 48,
    // Smooth transitions
    transform: [{ scale: 1 }],
  },
  activeTab: {
    backgroundColor: colors.primary + '15', // 15% opacity
    transform: [{ scale: 1.02 }],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
    // Better text rendering
    includeFontPadding: false,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tabSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: '400',
  },
  titleInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    // Better touch target
    minHeight: 56,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    height: 140,
    marginBottom: 28,
    textAlignVertical: 'top',
    fontWeight: '400',
  },
  urlInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
    // Better touch target
    minHeight: 56,
    fontWeight: '500',
  },
  fileTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  fileType: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    minWidth: 80,
  },
  fileTypeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    // Better touch target
    minHeight: 56,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.surfaceSecondary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
});

