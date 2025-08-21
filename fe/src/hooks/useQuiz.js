import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useQuiz = (noteId, autoGenerate = false) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.generateQuizFromNote(noteId);
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizByNote = async () => {
    if (!noteId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getQuizzesByNote(noteId);
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (noteId && autoGenerate) {
      generateQuiz();
    } else if (noteId) {
      getQuizByNote();
    }
  }, [noteId, autoGenerate]);

  const refetch = () => {
    if (autoGenerate) {
      generateQuiz();
    } else {
      getQuizByNote();
    }
  };

  return { data, isLoading, error, refetch, generateQuiz };
};
