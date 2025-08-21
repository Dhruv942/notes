import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useNotes = (limit = 50, offset = 0, search = '', tags = '') => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 [useNotes] Fetching notes...');
      const response = await apiService.getNotes(limit, offset, search, tags);
      console.log('🔍 [useNotes] Response received:', response);
      
      if (response && response.data) {
        console.log('🔍 [useNotes] Setting data:', response.data);
        setData(response.data || []);
      } else {
        console.log('🔍 [useNotes] Response not successful:', response);
        setError('Failed to fetch notes');
      }
    } catch (err) {
      console.error('🔍 [useNotes] Error:', err);
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [limit, offset, search, tags]);

  const refetch = () => {
    fetchNotes();
  };

  return { data, isLoading, error, refetch };
};
