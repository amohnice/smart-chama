import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const useApi = (apiFunction, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { autoFetch = false, initialData = null } = options;

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFunction(...args);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    execute,
  };
};

export default useApi; 