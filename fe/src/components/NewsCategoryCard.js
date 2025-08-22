import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


import { colors } from '../theme/colors';

export default function NewsCategoryCard({ category, isSelected, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.selectedContainer]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.card, isSelected && { backgroundColor: category.color }]}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={category.icon} 
            size={20} 
            color={isSelected ? colors.white : category.color} 
          />
        </View>
        <Text style={[styles.name, isSelected && styles.selectedName]}>
          {category.name}
                 </Text>
       </View>
     </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  selectedContainer: {
    transform: [{ scale: 1.05 }],
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedName: {
    color: colors.white,
    fontWeight: '700',
  },
});
