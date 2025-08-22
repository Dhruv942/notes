import { useState, useEffect } from 'react';
import apiService from '../services/api';

export function useNews(category = null) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      if (category) {
        // Fetch news by category
        response = await apiService.getNewsByCategory(category);
        setData(response.data || response);
      } else {
        // Fetch daily news
        response = await apiService.getDailyNews();
        setData(response.news || response.data || response);
      }
      

    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err.message || 'Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  const refetch = () => {
    fetchNews();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
