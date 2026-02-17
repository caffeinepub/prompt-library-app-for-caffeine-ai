import { useEffect } from 'react';
import { usePromptStore } from '../prompts/promptStore';
import { useCategoryStore } from '../categories/categoryStore';
import { loadFromStorage, saveToStorage } from './localStorage';
import { ViewMode } from '../prompts/types';

export function useAutoPersist(viewMode: ViewMode) {
  const prompts = usePromptStore((state) => state.prompts);
  const setPrompts = usePromptStore((state) => state.setPrompts);
  const categories = useCategoryStore((state) => state.categories);
  const setCategories = useCategoryStore((state) => state.setCategories);

  // Load on mount
  useEffect(() => {
    const data = loadFromStorage();
    if (data) {
      setPrompts(data.prompts);
      setCategories(data.categories);
    }
  }, [setPrompts, setCategories]);

  // Save on changes
  useEffect(() => {
    saveToStorage({ prompts, categories, viewMode });
  }, [prompts, categories, viewMode]);
}
