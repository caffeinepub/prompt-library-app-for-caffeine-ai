import { useEffect } from 'react';
import { loadFromStorage, saveToStorage } from './localStorage';
import { ViewMode } from '../prompts/types';

/**
 * Hook that persists only UI preferences (viewMode) to localStorage.
 * Prompts and categories are now persisted to backend via usePromptLibrarySync.
 */
export function useAutoPersist(viewMode: ViewMode) {
  // Load view mode on mount
  useEffect(() => {
    const data = loadFromStorage();
    // View mode is loaded in App.tsx directly
  }, []);

  // Save view mode on changes
  useEffect(() => {
    saveToStorage({ viewMode });
  }, [viewMode]);
}
