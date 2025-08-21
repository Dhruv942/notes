import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../frontend/src/theme/colors';

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Compare Screen</Text>
      <Text style={styles.subtext}>Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
