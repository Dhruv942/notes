import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Modal from 'react-native-modal';

import { colors } from '../theme/colors';
import apiService from '../services/api';
import NoteCard from '../components/NoteCard';
import UploadBottomSheet from '../components/UploadBottomSheet';
import NoteDetailModal from '../components/NoteDetailModal';
import { useNotes } from '../hooks/useNotes';


const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteDetailVisible, setNoteDetailVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Use the notes hook
  const { data: notes, isLoading: loading, error, refetch } = useNotes();
  
  // Debug logging
  console.log('🔍 [HomeScreen] Notes data:', notes);
  console.log('🔍 [HomeScreen] Loading:', loading);
  console.log('🔍 [HomeScreen] Error:', error);

  const onRefresh = async () => {
    refetch();
  };

  const handleNotePress = (note) => {
    setSelectedNote(note);
    setNoteDetailVisible(true);
  };

  const handleUploadText = async (text, title) => {
    try {
      setUploading(true);
      const response = await apiService.createNote({
        title: title || 'New Text Note',
        content: text,
        source: 'manual',
        tags: [],
        is_public: false
      });
      
      if (response && response.data) {
        Alert.alert('Success', 'Note created successfully!');
        refetch();
        setUploadModalVisible(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      Alert.alert('Error', 'Failed to create note');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadFile = async (file) => {
    try {
      setUploading(true);
      const response = await apiService.uploadFile(
        file,
        file.name,
        '',
        false
      );
      
      if (response && response.data) {
        Alert.alert('Success', 'File uploaded successfully!');
        refetch();
        setUploadModalVisible(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadWebsite = async (url) => {
    try {
      setUploading(true);
      const response = await apiService.processWebsiteUrl(url, 'Website Content');
      
      if (response && response.data) {
        Alert.alert('Success', 'Website processed successfully!');
        refetch();
        setUploadModalVisible(false);
      }
    } catch (error) {
      console.error('Error processing website:', error);
      Alert.alert('Error', `Failed to process website: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const renderNoteCard = ({ item }) => (
    <NoteCard
      note={item}
      onPress={() => handleNotePress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by uploading text, files, or website links to create your first AI-powered study notes.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setUploadModalVisible(true)}
      >
        <Ionicons name="add" size={20} color={colors.textPrimary} />
        <Text style={styles.emptyButtonText}>Create Your First Note</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Noto</Text>
            <Text style={styles.headerSubtitle}>AI Study Notes</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={colors.background}
          translucent={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your notes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.background}
        translucent={true}
      />
      
      {renderHeader()}
      
      <FlatList
        data={notes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setUploadModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Upload Bottom Sheet */}
      <UploadBottomSheet
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUploadText={handleUploadText}
        onUploadFile={handleUploadFile}
        onUploadWebsite={handleUploadWebsite}
        uploading={uploading}
      />

      {/* Note Detail Modal */}
      <NoteDetailModal
        visible={noteDetailVisible}
        note={selectedNote}
        onClose={() => {
          setNoteDetailVisible(false);
          setSelectedNote(null);
        }}
                  onRefresh={onRefresh}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    // Safe area for different devices - increased padding even more
    paddingTop: Platform.OS === 'ios' ? 80 : 32,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  searchButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    // Better touch target
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 120, // More space for FAB
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
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
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    // Better touch target
    minWidth: 60,
    minHeight: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
});
