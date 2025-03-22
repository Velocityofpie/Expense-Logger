// src/hooks/useCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '../services/api/categoryService';

export interface UseCategoriesResult {
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  addCategory: (category: string) => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the categories
  const refreshCategories = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch categories');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to add a new category
  const addCategory = useCallback(async (category: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you would call your API here
      // For now, we'll just add it locally
      setCategories(prevCategories => {
        // Check if category already exists
        if (prevCategories.includes(category)) {
          return prevCategories;
        }
        return [...prevCategories, category];
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add category');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return {
    categories,
    isLoading,
    error,
    refreshCategories,
    addCategory
  };
}

export default useCategories;