import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';

// Create configured axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : 'https://your-production-api.com',
  timeout: 5000,
  withCredentials: true
});

export const useCoinbaseAPI = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/${endpoint}`);
        setData(response.data);
      } catch (err) {
        setError(err);
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};