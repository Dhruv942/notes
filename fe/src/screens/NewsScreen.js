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
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import { colors } from '../theme/colors';
import apiService from '../services/api';
import NewsCard from '../components/NewsCard';
import NewsCategoryCard from '../components/NewsCategoryCard';
import NewsDetailModal from '../components/NewsDetailModal';
import { useNews } from '../hooks/useNews';

const { width, height } = Dimensions.get('window');

const NEWS_CATEGORIES = [
  { id: 'all', name: 'All News', icon: 'newspaper', color: colors.primary },
  { id: 'Polity & Governance', name: 'Polity', icon: 'business', color: '#EF4444' },
  { id: 'Economy', name: 'Economy', icon: 'trending-up', color: '#10B981' },
  { id: 'Environment & Ecology', name: 'Environment', icon: 'leaf', color: '#059669' },
  { id: 'Science & Technology', name: 'Science', icon: 'flask', color: '#3B82F6' },
  { id: 'International Relations', name: 'International', icon: 'globe', color: '#8B5CF6' },
  { id: 'Current Affairs', name: 'Current Affairs', icon: 'time', color: '#F59E0B' },
];

export default function NewsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsDetailVisible, setNewsDetailVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use the news hook
  const { 
    data: newsData, 
    isLoading: loading, 
    error, 
    refetch 
  } = useNews(selectedCategory === 'all' ? null : selectedCategory);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleNewsPress = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsDetailVisible(true);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.id);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📰 Daily News</Text>
      <Text style={styles.headerSubtitle}>
        Latest UPSC/GPSC relevant news with AI insights
      </Text>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={NEWS_CATEGORIES}
        renderItem={({ item }) => (
          <NewsCategoryCard
            category={item}
            isSelected={selectedCategory === item.id}
            onPress={() => handleCategoryPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  const renderNewsItem = ({ item }) => (
    <NewsCard
      news={item}
      onPress={() => handleNewsPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyText}>No news available</Text>
      <Text style={styles.emptySubtext}>
        {selectedCategory === 'all' 
          ? 'Check back later for the latest news'
          : `No ${selectedCategory} news available`
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading news...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color={colors.error} />
      <Text style={styles.errorText}>Failed to load news</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refetch}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (!newsData || newsData.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={newsData}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.newsList}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <View style={styles.gradient}>
        {renderHeader()}
        
        <View style={styles.content}>
          {renderCategories()}
          
          <View style={styles.newsSection}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            {renderContent()}
          </View>
        </View>
      </View>

      <NewsDetailModal
        visible={newsDetailVisible}
        news={selectedNews}
        onClose={() => setNewsDetailVisible(false)}
      />
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  newsSection: {
    flex: 1,
  },
  newsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
