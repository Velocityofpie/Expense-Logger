// src/hooks/useTags.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchTags } from '../services/api/tagService';

export interface UseTagsResult {
  tags: string[];
  isLoading: boolean;
  error: string | null;
  refreshTags: () => Promise<void>;
  addTag: (tag: string) => Promise<void>;
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the tags
  const refreshTags = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedTags = await fetchTags();
      setTags(fetchedTags);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch tags');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to add a new tag
  const addTag = useCallback(async (tag: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you would call your API here
      // For now, we'll just add it locally
      setTags(prevTags => {
        // Check if tag already exists
        if (prevTags.includes(tag)) {
          return prevTags;
        }
        return [...prevTags, tag];
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add tag');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tags on mount
  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  return {
    tags,
    isLoading,
    error,
    refreshTags,
    addTag
  };
}

export default useTags;