import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import VisNetwork from 'react-native-vis-network';
import { colors } from '../theme/colors';
import { useMindMap } from '../hooks/useMindMap';

const { width, height } = Dimensions.get('window');

export default function MindMapViewer({ noteId, onClose }) {
  const { 
    data: mindMapData, 
    isLoading: loading, 
    error, 
    refetch: refetchMindMap 
  } = useMindMap(noteId, true);

  const [visData, setVisData] = useState({ nodes: [], edges: [] });
  const [networkReady, setNetworkReady] = useState(false);
  const visNetworkRef = useRef(null);

  // Convert mindmap data to vis-network format
  const convertToVisData = (data) => {
    if (!data) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    
    const processNode = (node, parentId = null, level = 0) => {
      const nodeId = nodes.length;
      
      // Handle different node types
      let nodeLabel = 'Unknown';
      if (typeof node === 'string') {
        nodeLabel = node;
      } else if (node.name) {
        nodeLabel = node.name;
      } else if (node.topic) {
        nodeLabel = node.topic;
      } else if (node.label) {
        nodeLabel = node.label;
      }
      
             nodes.push({
         id: nodeId,
         label: nodeLabel,
         level: level,
         font: { 
           size: level === 0 ? 18 : 14, 
           color: level === 0 ? '#ffffff' : '#333333',
           face: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
         },
         color: level === 0 ? '#4CAF50' : '#ffffff',
         borderColor: '#4CAF50',
         borderWidth: level === 0 ? 3 : 2,
         shape: 'box',
         size: level === 0 ? 35 : 25,
         margin: 8,
       });
      
      if (parentId !== null) {
        edges.push({
          from: parentId,
          to: nodeId,
          color: { color: '#4CAF50', width: 2 },
          smooth: { type: 'curvedCW', roundness: 0.2 },
        });
      }
      
      // Process children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          processNode(child, nodeId, level + 1);
        });
      }
      
      // Process subtopics
      if (node.subtopics && node.subtopics.length > 0) {
        node.subtopics.forEach(subtopic => {
          processNode(subtopic, nodeId, level + 1);
        });
      }
      
      return nodeId;
    };
    
    // Handle the backend data structure: { topic, subtopics }
    if (data.topic && data.subtopics) {
      // Create root node from topic
      const rootNode = { name: data.topic, subtopics: data.subtopics };
      processNode(rootNode);
    } else {
      // Handle legacy structure or direct node
      processNode(data);
    }
    
    return { nodes, edges };
  };

  // Update vis data when mindmap data changes
  useEffect(() => {
    if (mindMapData) {
      const newVisData = convertToVisData(mindMapData);
      setVisData(newVisData);
    }
  }, [mindMapData]);

  // Add event listeners when network is ready
  useEffect(() => {
    if (!networkReady || !visNetworkRef.current) {
      return;
    }

    const subscription = visNetworkRef.current.addEventListener(
      'click',
      (event) => console.log('🧠 Node clicked:', event)
    );

    return () => subscription.remove();
  }, [networkReady]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating mind map...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Mind Map</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetchMindMap}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!mindMapData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Mind Map Data</Text>
          <Text style={styles.emptyText}>Generate a mind map to visualize your note content.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VisNetwork
        data={visData}
        onLoad={() => setNetworkReady(true)}
        ref={visNetworkRef}
        options={{
                     nodes: {
             shape: 'box',
             size: 25,
             font: {
               size: 14,
               color: '#333333',
               face: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
               strokeWidth: 0,
               strokeColor: '#ffffff'
             },
             borderWidth: 2,
             borderColor: '#4CAF50',
             color: {
               background: '#ffffff',
               border: '#4CAF50',
               highlight: {
                 background: '#e8f5e8',
                 border: '#4CAF50'
               }
             },
             margin: 10,
             shadow: {
               enabled: true,
               color: 'rgba(0,0,0,0.2)',
               size: 5,
               x: 2,
               y: 2
             }
           },
                     edges: {
             color: {
               color: '#4CAF50',
               highlight: '#4CAF50',
               hover: '#4CAF50'
             },
             width: 3,
             smooth: {
               type: 'straightCross',
               roundness: 0
             },
             shadow: {
               enabled: true,
               color: 'rgba(0,0,0,0.2)',
               size: 3,
               x: 1,
               y: 1
             }
           },
          physics: {
            enabled: false
          },
          layout: {
            hierarchical: {
              direction: 'UD',
              sortMethod: 'directed',
              levelSeparation: 150,
              nodeSpacing: 200,
              treeSpacing: 200
            }
          },
                     interaction: {
             hover: true,
             tooltipDelay: 200,
             zoomView: true,
             dragView: true,
             navigationButtons: true,
             keyboard: true,
             hideEdgesOnDrag: false,
             hideEdgesOnZoom: false
           }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
