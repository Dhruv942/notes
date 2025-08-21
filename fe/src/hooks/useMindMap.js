import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useMindMap = (noteId, autoGenerate = false) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateMindMap = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
             // First try to get the note to check if mindmap is already stored
       const noteResponse = await apiService.getNoteById(noteId);
       
       if (noteResponse.success && noteResponse.data.mind_map) {
         // Use stored mindmap if available
         setData(noteResponse.data.mind_map);
         return;
       }
       
       // If no stored mindmap, generate one from the backend
       const response = await apiService.generateMindMapForNote(noteId);
       
       if (response.success || response.data) {
         setData(response.data);
       } else {
         setError('Failed to generate mind map');
       }
         } catch (err) {
       setError(err.message || 'Failed to generate mind map');
     } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (noteId && autoGenerate) {
      generateMindMap();
    }
  }, [noteId, autoGenerate]);

  const refetch = () => {
    generateMindMap();
  };

  return { data, isLoading, error, refetch, generateMindMap };
};
