import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useFlashcards = (noteId, autoGenerate = false) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateFlashcards = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.generateFlashcardsFromNote(noteId);
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const getFlashcardsByNote = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getFlashcardsByNote(noteId);
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (noteId && autoGenerate) {
      generateFlashcards();
    } else if (noteId) {
      getFlashcardsByNote();
    }
  }, [noteId, autoGenerate]);

  const refetch = () => {
    if (autoGenerate) {
      generateFlashcards();
    } else {
      getFlashcardsByNote();
    }
  };

  return { data, isLoading, error, refetch, generateFlashcards };
};
