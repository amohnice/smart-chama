import { useState } from 'react';
import { toast } from 'react-toastify';

const useFormSubmit = (submitFn) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      setError(null);
      await submitFn(values);
      toast.success('Operation completed successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      toast.error(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSubmit,
  };
};

export default useFormSubmit; 