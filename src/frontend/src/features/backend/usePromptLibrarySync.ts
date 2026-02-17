import { useEffect, useCallback, useRef } from 'react';
import { useActor } from '../../hooks/useActor';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { usePromptStore } from '../prompts/promptStore';
import { useCategoryStore } from '../categories/categoryStore';
import { PromptLibraryApi } from './promptLibraryApi';
import { Prompt } from '../prompts/types';
import { toast } from 'sonner';

/**
 * Hook that syncs prompt library data with the backend.
 * Loads data after authentication and provides action wrappers for CRUD operations.
 */
export function usePromptLibrarySync() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();
  
  const setPrompts = usePromptStore((state) => state.setPrompts);
  const clearPrompts = usePromptStore((state) => state.clearPrompts);
  
  const setCategories = useCategoryStore((state) => state.setCategories);
  const clearCategories = useCategoryStore((state) => state.clearCategories);
  
  const hasLoadedRef = useRef(false);
  const apiRef = useRef<PromptLibraryApi | null>(null);

  // Initialize API when actor is available
  useEffect(() => {
    if (actor) {
      apiRef.current = new PromptLibraryApi(actor);
    } else {
      apiRef.current = null;
    }
  }, [actor]);

  // Load data from backend after authentication
  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || hasLoadedRef.current) {
      return;
    }

    const loadData = async () => {
      try {
        const api = new PromptLibraryApi(actor);
        const [backendPrompts, backendCategories] = await Promise.all([
          api.getAllPrompts(),
          api.getAllCategories(),
        ]);
        
        // Get current state for merging favorites
        const currentPrompts = usePromptStore.getState().prompts;
        
        // Merge with local favorites state
        const mergedPrompts = backendPrompts.map(bp => {
          const localPrompt = currentPrompts.find(p => p.id === bp.id);
          return {
            ...bp,
            isFavorite: localPrompt?.isFavorite || false,
            dateAdded: localPrompt?.dateAdded || bp.dateAdded,
            dateModified: localPrompt?.dateModified || bp.dateModified,
          };
        });
        
        setPrompts(mergedPrompts);
        setCategories(backendCategories);
        hasLoadedRef.current = true;
      } catch (error: any) {
        console.error('Failed to load prompts from backend:', error);
        if (error.message?.includes('Unauthorized')) {
          toast.error('Please sign in to access your prompts');
        } else {
          toast.error('Failed to load prompts from backend');
        }
      }
    };

    loadData();
  }, [isAuthenticated, actor, actorFetching, setPrompts, setCategories]);

  // Clear data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearPrompts();
      clearCategories();
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated, clearPrompts, clearCategories]);

  // Action wrappers that persist to backend
  const savePrompt = useCallback(async (prompt: Prompt) => {
    if (!apiRef.current) {
      toast.error('Not connected to backend');
      throw new Error('Not connected to backend');
    }
    
    try {
      // Get current state
      const currentCategories = useCategoryStore.getState().categories;
      const currentPrompts = usePromptStore.getState().prompts;
      
      // Find new categories that need to be persisted
      const newCategories = prompt.categories.filter(cat => {
        const trimmed = cat.trim();
        return !currentCategories.some(existing => 
          existing.toLowerCase() === trimmed.toLowerCase()
        );
      });
      
      // Persist new categories first
      for (const categoryName of newCategories) {
        const trimmed = categoryName.trim();
        if (trimmed) {
          await apiRef.current.saveCategory(trimmed);
          // Update local category store
          useCategoryStore.getState().addCategory(trimmed);
        }
      }
      
      // Now save the prompt
      await apiRef.current.savePrompt(prompt);
      
      // Update local prompt state deterministically
      const existing = currentPrompts.find(p => p.id === prompt.id);
      if (existing) {
        usePromptStore.getState().updatePrompt(prompt.id, prompt);
      } else {
        usePromptStore.getState().setPrompts([...currentPrompts, prompt]);
      }
    } catch (error: any) {
      console.error('Failed to save prompt:', error);
      toast.error('Failed to save prompt');
      throw error;
    }
  }, []);

  const deletePrompt = useCallback(async (promptId: string) => {
    if (!apiRef.current) {
      toast.error('Not connected to backend');
      throw new Error('Not connected to backend');
    }
    
    try {
      await apiRef.current.deletePrompt(promptId);
      usePromptStore.getState().deletePrompt(promptId);
    } catch (error: any) {
      console.error('Failed to delete prompt:', error);
      toast.error('Failed to delete prompt');
      throw error;
    }
  }, []);

  const saveCategory = useCallback(async (categoryName: string) => {
    if (!apiRef.current) {
      toast.error('Not connected to backend');
      throw new Error('Not connected to backend');
    }
    
    try {
      await apiRef.current.saveCategory(categoryName);
      useCategoryStore.getState().addCategory(categoryName);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryName: string) => {
    if (!apiRef.current) {
      toast.error('Not connected to backend');
      throw new Error('Not connected to backend');
    }
    
    try {
      await apiRef.current.deleteCategory(categoryName);
      useCategoryStore.getState().deleteCategory(categoryName);
      usePromptStore.getState().removeCategoryFromPrompts(categoryName);
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  }, []);

  const renameCategory = useCallback(async (oldName: string, newName: string) => {
    if (!apiRef.current) {
      toast.error('Not connected to backend');
      throw new Error('Not connected to backend');
    }
    
    try {
      // Delete old, save new
      await apiRef.current.deleteCategory(oldName);
      await apiRef.current.saveCategory(newName);
      
      // Update local state
      useCategoryStore.getState().renameCategory(oldName, newName);
      usePromptStore.getState().renameCategoryInPrompts(oldName, newName);
    } catch (error: any) {
      console.error('Failed to rename category:', error);
      toast.error('Failed to rename category');
      throw error;
    }
  }, []);

  const refreshFromBackend = useCallback(async () => {
    if (!apiRef.current) return;
    
    try {
      const [backendPrompts, backendCategories] = await Promise.all([
        apiRef.current.getAllPrompts(),
        apiRef.current.getAllCategories(),
      ]);
      
      // Get current state for merging favorites
      const currentPrompts = usePromptStore.getState().prompts;
      
      const mergedPrompts = backendPrompts.map(bp => {
        const localPrompt = currentPrompts.find(p => p.id === bp.id);
        return {
          ...bp,
          isFavorite: localPrompt?.isFavorite || false,
        };
      });
      
      setPrompts(mergedPrompts);
      setCategories(backendCategories);
    } catch (error: any) {
      console.error('Failed to refresh from backend:', error);
      toast.error('Failed to refresh data');
    }
  }, [setPrompts, setCategories]);

  return {
    isReady: !!apiRef.current && hasLoadedRef.current,
    savePrompt,
    deletePrompt,
    saveCategory,
    deleteCategory,
    renameCategory,
    refreshFromBackend,
  };
}
