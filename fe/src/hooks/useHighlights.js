import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useHighlights = (noteId = null, limit = 50, offset = 0) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHighlights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      if (noteId) {
        response = await apiService.getHighlightsByNote(noteId);
      } else {
        response = await apiService.getHighlights(limit, offset);
      }
      
      if (response.success) {
        setData(response.data || []);
      } else {
        setError('Failed to fetch highlights');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch highlights');
    } finally {
      setIsLoading(false);
    }
  };

  const createHighlight = async (highlightData) => {
    try {
      setError(null);
      const response = await apiService.createHighlight(highlightData);
      if (response.success) {
        // Refresh highlights after creating new one
        await fetchHighlights();
        return response.data;
      } else {
        setError('Failed to create highlight');
        return null;
      }
    } catch (err) {
      setError(err.message || 'Failed to create highlight');
      return null;
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [noteId, limit, offset]);

  const refetch = () => {
    fetchHighlights();
  };

  return { data, isLoading, error, refetch, createHighlight };
};
