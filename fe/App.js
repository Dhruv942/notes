import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, LogBox, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import NewsScreen from './src/screens/NewsScreen';
import HomeScreen from './src/screens/HomeScreen';

// Import colors
import { colors } from './src/theme/colors';

// Suppress specific warnings
LogBox.ignoreLogs([
  'Warning: TypeError: _reactNative.BackHandler.removeEventListener is not a function',
  'BackHandler.removeEventListener',
]);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const TAB_CONFIG = [
  { id: 'notes', name: '📝 Notes', icon: 'document-text', component: HomeScreen },
  { id: 'news', name: '📰 News', icon: 'newspaper', component: NewsScreen },
];

function TabNavigator() {
  const [activeTab, setActiveTab] = useState('notes');

  const ActiveComponent = TAB_CONFIG.find(tab => tab.id === activeTab)?.component || HomeScreen;

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        <ActiveComponent />
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {TAB_CONFIG.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
              size={24}
              color={activeTab === tab.id ? colors.primary : colors.textTertiary}
            />
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <TabNavigator />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTabItem: {
    // Active state styling
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
