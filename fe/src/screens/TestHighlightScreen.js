import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import SelectableText from '../components/SelectableText';

export default function TestHighlightScreen() {
  const [testCount, setTestCount] = useState(0);

  const handleSimplePress = () => {
    setTestCount(testCount + 1);
    Alert.alert('Test', `Button pressed! Count: ${testCount + 1}`);
  };

  const handleHighlightSaved = () => {
    Alert.alert('Success', 'Highlight saved from test screen!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Highlight Functionality</Text>
      
      {/* Simple test button */}
      <TouchableOpacity style={styles.testButton} onPress={handleSimplePress}>
        <Text style={styles.buttonText}>Test Button (Count: {testCount})</Text>
      </TouchableOpacity>

      {/* Test SelectableText */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Test SelectableText Component:</Text>
        <SelectableText 
          style={styles.testText}
          onHighlightSaved={handleHighlightSaved}
        >
          This is a test text. Tap on this text to create a highlight. If this works, you should see a modal open.
        </SelectableText>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Instructions:
        </Text>
        <Text style={styles.instructionText}>
          1. First tap the "Test Button" to make sure touch works
        </Text>
        <Text style={styles.instructionText}>
          2. Then tap on the text above to test highlighting
        </Text>
        <Text style={styles.instructionText}>
          3. If the modal opens, the highlighting feature works!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  testSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  testText: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
